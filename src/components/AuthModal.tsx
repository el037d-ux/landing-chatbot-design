import { useState } from "react";
import Icon from "@/components/ui/icon";

export default function AuthModal({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [login, setLogin] = useState({ email: "", password: "" });
  const [reg, setReg] = useState({ lastName: "", firstName: "", middleName: "", phone: "", email: "" });

  const switchMode = (m: "login" | "register") => {
    setMode(m);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-fade-in-up overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-border">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white text-xs font-bold font-body">У</span>
              </span>
              <span className="font-display text-lg font-semibold text-foreground">УрокАИ</span>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-warm flex items-center justify-center transition-colors">
              <Icon name="X" size={16} className="text-muted-foreground" />
            </button>
          </div>
          {/* Tabs */}
          <div className="flex gap-1 bg-warm rounded-xl p-1">
            <button
              onClick={() => switchMode("login")}
              className={`flex-1 py-2 rounded-lg font-body text-sm font-medium transition-all ${mode === "login" ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >Войти</button>
            <button
              onClick={() => switchMode("register")}
              className={`flex-1 py-2 rounded-lg font-body text-sm font-medium transition-all ${mode === "register" ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >Регистрация</button>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-7">
          {mode === "login" ? (
            <div className="space-y-4">
              <div>
                <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Логин (Email)</label>
                <div className="relative">
                  <Icon name="Mail" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    value={login.email}
                    onChange={e => setLogin(l => ({ ...l, email: e.target.value }))}
                    placeholder="ivan@school.ru"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-warm font-body text-sm focus:outline-none focus:border-green/60 focus:bg-white transition-all placeholder:text-muted-foreground"
                  />
                </div>
              </div>
              <div>
                <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Пароль</label>
                <div className="relative">
                  <Icon name="Lock" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="password"
                    value={login.password}
                    onChange={e => setLogin(l => ({ ...l, password: e.target.value }))}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-warm font-body text-sm focus:outline-none focus:border-green/60 focus:bg-white transition-all placeholder:text-muted-foreground"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button className="font-body text-xs text-muted-foreground hover:text-green transition-colors">Забыли пароль?</button>
              </div>
              <button className="w-full py-3 rounded-xl bg-primary text-white font-body font-medium hover:bg-primary/90 transition-colors mt-1">
                Войти
              </button>
              <p className="text-center font-body text-sm text-muted-foreground">
                Нет аккаунта?{" "}
                <button onClick={() => switchMode("register")} className="text-green font-medium hover:underline">Зарегистрироваться</button>
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Фамилия</label>
                  <input
                    type="text"
                    value={reg.lastName}
                    onChange={e => setReg(r => ({ ...r, lastName: e.target.value }))}
                    placeholder="Иванов"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-warm font-body text-sm focus:outline-none focus:border-green/60 focus:bg-white transition-all placeholder:text-muted-foreground"
                  />
                </div>
                <div>
                  <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Имя</label>
                  <input
                    type="text"
                    value={reg.firstName}
                    onChange={e => setReg(r => ({ ...r, firstName: e.target.value }))}
                    placeholder="Иван"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-warm font-body text-sm focus:outline-none focus:border-green/60 focus:bg-white transition-all placeholder:text-muted-foreground"
                  />
                </div>
                <div>
                  <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Отчество</label>
                  <input
                    type="text"
                    value={reg.middleName}
                    onChange={e => setReg(r => ({ ...r, middleName: e.target.value }))}
                    placeholder="Иванович"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-warm font-body text-sm focus:outline-none focus:border-green/60 focus:bg-white transition-all placeholder:text-muted-foreground"
                  />
                </div>
                <div>
                  <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Телефон</label>
                  <div className="relative">
                    <Icon name="Phone" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="tel"
                      value={reg.phone}
                      onChange={e => setReg(r => ({ ...r, phone: e.target.value }))}
                      placeholder="+7 900 000-00-00"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-warm font-body text-sm focus:outline-none focus:border-green/60 focus:bg-white transition-all placeholder:text-muted-foreground"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Адрес электронной почты</label>
                  <div className="relative">
                    <Icon name="Mail" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      value={reg.email}
                      onChange={e => setReg(r => ({ ...r, email: e.target.value }))}
                      placeholder="ivan@school.ru"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-warm font-body text-sm focus:outline-none focus:border-green/60 focus:bg-white transition-all placeholder:text-muted-foreground"
                    />
                  </div>
                </div>
              </div>
              <button className="w-full py-3 rounded-xl bg-primary text-white font-body font-medium hover:bg-primary/90 transition-colors">
                Зарегистрироваться
              </button>
              <p className="text-center font-body text-sm text-muted-foreground">
                Уже есть аккаунт?{" "}
                <button onClick={() => switchMode("login")} className="text-green font-medium hover:underline">Войти</button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
