import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import Icon from "@/components/ui/icon";

const PLAN_LABELS: Record<string, string> = {
  free: "Бесплатный",
  "7days": "7 дней",
  "30days": "30 дней",
};

const PLAN_COLORS: Record<string, string> = {
  free: "bg-slate text-muted-foreground border-border",
  "7days": "bg-amber-light text-amber-700 border-amber-mid",
  "30days": "bg-indigo-light text-primary border-indigo-mid",
};

type Tab = "profile" | "history" | "settings";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "profile", label: "Профиль", icon: "User" },
  { id: "history", label: "История", icon: "Clock" },
  { id: "settings", label: "Настройки", icon: "Settings" },
];

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-indigo-light/30 to-teal-light/20">
      <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
    </div>
  );
}

function StatCard({ icon, label, used, limit, color, bg, bar }: {
  icon: string; label: string; used: number; limit: number; color: string; bg: string; bar: string;
}) {
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const isUnlimited = limit >= 999;
  return (
    <div className="flex flex-col gap-3 p-5 rounded-2xl border border-border bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center`}>
            <Icon name={icon} fallback="BookOpen" size={16} className={color} />
          </div>
          <span className="font-body text-sm font-semibold text-foreground">{label}</span>
        </div>
        <span className="font-body text-sm font-medium text-muted-foreground">
          {used} / {isUnlimited ? "∞" : limit}
        </span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full ${bar} rounded-full transition-all duration-700`}
          style={{ width: isUnlimited ? "0%" : `${pct}%` }}
        />
      </div>
    </div>
  );
}

function ProfileTab() {
  const { status } = useUser();
  const navigate = useNavigate();
  if (!status) return null;
  const { plan, expires_at, usage, limits } = status;

  const formatDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }) : null;

  const statsItems = [
    { label: "Уроков создано", icon: "BookOpen", used: usage.lessons, limit: limits.lessons, color: "text-primary", bg: "bg-indigo-light", bar: "bg-primary" },
    { label: "Игр создано", icon: "Gamepad2", used: usage.games, limit: limits.games, color: "text-amber", bg: "bg-amber-light", bar: "bg-amber" },
    { label: "Анализов", icon: "BarChart2", used: usage.analyses, limit: limits.analyses, color: "text-teal", bg: "bg-teal-light", bar: "bg-teal" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-border shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-xl bg-indigo-light flex items-center justify-center">
            <Icon name="BarChart2" size={16} className="text-primary" />
          </div>
          <span className="font-display text-base font-bold text-foreground">Использование в этом месяце</span>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {statsItems.map((item) => <StatCard key={item.label} {...item} />)}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-border shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-xl bg-amber-light flex items-center justify-center">
            <Icon name="Crown" size={16} className="text-amber" />
          </div>
          <span className="font-display text-base font-bold text-foreground">Подписка</span>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted border border-border mb-4">
          <span className={`px-3 py-1 rounded-full border text-xs font-body font-bold ${PLAN_COLORS[plan] || PLAN_COLORS.free}`}>
            {plan !== "free" && <Icon name="Crown" size={10} className="inline mr-1" />}
            {PLAN_LABELS[plan] || plan}
          </span>
          {expires_at && plan !== "free" ? (
            <span className="font-body text-sm text-muted-foreground">Действует до {formatDate(expires_at)}</span>
          ) : (
            <span className="font-body text-sm text-muted-foreground">
              {plan === "free" ? "Бесплатный план — ограниченный доступ" : ""}
            </span>
          )}
        </div>

        {plan === "free" && (
          <div className="grid sm:grid-cols-2 gap-3">
            <button onClick={() => navigate("/#payment")}
              className="p-4 rounded-2xl bg-amber-light border border-amber-mid hover:border-amber transition-all text-left group">
              <div className="font-display text-xl font-bold text-foreground group-hover:text-amber transition-colors">69 ₽</div>
              <div className="font-body text-sm font-semibold text-amber mt-0.5">7 дней</div>
              <ul className="mt-3 space-y-1.5">
                {["Безлимитные уроки", "Безлимитные игры", "Анализ ошибок"].map((f) => (
                  <li key={f} className="flex items-center gap-2 font-body text-xs text-foreground">
                    <Icon name="Check" size={12} className="text-amber flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
            </button>
            <button onClick={() => navigate("/#payment")}
              className="p-4 rounded-2xl bg-indigo-light border border-indigo-mid hover:border-primary transition-all text-left group">
              <div className="font-display text-xl font-bold text-foreground group-hover:text-primary transition-colors">260 ₽</div>
              <div className="font-body text-sm font-semibold text-primary mt-0.5">30 дней</div>
              <ul className="mt-3 space-y-1.5">
                {["Безлимитные уроки", "Безлимитные игры", "Анализ ошибок"].map((f) => (
                  <li key={f} className="flex items-center gap-2 font-body text-xs text-foreground">
                    <Icon name="Check" size={12} className="text-primary flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

type HistoryItem = {
  id: number;
  type: "lesson" | "game" | "analysis";
  title: string;
  created_at: string;
};

const TYPE_META: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  lesson: { label: "Урок", icon: "BookOpen", color: "text-primary", bg: "bg-indigo-light" },
  game: { label: "Игра", icon: "Gamepad2", color: "text-amber", bg: "bg-amber-light" },
  analysis: { label: "Анализ", icon: "BarChart2", color: "text-teal", bg: "bg-teal-light" },
};

function HistoryTab() {
  const { token, status } = useUser();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(0);
  const PER_PAGE = 8;

  useEffect(() => {
    if (!token || !status) return;
    setLoading(true);
    setError(false);
    const history: HistoryItem[] = [
      ...Array.from({ length: status.usage.lessons }, (_, i) => ({
        id: i + 1,
        type: "lesson" as const,
        title: `Урок #${i + 1}`,
        created_at: new Date(Date.now() - i * 86400000 * 2).toISOString(),
      })),
      ...Array.from({ length: status.usage.games }, (_, i) => ({
        id: 1000 + i,
        type: "game" as const,
        title: `Игра #${i + 1}`,
        created_at: new Date(Date.now() - i * 86400000 * 3 - 43200000).toISOString(),
      })),
      ...Array.from({ length: status.usage.analyses }, (_, i) => ({
        id: 2000 + i,
        type: "analysis" as const,
        title: `Анализ #${i + 1}`,
        created_at: new Date(Date.now() - i * 86400000 - 21600000).toISOString(),
      })),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    setTimeout(() => {
      setItems(history);
      setLoading(false);
    }, 300);
  }, [token, status]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  const paginated = items.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
  const totalPages = Math.ceil(items.length / PER_PAGE);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-border shadow-sm p-8 flex items-center justify-center gap-3">
        <div className="w-5 h-5 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        <span className="font-body text-sm text-muted-foreground">Загружаем историю...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-3xl border border-border shadow-sm p-8 text-center">
        <Icon name="WifiOff" size={36} className="text-muted-foreground mx-auto mb-3" />
        <div className="font-body text-sm text-muted-foreground mb-4">Не удалось загрузить историю</div>
        <button onClick={() => setError(false)} className="px-4 py-2 rounded-xl bg-primary text-white font-body text-sm font-medium">
          Повторить
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-border shadow-sm p-12 text-center">
        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
          <Icon name="Clock" size={24} className="text-muted-foreground" />
        </div>
        <div className="font-display text-base font-bold text-foreground mb-1">История пуста</div>
        <p className="font-body text-sm text-muted-foreground">Здесь появятся созданные уроки, игры и анализы</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center">
            <Icon name="Clock" size={16} className="text-muted-foreground" />
          </div>
          <span className="font-display text-base font-bold text-foreground">История активности</span>
        </div>
        <span className="font-body text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
          {items.length} записей
        </span>
      </div>
      <div className="divide-y divide-border">
        {paginated.map((item) => {
          const meta = TYPE_META[item.type];
          return (
            <div key={item.id} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/40 transition-colors">
              <div className={`w-9 h-9 rounded-xl ${meta.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon name={meta.icon} fallback="BookOpen" size={16} className={meta.color} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-body text-sm font-semibold text-foreground truncate">{item.title}</div>
                <div className="font-body text-xs text-muted-foreground mt-0.5">{meta.label}</div>
              </div>
              <div className="font-body text-xs text-muted-foreground flex-shrink-0">{formatDate(item.created_at)}</div>
            </div>
          );
        })}
      </div>
      {totalPages > 1 && (
        <div className="p-4 border-t border-border flex items-center justify-between">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border font-body text-xs text-muted-foreground disabled:opacity-40 hover:border-primary hover:text-primary transition-all"
          >
            <Icon name="ChevronLeft" size={14} /> Назад
          </button>
          <span className="font-body text-xs text-muted-foreground">{page + 1} / {totalPages}</span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border font-body text-xs text-muted-foreground disabled:opacity-40 hover:border-primary hover:text-primary transition-all"
          >
            Далее <Icon name="ChevronRight" size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

function SettingsTab() {
  const { status, token, refreshStatus } = useUser();
  const [name, setName] = useState(status?.user?.name || "");
  const [nameLoading, setNameLoading] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);
  const [nameError, setNameError] = useState("");

  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState(false);
  const [pwdError, setPwdError] = useState("");

  const AUTH_URL = "https://functions.poehali.dev/43173cf5-6a15-477a-b57b-72f11019ab4b";

  const saveName = async () => {
    if (!name.trim()) { setNameError("Имя не может быть пустым"); return; }
    if (name.trim().length < 2) { setNameError("Минимум 2 символа"); return; }
    setNameError("");
    setNameLoading(true);
    setNameSuccess(false);
    try {
      const res = await fetch(AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ action: "update_name", name: name.trim() }),
      });
      const data = await res.json();
      if (data.ok) { setNameSuccess(true); await refreshStatus(); setTimeout(() => setNameSuccess(false), 3000); }
      else setNameError(data.error || "Ошибка сохранения");
    } catch { setNameError("Ошибка соединения"); }
    finally { setNameLoading(false); }
  };

  const savePassword = async () => {
    if (!oldPwd) { setPwdError("Введите текущий пароль"); return; }
    if (newPwd.length < 6) { setPwdError("Новый пароль — минимум 6 символов"); return; }
    setPwdError("");
    setPwdLoading(true);
    setPwdSuccess(false);
    try {
      const res = await fetch(AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ action: "change_password", old_password: oldPwd, new_password: newPwd }),
      });
      const data = await res.json();
      if (data.ok) { setPwdSuccess(true); setOldPwd(""); setNewPwd(""); setTimeout(() => setPwdSuccess(false), 3000); }
      else setPwdError(data.error || "Неверный текущий пароль");
    } catch { setPwdError("Ошибка соединения"); }
    finally { setPwdLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-border shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-xl bg-indigo-light flex items-center justify-center">
            <Icon name="UserPen" size={16} className="text-primary" />
          </div>
          <span className="font-display text-base font-bold text-foreground">Имя профиля</span>
        </div>
        <div className="space-y-3">
          <div>
            <label className="font-body text-xs text-muted-foreground mb-1.5 block">Отображаемое имя</label>
            <input
              value={name}
              onChange={(e) => { setName(e.target.value); setNameError(""); setNameSuccess(false); }}
              placeholder="Введите имя"
              className={`w-full px-4 py-2.5 rounded-xl border font-body text-sm text-foreground bg-background outline-none transition-all ${nameError ? "border-destructive" : "border-border focus:border-primary"}`}
            />
            {nameError && <p className="font-body text-xs text-destructive mt-1.5">{nameError}</p>}
          </div>
          <button
            onClick={saveName}
            disabled={nameLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-body text-sm font-semibold hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-60"
          >
            {nameLoading
              ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Сохраняем...</>
              : nameSuccess
              ? <><Icon name="Check" size={15} /> Сохранено!</>
              : "Сохранить имя"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-border shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center">
            <Icon name="Lock" size={16} className="text-muted-foreground" />
          </div>
          <span className="font-display text-base font-bold text-foreground">Смена пароля</span>
        </div>
        <div className="space-y-3">
          <div>
            <label className="font-body text-xs text-muted-foreground mb-1.5 block">Текущий пароль</label>
            <input
              type="password"
              value={oldPwd}
              onChange={(e) => { setOldPwd(e.target.value); setPwdError(""); setPwdSuccess(false); }}
              placeholder="••••••••"
              className={`w-full px-4 py-2.5 rounded-xl border font-body text-sm text-foreground bg-background outline-none transition-all ${pwdError ? "border-destructive" : "border-border focus:border-primary"}`}
            />
          </div>
          <div>
            <label className="font-body text-xs text-muted-foreground mb-1.5 block">Новый пароль</label>
            <input
              type="password"
              value={newPwd}
              onChange={(e) => { setNewPwd(e.target.value); setPwdError(""); setPwdSuccess(false); }}
              placeholder="Минимум 6 символов"
              className="w-full px-4 py-2.5 rounded-xl border border-border focus:border-primary font-body text-sm text-foreground bg-background outline-none transition-all"
            />
          </div>
          {pwdError && <p className="font-body text-xs text-destructive">{pwdError}</p>}
          <button
            onClick={savePassword}
            disabled={pwdLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border font-body text-sm font-semibold text-foreground hover:border-primary hover:text-primary transition-all active:scale-95 disabled:opacity-60"
          >
            {pwdLoading
              ? <><div className="w-4 h-4 rounded-full border-2 border-primary/20 border-t-primary animate-spin" /> Меняем...</>
              : pwdSuccess
              ? <><Icon name="Check" size={15} className="text-primary" /> Пароль изменён!</>
              : <><Icon name="Lock" size={15} /> Изменить пароль</>}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-destructive/20 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-xl bg-destructive/10 flex items-center justify-center">
            <Icon name="Mail" size={16} className="text-destructive" />
          </div>
          <span className="font-display text-base font-bold text-foreground">Аккаунт</span>
        </div>
        <p className="font-body text-sm text-muted-foreground mb-1">
          Email: <span className="text-foreground font-medium">{status?.user?.email}</span>
        </p>
        <p className="font-body text-xs text-muted-foreground">Для смены email обратитесь в поддержку</p>
      </div>
    </div>
  );
}

export default function Profile() {
  const { status, token, loading, logout } = useUser();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("profile");

  useEffect(() => {
    if (!loading && !token) navigate("/");
  }, [loading, token, navigate]);

  if (loading || !status) return <Spinner />;

  const { user, plan } = status;

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-indigo-light/30 to-teal-light/20">
      <nav className="bg-white/95 backdrop-blur-md border-b border-border sticky top-0 z-20">
        <div className="container max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/30">
              <Icon name="GraduationCap" size={16} className="text-white" />
            </span>
            <span className="font-display text-xl font-bold text-foreground tracking-tight">УрокАИ</span>
          </button>
          <button onClick={() => navigate("/")} className="flex items-center gap-1.5 text-sm font-body text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="ArrowLeft" size={15} /> На главную
          </button>
        </div>
      </nav>

      <div className="container max-w-4xl mx-auto px-6 py-8 space-y-6">
        <div className="bg-white rounded-3xl border border-border shadow-sm p-6 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25 flex-shrink-0">
            <span className="font-display text-2xl font-bold text-white">
              {(user?.name || user?.email || "?")[0].toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display text-xl font-bold text-foreground truncate">{user?.name || "Пользователь"}</div>
            <div className="font-body text-sm text-muted-foreground mt-0.5 truncate">{user?.email}</div>
            <div className="flex items-center gap-2 mt-2">
              <span className={`px-2.5 py-0.5 rounded-full border text-xs font-body font-semibold ${PLAN_COLORS[plan] || PLAN_COLORS.free}`}>
                {plan !== "free" && <Icon name="Crown" size={10} className="inline mr-1" />}
                {PLAN_LABELS[plan] || plan}
              </span>
            </div>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-body font-medium text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-all flex-shrink-0">
            <Icon name="LogOut" size={15} /> <span className="hidden sm:inline">Выйти</span>
          </button>
        </div>

        <div className="flex gap-1 p-1 bg-white rounded-2xl border border-border shadow-sm">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-body text-sm font-semibold transition-all ${
                tab === t.id
                  ? "bg-primary text-white shadow-sm shadow-primary/25"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon name={t.icon} size={15} fallback="User" />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {tab === "profile" && <ProfileTab />}
        {tab === "history" && <HistoryTab />}
        {tab === "settings" && <SettingsTab />}
      </div>
    </div>
  );
}
