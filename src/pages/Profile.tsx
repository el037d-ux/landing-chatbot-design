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

export default function Profile() {
  const { status, token, logout } = useUser();
  const navigate = useNavigate();

  if (!token || !status) {
    navigate("/");
    return null;
  }

  const { user, plan, expires_at, usage, limits } = status;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return null;
    return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
  };

  const usageItems = [
    { label: "Уроков создано", icon: "BookOpen", used: usage.lessons, limit: limits.lessons, color: "text-primary", bg: "bg-indigo-light", bar: "bg-primary" },
    { label: "Игр создано", icon: "Gamepad2", used: usage.games, limit: limits.games, color: "text-amber", bg: "bg-amber-light", bar: "bg-amber" },
    { label: "Анализов", icon: "BarChart2", used: usage.analyses, limit: limits.analyses, color: "text-teal", bg: "bg-teal-light", bar: "bg-teal" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-indigo-light/30 to-teal-light/20">
      {/* Navbar */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-border">
        <div className="container max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/30">
              <Icon name="GraduationCap" size={16} className="text-white" />
            </span>
            <span className="font-display text-xl font-bold text-foreground tracking-tight">УрокАИ</span>
          </button>
          <button onClick={() => navigate("/")} className="flex items-center gap-1.5 text-sm font-body text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="ArrowLeft" size={15} />
            На главную
          </button>
        </div>
      </nav>

      <div className="container max-w-4xl mx-auto px-6 py-10 space-y-6">

        {/* Шапка профиля */}
        <div className="bg-white rounded-3xl border border-border shadow-sm p-8 flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25 flex-shrink-0">
            <span className="font-display text-2xl font-bold text-white">
              {(user?.name || user?.email || "?")[0].toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display text-2xl font-bold text-foreground truncate">
              {user?.name || "Пользователь"}
            </div>
            <div className="font-body text-sm text-muted-foreground mt-0.5 truncate">{user?.email}</div>
            <div className="flex items-center gap-2 mt-2">
              <span className={`px-2.5 py-0.5 rounded-full border text-xs font-body font-semibold ${PLAN_COLORS[plan] || PLAN_COLORS.free}`}>
                {plan !== "free" && <Icon name="Crown" size={10} className="inline mr-1" />}
                {PLAN_LABELS[plan] || plan}
              </span>
              {expires_at && plan !== "free" && (
                <span className="font-body text-xs text-muted-foreground">до {formatDate(expires_at)}</span>
              )}
            </div>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-body font-medium text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-all flex-shrink-0">
            <Icon name="LogOut" size={15} />
            Выйти
          </button>
        </div>

        {/* Использование */}
        <div className="bg-white rounded-3xl border border-border shadow-sm p-8">
          <div className="font-display text-lg font-bold text-foreground mb-6">Использование</div>
          <div className="space-y-5">
            {usageItems.map((item) => {
              const pct = limits[item.label === "Уроков создано" ? "lessons" : item.label === "Игр создано" ? "games" : "analyses"] > 0
                ? Math.min(100, Math.round((item.used / item.limit) * 100))
                : 0;
              return (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg ${item.bg} flex items-center justify-center`}>
                        <Icon name={item.icon} fallback="BookOpen" size={14} className={item.color} />
                      </div>
                      <span className="font-body text-sm font-medium text-foreground">{item.label}</span>
                    </div>
                    <span className="font-body text-sm text-muted-foreground">
                      {item.used} / {item.limit === 9999 ? "∞" : item.limit}
                    </span>
                  </div>
                  <div className="h-2 bg-slate rounded-full overflow-hidden">
                    <div className={`h-full ${item.bar} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Подписка */}
        {plan === "free" ? (
          <div className="bg-white rounded-3xl border border-border shadow-sm p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-light flex items-center justify-center flex-shrink-0">
                <Icon name="Crown" size={22} className="text-amber" />
              </div>
              <div className="flex-1">
                <div className="font-display text-lg font-bold text-foreground mb-1">Перейти на платный план</div>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  Снимите ограничения на количество уроков и игр. Безлимитный доступ ко всем инструментам.
                </p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3 mt-6">
              <div className="p-4 rounded-2xl bg-amber-light border border-amber-mid">
                <div className="font-display text-xl font-bold text-foreground">69 ₽</div>
                <div className="font-body text-sm font-semibold text-amber mt-0.5">7 дней</div>
                <ul className="mt-3 space-y-1.5">
                  {["Безлимитные уроки","Безлимитные игры","Анализ ошибок"].map(f => (
                    <li key={f} className="flex items-center gap-2 font-body text-xs text-foreground">
                      <Icon name="Check" size={12} className="text-amber flex-shrink-0" />{f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-4 rounded-2xl bg-indigo-light border border-indigo-mid">
                <div className="font-display text-xl font-bold text-foreground">260 ₽</div>
                <div className="font-body text-sm font-semibold text-primary mt-0.5">30 дней</div>
                <ul className="mt-3 space-y-1.5">
                  {["Безлимитные уроки","Безлимитные игры","Анализ ошибок"].map(f => (
                    <li key={f} className="flex items-center gap-2 font-body text-xs text-foreground">
                      <Icon name="Check" size={12} className="text-primary flex-shrink-0" />{f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <button onClick={() => navigate("/#payment")}
              className="w-full mt-4 py-3 rounded-xl bg-primary text-white font-body text-sm font-bold hover:bg-primary/90 transition-all active:scale-95 shadow-md shadow-primary/25">
              Выбрать план
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-border shadow-sm p-8 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-light flex items-center justify-center flex-shrink-0">
              <Icon name="Crown" size={22} className="text-primary" />
            </div>
            <div>
              <div className="font-display text-lg font-bold text-foreground">Подписка активна</div>
              <div className="font-body text-sm text-muted-foreground mt-0.5">
                Тариф «{PLAN_LABELS[plan]}» · {expires_at ? `Действует до ${formatDate(expires_at)}` : ""}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
