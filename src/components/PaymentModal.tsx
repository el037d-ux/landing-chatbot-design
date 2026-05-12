import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";
import { useUser } from "@/context/UserContext";

const PLANS = [
  { id: "7days", label: "7 дней", price: 69, desc: "Доступ ко всем функциям на неделю", highlight: false },
  { id: "30days", label: "30 дней", price: 260, desc: "Полный доступ на месяц — выгоднее", highlight: true },
];

const AUTH_URL = "https://functions.poehali.dev/43173cf5-6a15-477a-b57b-72f11019ab4b";

type Step = "plan" | "email" | "paying" | "done";

export default function PaymentModal({ onClose }: { onClose: () => void }) {
  const { status, refreshStatus } = useUser();
  const [step, setStep] = useState<Step>("plan");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [email, setEmail] = useState(status?.user?.email || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  useEffect(() => {
    return () => stopPolling();
  }, []);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    setStep("email");
  };

  const handleStartPayment = async () => {
    setError("");
    if (!email.trim() || !email.includes("@")) {
      setError("Введите корректный email");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create_payment", email: email.trim().toLowerCase(), plan: selectedPlan }),
      });
      const data = await res.json();
      if (data.ok) {
        setPaymentId(data.payment_id);
        window.open(data.confirmation_url, "_blank");
        setStep("paying");
        startPolling(data.payment_id);
      } else {
        setError(data.error || "Ошибка создания платежа");
      }
    } catch {
      setError("Ошибка соединения");
    } finally {
      setLoading(false);
    }
  };

  const startPolling = (pid: string) => {
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(AUTH_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "check_payment", payment_id: pid }),
        });
        const data = await res.json();
        if (data.ok && data.paid) {
          stopPolling();
          if (data.token) {
            localStorage.setItem("urok_token", data.token);
            await refreshStatus();
          }
          setStep("done");
        }
      } catch {
        // продолжаем опрос
      }
    }, 3000);
  };

  const plan = PLANS.find(p => p.id === selectedPlan);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto animate-fade-in-up" onClick={e => e.stopPropagation()}>

        <div className="px-5 sm:px-8 pt-5 sm:pt-7 pb-4 sm:pb-5 border-b border-border flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-5 h-5 rounded-md bg-primary flex items-center justify-center">
                <Icon name="Crown" size={12} className="text-white" />
              </span>
              <span className="font-body text-xs font-semibold text-primary uppercase tracking-wider">Подписка</span>
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground">
              {step === "plan" && "Выберите тариф"}
              {step === "email" && "Введите email"}
              {step === "paying" && "Ожидание оплаты..."}
              {step === "done" && "Оплата прошла успешно!"}
            </h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate flex items-center justify-center transition-colors">
            <Icon name="X" size={16} className="text-muted-foreground" />
          </button>
        </div>

        <div className="px-5 sm:px-8 py-5 sm:py-6 space-y-5">

          {step === "plan" && (
            <>
              <div className="p-4 rounded-2xl bg-indigo-light border border-indigo-mid">
                <div className="font-body text-xs font-semibold text-primary uppercase tracking-wider mb-2">С подпиской доступно</div>
                <ul className="space-y-1.5">
                  {["Неограниченные планы уроков", "Неограниченные игры", "Самоанализ урока", "Приоритетная поддержка"].map(f => (
                    <li key={f} className="flex items-center gap-2 font-body text-sm text-foreground">
                      <Icon name="Check" size={14} className="text-teal flex-shrink-0" />{f}
                    </li>
                  ))}
                </ul>
              </div>

              {PLANS.map(p => (
                <div key={p.id} className={`rounded-2xl border-2 p-5 ${p.highlight ? "border-primary bg-indigo-light/30" : "border-border"}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display text-xl font-bold text-foreground">{p.label}</span>
                        {p.highlight && <span className="px-2 py-0.5 rounded-full bg-primary text-white font-body text-xs font-semibold">Выгодно</span>}
                      </div>
                      <p className="font-body text-sm text-muted-foreground mt-0.5">{p.desc}</p>
                    </div>
                    <div className="font-display text-3xl font-bold text-primary">{p.price}₽</div>
                  </div>
                  <button
                    onClick={() => handleSelectPlan(p.id)}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary text-white font-body font-bold text-sm hover:bg-primary/90 transition-all active:scale-95 shadow-sm"
                  >
                    <Icon name="CreditCard" size={16} />
                    Оплатить {p.price}₽
                  </button>
                </div>
              ))}

              <div className="p-4 rounded-2xl bg-slate border border-border text-center">
                <div className="font-body text-sm font-semibold text-foreground mb-1">Бесплатно всегда</div>
                <div className="font-body text-xs text-muted-foreground">3 плана урока · 3 игры · без самоанализа</div>
              </div>
            </>
          )}

          {step === "email" && plan && (
            <>
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-indigo-light border border-indigo-mid">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                  <Icon name="Crown" size={18} className="text-white" />
                </div>
                <div>
                  <div className="font-body text-sm font-bold text-foreground">Тариф: {plan.label}</div>
                  <div className="font-body text-xs text-muted-foreground">{plan.price}₽ · оплата картой через ЮКасса</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-light border border-amber-mid">
                <div className="flex items-start gap-2">
                  <Icon name="Info" size={15} className="text-amber flex-shrink-0 mt-0.5" />
                  <p className="font-body text-xs text-foreground leading-relaxed">
                    Укажите email — после оплаты подписка активируется автоматически и вы войдёте в аккаунт.
                  </p>
                </div>
              </div>

              <div>
                <label className="font-body text-xs text-muted-foreground mb-1.5 block">Ваш email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(""); }}
                  placeholder="teacher@school.ru"
                  onKeyDown={e => e.key === "Enter" && handleStartPayment()}
                  className={`w-full px-4 py-3 rounded-xl border-2 font-body text-sm focus:outline-none transition-colors ${error ? "border-destructive" : "border-border focus:border-primary"}`}
                />
              </div>

              {error && <div className="p-3 rounded-xl bg-destructive/10 border border-destructive text-destructive text-sm font-body">{error}</div>}

              <button
                onClick={handleStartPayment}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-primary text-white font-body font-bold text-sm hover:bg-primary/90 disabled:opacity-50 transition-all active:scale-95"
              >
                {loading ? "Создаём платёж..." : "Перейти к оплате"}
              </button>

              <button onClick={() => setStep("plan")} className="w-full py-2 text-sm font-body text-muted-foreground hover:text-foreground transition-colors">
                ← Назад
              </button>
            </>
          )}

          {step === "paying" && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-light flex items-center justify-center mx-auto">
                <Icon name="Clock" size={32} className="text-amber" />
              </div>
              <div>
                <div className="font-display text-lg font-bold text-foreground mb-2">Ожидаем оплату</div>
                <p className="font-body text-sm text-muted-foreground">
                  Страница оплаты открылась в новой вкладке. Завершите оплату — подписка активируется автоматически.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="font-body text-xs">Проверяем статус оплаты...</span>
              </div>
              <button
                onClick={() => { stopPolling(); setStep("plan"); }}
                className="w-full py-2 text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
              >
                Отменить
              </button>
            </div>
          )}

          {step === "done" && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Icon name="CheckCircle" size={40} className="text-primary" />
              </div>
              <div>
                <div className="font-display text-xl font-bold text-foreground mb-2">Оплата прошла успешно!</div>
                <p className="font-body text-sm text-muted-foreground">
                  Подписка активирована. Вы автоматически вошли в аккаунт.
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-primary text-white font-body font-bold text-sm hover:bg-primary/90 transition-all active:scale-95"
              >
                Отлично, начать!
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}