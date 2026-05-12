import { useState } from "react";
import Icon from "@/components/ui/icon";
import { useUser } from "@/context/UserContext";

export default function AuthModal({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const { login, register, loading } = useUser();

  const handleSubmit = async () => {
    setError("");
    if (!email || !password) { setError("Заполните все поля"); return; }
    const result = mode === "login"
      ? await login(email, password)
      : await register(email, password, name);
    if (result.ok) {
      onClose();
    } else {
      setError(result.error || "Ошибка");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-fade-in-up overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-5 sm:px-8 pt-6 sm:pt-8 pb-5 sm:pb-6 border-b border-border">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/30">
                <Icon name="GraduationCap" size={16} className="text-white" />
              </span>
              <span className="font-display text-lg font-bold text-foreground">УрокАИ</span>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate flex items-center justify-center transition-colors">
              <Icon name="X" size={16} className="text-muted-foreground" />
            </button>
          </div>
          <div className="flex gap-1 bg-slate rounded-xl p-1">
            {(["login","register"] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(""); }}
                className={`flex-1 py-2 rounded-lg font-body text-sm font-semibold transition-all ${mode === m ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >{m === "login" ? "Войти" : "Регистрация"}</button>
            ))}
          </div>
        </div>

        <div className="px-5 sm:px-8 py-5 sm:py-7 space-y-4">
          {mode === "register" && (
            <div>
              <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Имя</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Иван Иванов"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-slate font-body text-sm focus:outline-none focus:border-primary/40 focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground" />
            </div>
          )}
          <div>
            <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Email</label>
            <div className="relative">
              <Icon name="Mail" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ivan@school.ru"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-slate font-body text-sm focus:outline-none focus:border-primary/40 focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground" />
            </div>
          </div>
          <div>
            <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Пароль</label>
            <div className="relative">
              <Icon name="Lock" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-slate font-body text-sm focus:outline-none focus:border-primary/40 focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground" />
            </div>
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-2">
              <Icon name="AlertCircle" size={16} className="text-destructive flex-shrink-0" />
              <span className="font-body text-sm text-destructive">{error}</span>
            </div>
          )}

          <button onClick={handleSubmit} disabled={loading}
            className="w-full py-3 rounded-xl bg-primary text-white font-body font-semibold hover:bg-primary/90 transition-colors shadow-md shadow-primary/25 disabled:opacity-60 flex items-center justify-center gap-2">
            {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {mode === "login" ? "Войти" : "Зарегистрироваться"}
          </button>

          {mode === "register" && (
            <p className="font-body text-xs text-muted-foreground text-center">
              Регистрируясь, вы получаете 3 урока и 3 игры бесплатно
            </p>
          )}
        </div>
      </div>
    </div>
  );
}