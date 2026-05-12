import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

const scenarios = [
  {
    question: "Вам пришла зарплата 90 000 ₽. Как распорядитесь деньгами?",
    options: [
      { text: "Отложу 20% на накопительный счёт, остальное на жизнь", score: 20, badge: "success", tip: "Отличный выбор! Правило 50/30/20 или «заплати сначала себе» — фундамент финансовой стабильности." },
      { text: "Куплю то, что давно откладывал(а)", score: 0, badge: "danger", tip: "Импульсивные покупки снижают подушку безопасности. Попробуйте правило 24 часов: отложите покупку на сутки перед оплатой." },
      { text: "Положу всё на карту и буду тратить по мере необходимости", score: 5, badge: "warning", tip: "Без бюджета деньги «растворяются». Начните вести учёт расходов в любом приложении или таблице." },
    ],
  },
  {
    question: "Сломался ноутбук, нужен срочно. Ремонт стоит 15 000 ₽. Ваши действия?",
    options: [
      { text: "Возьму микрозайм на неделю, потом отдам", score: -5, badge: "danger", tip: "Микрозаймы под 1% в день превращаются в 365% годовых. Используйте только накопления или рассрочку 0%." },
      { text: "Воспользуюсь накоплениями из «подушки безопасности»", score: 20, badge: "success", tip: "Именно для этого и существует финансовая подушка (3–6 расходов). Вы всё делаете правильно!" },
      { text: "Положу на кредитную карту и буду платить минимальный платёж", score: 0, badge: "warning", tip: "Минимальный платёж растягивает долг на годы и переплату. Если используете карту, гасите полную сумму в льготный период." },
    ],
  },
  {
    question: "Друг предлагает «гарантированную» схему с доходностью 5% в месяц. Что сделаете?",
    options: [
      { text: "Вложу небольшую сумму, чтобы проверить", score: 5, badge: "warning", tip: "Любая «гарантированная» высокая доходность — красный флаг. Средние рыночные ставки 12–18% годовых, не месячных." },
      { text: "Откажусь и проверю компанию через ЦБ и отзывы", score: 20, badge: "success", tip: "Верно! Проверяйте лицензии на cbr.ru, читайте независимые отзывы и помните: высокий доход = высокий риск." },
      { text: "Вложу всё, пока другие не забрали доход", score: -10, badge: "danger", tip: "Это классическая пирамида. Никогда не инвестируйте деньги, которые не готовы потерять." },
    ],
  },
  {
    question: "У вас кредитная карта с лимитом 100 000 ₽ и ставкой 24% годовых. Как погасите долг?",
    options: [
      { text: "Буду вносить только минимальный платёж, чтобы не было штрафов", score: -5, badge: "danger", tip: "Минимальный платёж покрывает в основном проценты. Долг будет расти. Всегда гасите больше минимума." },
      { text: "Сначала закрою мелкие расходы, потом карту", score: 5, badge: "warning", tip: "Лучше использовать «метод снежного кома»: гасите сначала самый дорогой кредит, экономя на процентах." },
      { text: "Составлю план досрочного погашения и переведу часть накоплений на карту", score: 20, badge: "success", tip: "Отличная стратегия! Избавьтесь от потребительских долгов с высокой ставкой в первую очередь." },
    ],
  },
  {
    question: "Вы решили начать инвестировать 10 000 ₽. Куда вложите первую сумму?",
    options: [
      { text: "В одну акцию «перспективной» компании", score: 0, badge: "danger", tip: "Концентрация в одном активе = высокий риск. Диверсификация снижает просадки портфеля." },
      { text: "В индексный фонд/ETF на весь рынок", score: 20, badge: "success", tip: "Идеальный старт! Индексы дают рыночную доходность, низкие комиссии и автоматическую диверсификацию." },
      { text: "В образовательный курс по инвестициям", score: 10, badge: "warning", tip: "Обучение важно, но проверяйте авторов. Начните с бесплатных материалов ЦБ и брокеров, прежде чем платить за курсы." },
    ],
  },
];

type Screen = "start" | "play" | "result";

const badgeConfig = {
  success: { bg: "bg-green-100 text-green-800", label: "+ финансовая грамотность" },
  warning: { bg: "bg-amber-100 text-amber-800", label: "⚖️ Нейтрально" },
  danger:  { bg: "bg-red-100 text-red-800",   label: "⚠️ Риск" },
};

export default function Quests() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState<Screen>("start");
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const q = scenarios[current];
  const progress = (current / scenarios.length) * 100;

  function startGame() {
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setShowFeedback(false);
    setScreen("play");
  }

  function selectOption(i: number) {
    if (showFeedback) return;
    setSelected(i);
    setScore((s) => Math.max(0, s + q.options[i].score));
    setShowFeedback(true);
  }

  function nextQuestion() {
    if (current + 1 < scenarios.length) {
      setCurrent((c) => c + 1);
      setSelected(null);
      setShowFeedback(false);
    } else {
      setScreen("result");
    }
  }

  function getResult() {
    if (score >= 80) return {
      icon: "📈", level: "Финансовый стратег 🏆",
      desc: "Вы уверенно управляете деньгами, избегаете долговых ям и понимаете основы инвестирования.",
      tips: ["Рассмотрите налоговые вычеты (ИИС, 152-ФЗ)", "Создайте целевые фонды (отпуск, обучение, недвижимость)", "Изучите сложное процентное начисление для долгосрочных целей"],
    };
    if (score >= 50) return {
      icon: "💡", level: "Уверенный пользователь 💼",
      desc: "У вас хорошая база, но есть зоны роста. Несколько привычек помогут ускорить накопления.",
      tips: ["Автоматизируйте переводы в накопительный счёт в день зарплаты", "Проверьте свои подписки и регулярные платежи", "Изучите разницу между активами и пассивами"],
    };
    return {
      icon: "📘", level: "Начинающий навигатор 🌱",
      desc: "Вы в начале пути. Это нормально! Финансовая грамотность прокачивается постепенно.",
      tips: ["Заведите таблицу доходов/расходов хотя бы на 1 месяц", "Сформируйте подушку безопасности (даже с 1 000 ₽ в месяц)", "Подпишитесь на проверенные источники о личных финансах"],
    };
  }

  const result = getResult();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-indigo-light/30 to-teal-light/20 flex flex-col">
      {/* Шапка */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-border">
        <div className="container max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/30">
              <Icon name="GraduationCap" size={16} className="text-white" />
            </span>
            <span className="font-display text-xl font-bold text-foreground tracking-tight">УрокАИ</span>
          </button>
          <button onClick={() => navigate("/")} className="flex items-center gap-1.5 text-sm font-body text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="ArrowLeft" size={16} />
            На главную
          </button>
        </div>
      </div>

      {/* Контент */}
      <div className="flex-1 flex items-center justify-center pt-24 pb-12 px-4">
        <div className="w-full max-w-xl">

          {/* СТАРТ */}
          {screen === "start" && (
            <div className="bg-white rounded-3xl shadow-xl p-8 text-center animate-fade-in">
              <div className="text-5xl mb-4">💡</div>
              <h1 className="font-display text-2xl font-bold text-foreground mb-3">Финансовый навигатор</h1>
              <p className="font-body text-muted-foreground mb-8 leading-relaxed">
                5 реальных ситуаций. Проверьте, как вы управляете деньгами, и получите персональные рекомендации.
              </p>
              <button onClick={startGame}
                className="w-full py-3.5 rounded-2xl bg-primary text-white font-body font-semibold text-base hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/25 active:scale-95">
                Начать тест
              </button>
            </div>
          )}

          {/* ИГРА */}
          {screen === "play" && (
            <div className="bg-white rounded-3xl shadow-xl p-8 animate-fade-in">
              {/* Прогресс */}
              <div className="h-2 bg-slate-100 rounded-full mb-6 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <p className="font-body text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                Вопрос {current + 1} из {scenarios.length}
              </p>
              <h2 className="font-display text-lg font-bold text-foreground mb-5 leading-snug">
                {q.question}
              </h2>

              <div className="space-y-3 mb-4">
                {q.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => selectOption(i)}
                    disabled={showFeedback}
                    className={`w-full text-left px-4 py-3.5 rounded-2xl border-2 font-body text-sm transition-all
                      ${selected === i
                        ? "border-primary bg-primary/5"
                        : showFeedback
                        ? "border-border bg-slate-50 opacity-60 cursor-not-allowed"
                        : "border-border bg-white hover:border-primary/50 hover:bg-primary/3 cursor-pointer"
                      }`}
                  >
                    {opt.text}
                  </button>
                ))}
              </div>

              {showFeedback && selected !== null && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 animate-fade-in">
                  <span className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-semibold mb-2 ${badgeConfig[q.options[selected].badge as keyof typeof badgeConfig].bg}`}>
                    {badgeConfig[q.options[selected].badge as keyof typeof badgeConfig].label}
                  </span>
                  <p className="font-body text-sm text-foreground font-medium mb-3 leading-relaxed">
                    {q.options[selected].tip}
                  </p>
                  <button onClick={nextQuestion}
                    className="w-full py-2.5 rounded-xl bg-primary text-white font-body font-semibold text-sm hover:bg-primary/90 transition-all active:scale-95">
                    {current + 1 < scenarios.length ? "Далее →" : "Получить результат"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* РЕЗУЛЬТАТ */}
          {screen === "result" && (
            <div className="bg-white rounded-3xl shadow-xl p-8 text-center animate-fade-in">
              <div className="text-5xl mb-3">{result.icon}</div>
              <h2 className="font-display text-xl font-bold text-foreground mb-2">{result.level}</h2>
              <p className="font-body text-muted-foreground mb-5 leading-relaxed">{result.desc}</p>

              <ul className="text-left space-y-2 mb-7">
                {result.tips.map((t, i) => (
                  <li key={i} className="flex items-start gap-2 font-body text-sm text-muted-foreground">
                    <Icon name="CheckCircle" size={16} className="text-primary mt-0.5 shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>

              <div className="grid grid-cols-2 gap-3">
                <button onClick={startGame}
                  className="py-3 rounded-2xl bg-slate-100 text-foreground font-body font-semibold text-sm hover:bg-slate-200 transition-all active:scale-95">
                  🔄 Пройти снова
                </button>
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: "Финансовый навигатор", text: "Я прошёл тест на финансовую грамотность!", url: location.href });
                    } else {
                      navigator.clipboard.writeText(location.href);
                    }
                  }}
                  className="py-3 rounded-2xl bg-primary text-white font-body font-semibold text-sm hover:bg-primary/90 transition-all active:scale-95">
                  📤 Поделиться
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
