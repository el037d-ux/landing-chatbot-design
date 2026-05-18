import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

const SPECIAL_QUESTS = [
  {
    id: "oodb",
    icon: "🖥️",
    title: "ООБД-тренажёр",
    desc: "10 заданий на распределение объектов по сетевым узлам с учётом capacity, типов, безопасности, QoS и репликации. Экспорт результатов в CSV.",
    color: "from-slate-600 to-blue-700",
    count: "10 уровней",
    path: "/quests/oodb",
  },
  {
    id: "information-work",
    icon: "📊",
    title: "Работа с информацией",
    desc: "Интерактивное руководство по обработке и управлению данными. Виды информации, процессы работы, тест, классификация и сопоставление процессов.",
    color: "from-violet-600 to-purple-700",
    count: "3 задания",
    path: "/quests/information-work",
  },
  {
    id: "smart-goals",
    icon: "🎯",
    title: "SMART-цели",
    desc: "Интерактивный курс по постановке эффективных целей. Теория, практика, 6 уровней заданий и персональный сертификат по итогам.",
    color: "from-indigo-500 to-violet-600",
    count: "6 уровней",
    path: "/quests/smart-goals",
  },
];

// ── Финансовый навигатор ─────────────────────────────────────────────────────
const finScenarios = [
  {
    phase: "💰 Доходы",
    question: "Вам пришла зарплата 90 000 ₽. Как распорядитесь деньгами?",
    options: [
      { text: "Отложу 20% на накопительный счёт, остальное на жизнь", score: 20, type: "good", principle: "✅ Правило 50/30/20", tip: "Отличный выбор! Правило 50/30/20 или «заплати сначала себе» — фундамент финансовой стабильности." },
      { text: "Куплю то, что давно откладывал(а)", score: 0, type: "bad", principle: "⚠️ Импульсивные расходы", tip: "Импульсивные покупки снижают подушку безопасности. Попробуйте правило 24 часов: отложите покупку на сутки перед оплатой." },
      { text: "Положу всё на карту и буду тратить по мере необходимости", score: 5, type: "warn", principle: "⚖️ Нет бюджета", tip: "Без бюджета деньги «растворяются». Начните вести учёт расходов в любом приложении или таблице." },
    ],
  },
  {
    phase: "🔧 Непредвиденные расходы",
    question: "Сломался ноутбук, нужен срочно. Ремонт стоит 15 000 ₽. Ваши действия?",
    options: [
      { text: "Возьму микрозайм на неделю, потом отдам", score: -5, type: "bad", principle: "❌ Микрозаймы", tip: "Микрозаймы под 1% в день превращаются в 365% годовых. Используйте только накопления или рассрочку 0%." },
      { text: "Воспользуюсь накоплениями из «подушки безопасности»", score: 20, type: "good", principle: "✅ Подушка безопасности", tip: "Именно для этого и существует финансовая подушка (3–6 расходов). Вы всё делаете правильно!" },
      { text: "Положу на кредитную карту и буду платить минимальный платёж", score: 0, type: "warn", principle: "⚖️ Минимальный платёж", tip: "Минимальный платёж растягивает долг на годы и переплату. Если используете карту, гасите полную сумму в льготный период." },
    ],
  },
  {
    phase: "⚠️ Финансовые риски",
    question: "Друг предлагает «гарантированную» схему с доходностью 5% в месяц. Что сделаете?",
    options: [
      { text: "Вложу небольшую сумму, чтобы проверить", score: 5, type: "warn", principle: "⚖️ Красный флаг", tip: "Любая «гарантированная» высокая доходность — красный флаг. Средние рыночные ставки 12–18% годовых, не месячных." },
      { text: "Откажусь и проверю компанию через ЦБ и отзывы", score: 20, type: "good", principle: "✅ Проверка через ЦБ", tip: "Верно! Проверяйте лицензии на cbr.ru, читайте независимые отзывы и помните: высокий доход = высокий риск." },
      { text: "Вложу всё, пока другие не забрали доход", score: -10, type: "bad", principle: "❌ Финансовая пирамида", tip: "Это классическая пирамида. Никогда не инвестируйте деньги, которые не готовы потерять." },
    ],
  },
  {
    phase: "💳 Кредиты",
    question: "У вас кредитная карта с лимитом 100 000 ₽ и ставкой 24% годовых. Как погасите долг?",
    options: [
      { text: "Буду вносить только минимальный платёж, чтобы не было штрафов", score: -5, type: "bad", principle: "❌ Рост долга", tip: "Минимальный платёж покрывает в основном проценты. Долг будет расти. Всегда гасите больше минимума." },
      { text: "Сначала закрою мелкие расходы, потом карту", score: 5, type: "warn", principle: "⚖️ Метод снежного кома", tip: "Лучше использовать «метод снежного кома»: гасите сначала самый дорогой кредит, экономя на процентах." },
      { text: "Составлю план досрочного погашения и переведу часть накоплений на карту", score: 20, type: "good", principle: "✅ Досрочное погашение", tip: "Отличная стратегия! Избавьтесь от потребительских долгов с высокой ставкой в первую очередь." },
    ],
  },
  {
    phase: "📈 Инвестиции",
    question: "Вы решили начать инвестировать 10 000 ₽. Куда вложите первую сумму?",
    options: [
      { text: "В одну акцию «перспективной» компании", score: 0, type: "bad", principle: "⚠️ Концентрация риска", tip: "Концентрация в одном активе = высокий риск. Диверсификация снижает просадки портфеля." },
      { text: "В индексный фонд/ETF на весь рынок", score: 20, type: "good", principle: "✅ Диверсификация", tip: "Идеальный старт! Индексы дают рыночную доходность, низкие комиссии и автоматическую диверсификацию." },
      { text: "В образовательный курс по инвестициям", score: 10, type: "warn", principle: "⚖️ Обучение", tip: "Обучение важно, но проверяйте авторов. Начните с бесплатных материалов ЦБ и брокеров, прежде чем платить за курсы." },
    ],
  },
];

// ── Проектный навигатор ──────────────────────────────────────────────────────
const pmScenarios = [
  {
    phase: "📍 Инициация",
    question: "Заказчик говорит: «Нужно запустить продукт к сентябрю. Сделайте всё сразу и быстро». Ваши первые действия?",
    options: [
      { text: "Собрать команду и сразу начать разработку, чтобы показать динамику", score: 0, type: "warn", principle: "⚠️ Управление рамками", tip: "Без чёткого ТЗ и границ проекта вы получите scope creep. Начинайте с воркшопа по целям, стейкхолдерам и критериям успеха." },
      { text: "Запросить бизнес-цели, провести встречу с ключевыми участниками и зафиксировать рамочное соглашение", score: 20, type: "good", principle: "✅ Выравнивание стейкхолдеров", tip: "Проектное мышление начинается с вопроса «Зачем?», а не «Как?». Согласованные ожидания — 80% успеха." },
      { text: "Ответить, что без бюджета и команды это невозможно", score: 5, type: "warn", principle: "⚖️ Пассивная позиция", tip: "Отказ без альтернативы разрушает доверие. Предложите этапы discovery или пилотный MVP." },
    ],
  },
  {
    phase: "📐 Планирование",
    question: "Команда оценивает критическую задачу в 10 дней. Вы знаете, что есть внешние зависимости и риски задержки.",
    options: [
      { text: "Утвердить 10 дней, потом разберёмся по факту", score: -5, type: "bad", principle: "❌ Игнорирование рисков", tip: "Ожидание чуда ≠ управление. Проектное мышление требует проактивной работы с неизвестностями." },
      { text: "Разбить задачу, добавить буфер 20%, согласовать план Б и прозрачно сообщить заказчику", score: 20, type: "good", principle: "✅ Риск-менеджмент", tip: "WBS + буферы + коммуникация = реалистичный план. Прозрачность снижает панику при форс-мажорах." },
      { text: "Потребовать от команды работать в выходные, чтобы уложиться", score: -5, type: "bad", principle: "❌ Игнорирование ресурсов", tip: "Переработки = технический долг + выгорание. Устойчивый темп важнее героических рывков." },
    ],
  },
  {
    phase: "⚙️ Исполнение",
    question: "Ключевой специалист уходит в незапланированный отпуск. Дедлайн через 3 недели.",
    options: [
      { text: "Перенести срок без объяснений, чтобы «не дергать заказчика»", score: 0, type: "warn", principle: "⚠️ Скрытность", tip: "Заказчики терпят сдвиги, но не терпят молчание. Управляйте ожиданиями, а не прячьте их." },
      { text: "Перераспределить задачи, обновить план коммуникаций и оперативно уведомить стейкхолдеров", score: 20, type: "good", principle: "✅ Адаптивное управление", tip: "Проект живёт только при прозрачном потоке информации. Ресурсный лейвлинг + чёткие роли = устойчивость." },
      { text: "Валить всю работу на оставшихся, «они разберутся»", score: -5, type: "bad", principle: "❌ Перегрузка", tip: "Концентрация нагрузки на 1-2 людях = точка отказа. Декомпозиция + кросс-функциональность = устойчивость." },
    ],
  },
  {
    phase: "📊 Мониторинг",
    question: "Метрики показывают отставание на 25%. Заказчик требует отчёт в пятницу.",
    options: [
      { text: "Сгладить цифры в отчёте, чтобы «не паниковать раньше времени»", score: -5, type: "bad", principle: "❌ Этический риск", tip: "Манипуляция данными убивает доверие и откладывает решение. Проектное мышление опирается на факты, а не на надежды." },
      { text: "Показать реальные метрики, предложить корректирующие действия и приоритизацию бэклога", score: 20, type: "good", principle: "✅ Data-driven управление", tip: "KPI + корректирующие меры + согласование MVP-фич = контроль без паники. Прозрачность = доверие." },
      { text: "Обвинить исполнителей в низкой скорости", score: -5, type: "bad", principle: "❌ Токсичная коммуникация", tip: "Системные проблемы решаются процессами, а не поиском виноватых. Ретроспективы > обвинения." },
    ],
  },
  {
    phase: "🏁 Завершение",
    question: "Проект сдан. Заказчик доволен, но команда выгорела, а процессы остались хаотичными.",
    options: [
      { text: "Сразу переключиться на новый проект, «результат важнее»", score: 0, type: "warn", principle: "⚠️ Игнорирование обучения", tip: "Без ретроспективы вы повторите те же ошибки. Проектное мышление включает цикл «сделал → проанализировал → улучшил»." },
      { text: "Провести ретроспективу, задокументировать уроки, поблагодарить команду и обновить шаблоны", score: 20, type: "good", principle: "✅ Непрерывное улучшение", tip: "Knowledge management + забота о команде = зрелость. Успешный проект тот, после которого следующий запускается быстрее." },
      { text: "Написать формальный отчёт для руководства и забыть", score: 5, type: "warn", principle: "⚖️ Бюрократия", tip: "Отчёт без действий = бумага. Проектное мышление превращает опыт в активы организации." },
    ],
  },
];

// ── Коммуникативный навигатор ────────────────────────────────────────────────
const cnScenarios = [
  {
    phase: "🎧 Конфликтная обратная связь",
    question: "На совещании коллега резко раскритиковал вашу идею: «Это вообще не работает». Ваша реакция?",
    options: [
      { text: "Ответить тем же, чтобы защитить свою позицию", score: -5, type: "bad", principle: "⛔ Реактивная оборона", tip: "Эскалация блокирует конструктив. Коммуникативная грамотность начинается с паузы и разделения человека и проблемы." },
      { text: "Выслушать до конца, уточнить конкретные пункты критики и предложить обсудить детали отдельно", score: 20, type: "good", principle: "✅ Active Listening + DESC", tip: "Отражение + факты + приватность = снижение эмоций. Вы переводите диалог из «кто прав» в «как улучшить»." },
      { text: "Замолчать, обидеться, но позже сделать по-своему", score: 0, type: "warn", principle: "⚠️ Пассивное избегание", tip: "Молчание ≠ согласие. Накапливается фоновый конфликт. Лучше сразу обозначить границы конструктивного диалога." },
    ],
  },
  {
    phase: "📢 Дача фидбэка",
    question: "Сотрудник систематически опаздывает на планёрки. Как скажете?",
    options: [
      { text: "Написать в общий чат: «Хватит опаздывать, это неуважение к команде»", score: -5, type: "bad", principle: "❌ Публичное осуждение", tip: "Публичная критика вызывает защитную реакцию и снижает психологическую безопасность. Фидбэк — всегда тет-а-тет." },
      { text: "Поговорить наедине: описать факты, объяснить влияние на работу, спросить о причинах, договориться о решении", score: 20, type: "good", principle: "✅ Ненасильственное общение (ННО)", tip: "Наблюдение → Чувство → Потребность → Просьба. Формула, которая сохраняет отношения и решает проблему." },
      { text: "Сделать замечание в шутку, надеясь на намёк", score: 5, type: "warn", principle: "⚖️ Косвенная коммуникация", tip: "Намёки работают только в монокультуре. В разнородных командах прямая, но мягкая формулировка надёжнее." },
    ],
  },
  {
    phase: "🔍 Прояснение потребностей",
    question: "Клиент говорит: «Мне не нравится ваш подход. Сделайте иначе, но не знаю как именно».",
    options: [
      { text: "Ответить: «Тогда объясните конкретно, иначе ничего не получится»", score: 0, type: "warn", principle: "⚖️ Перекладывание ответственности", tip: "Фраза звучит как ультиматум. Клиент часто не формулирует задачу профессионально — это часть вашей работы." },
      { text: "Задать уточняющие вопросы: «Что именно вызывает дискомфорт? Какие примеры вам близки? Какой результат считаете успехом?»", score: 20, type: "good", principle: "✅ Эмпатическое прояснение", tip: "Открытые вопросы + переформулирование = переход от эмоций к измеримым критериям. Вы управляете диалогом, а не реагируете." },
      { text: "Молча предложить 3 варианта на выбор, не вдаваясь в детали", score: 5, type: "warn", principle: "⚖️ Поверхностное решение", tip: "Быстро, но не решает корень. Без понимания «почему» клиент снова скажет «не то»." },
    ],
  },
  {
    phase: "📱 Цифровой этикет",
    question: "Нужно отклонить срочную просьбу партнёра в мессенджере, сохранив отношения.",
    options: [
      { text: "Написать коротко: «Нет, не можем. Сами разберитесь»", score: -5, type: "bad", principle: "❌ Цифровая резкость", tip: "В переписке нет интонации. Короткий отказ считывается как грубость. Добавьте контекст и альтернативу." },
      { text: "Поблагодарить за обращение, чётко обозначить границы, предложить альтернативу или сроки, использовать тёплый тон", score: 20, type: "good", principle: "✅ Assertive-коммуникация", tip: "Да/Нет + Причина + Альтернатива = профессиональный отказ. Сохраняет доверие и снижает последующие запросы." },
      { text: "Проигнорировать 2 дня, потом ответить сухо", score: 0, type: "warn", principle: "⚠️ Избегание", tip: "Задержка ответа без предупреждения = сигнал «меня не волнует». Коммуникативная прозрачность важнее идеального ответа." },
    ],
  },
  {
    phase: "🤝 Командная фасилитация",
    question: "В чате обсуждается задача, но никто не берёт ответственность. Дедлайн близок.",
    options: [
      { text: "Предложить структуру: «Давайте закрепим ответственного, срок и формат отчёта. Кто готов взять?»", score: 20, type: "good", principle: "✅ Фасилитация + структура", tip: "Публичное закрепление ответственности без давления = зрелая командная коммуникация. Вы создаёте ясность, а не виноватых." },
      { text: "Взять задачу самому, чтобы не терять время", score: 5, type: "warn", principle: "⚖️ Героическое спасение", tip: "Иногда нужно, но системно это демотивирует команду. Лучше научить, чем делать за всех." },
      { text: "Написать руководителю с жалобой на безответственность команды", score: -5, type: "bad", principle: "❌ Эскалация без попытки решить", tip: "Эскалация без предварительного прямого разговора разрушает доверие. Сначала — коммуникация, потом — эскалация." },
    ],
  },
];

// ── Конфиги квестов ──────────────────────────────────────────────────────────
const QUESTS = [
  {
    id: "fin",
    icon: "💡",
    title: "Финансовый навигатор",
    desc: "5 реальных ситуаций. Проверьте, как вы управляете деньгами, и получите персональные рекомендации.",
    color: "from-blue-500 to-indigo-500",
    scenarios: finScenarios,
    getResult: (score: number) => {
      if (score >= 80) return { icon: "📈", level: "Финансовый стратег 🏆", desc: "Вы уверенно управляете деньгами, избегаете долговых ям и понимаете основы инвестирования.", tips: ["Рассмотрите налоговые вычеты (ИИС, 152-ФЗ)", "Создайте целевые фонды (отпуск, обучение, недвижимость)", "Изучите сложное процентное начисление для долгосрочных целей"] };
      if (score >= 50) return { icon: "💡", level: "Уверенный пользователь 💼", desc: "У вас хорошая база, но есть зоны роста. Несколько привычек помогут ускорить накопления.", tips: ["Автоматизируйте переводы в накопительный счёт в день зарплаты", "Проверьте свои подписки и регулярные платежи", "Изучите разницу между активами и пассивами"] };
      return { icon: "📘", level: "Начинающий навигатор 🌱", desc: "Вы в начале пути. Это нормально! Финансовая грамотность прокачивается постепенно.", tips: ["Заведите таблицу доходов/расходов хотя бы на 1 месяц", "Сформируйте подушку безопасности (даже с 1 000 ₽ в месяц)", "Подпишитесь на проверенные источники о личных финансах"] };
    },
  },
  {
    id: "pm",
    icon: "🧭",
    title: "Проектный навигатор",
    desc: "5 реальных ситуаций. Проверьте, как вы принимаете решения на стыке целей, рисков и коммуникаций.",
    color: "from-violet-500 to-purple-600",
    scenarios: pmScenarios,
    getResult: (score: number) => {
      if (score >= 80) return { icon: "🧭", level: "Стратег проекта 🏆", desc: "Вы мыслите системами: балансируете цели, риски и людей. Готовы к кросс-функциональным инициативам.", tips: ["Освойте OKR для стратегического выравнивания", "Внедрите метрики health-check проекта", "Менторьте младших PM-ов — лидерство масштабирует влияние"] };
      if (score >= 50) return { icon: "⚙️", level: "Практик 🛠️", desc: "У вас крепкая база, но в стрессе включаются реактивные привычки. Пара сдвигов выведут на новый уровень.", tips: ["Фиксируйте допущения проекта письменно", "Ведите журнал рисков с триггерами и владельцами", "Проводите 15-минутные sync-сессии вместо длинных совещаний"] };
      return { icon: "📘", level: "Исследователь 🌱", desc: "Вы в начале пути. Проектное мышление — навык, а не талант. Начинайте с малого.", tips: ["Освойте SMART + MoSCoW для постановки задач", "Ведите таблицу ресурсов проекта", "Пройдите бесплатные курсы по основам Agile/Scrum"] };
    },
  },
  {
    id: "cn",
    icon: "🗣️",
    title: "Коммуникативный навигатор",
    desc: "5 ситуаций. Проверьте, как вы слушаете, даёте фидбэк и гасите конфликты. Разбор по моделям ННО, DESC, Active Listening.",
    color: "from-teal-500 to-emerald-500",
    scenarios: cnScenarios,
    getResult: (score: number) => {
      if (score >= 80) return { icon: "🗣️", level: "Мастер коммуникации 🏆", desc: "Вы слышите людей, удерживаете диалог в конструктиве и создаёте психологическую безопасность в команде.", tips: ["Освойте модель SCARF для понимания мотивации", "Практикуйте активное слушание в сложных переговорах", "Изучите фасилитацию для ведения групповых встреч"] };
      if (score >= 50) return { icon: "💬", level: "Уверенный коммуникатор 💼", desc: "У вас хорошая база, но в стрессе могут включаться реактивные паттерны. Несколько техник выведут на новый уровень.", tips: ["Практикуйте формулу ННО в ежедневных разговорах", "Перед сложным разговором формулируйте цель письменно", "Изучите типологию коммуникативных стилей (DISC)"] };
      return { icon: "📘", level: "Начинающий 🌱", desc: "Коммуникация — навык, а не талант. Начинайте с малых изменений в повседневных разговорах.", tips: ["Освойте технику «Я-сообщений» вместо обвинений", "Учитесь задавать открытые вопросы", "Читайте «Ненасильственное общение» Маршалла Розенберга"] };
    },
  },
];

type Screen = "lobby" | "play" | "result";

const feedbackStyle = {
  good: "bg-green-50 border-green-200",
  warn: "bg-amber-50 border-amber-200",
  bad: "bg-red-50 border-red-200",
};

export default function Quests() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState<Screen>("lobby");
  const [questId, setQuestId] = useState<string>("fin");
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const quest = QUESTS.find((q) => q.id === questId)!;
  const scenarios = quest.scenarios;
  const q = scenarios[current];
  const progress = (current / scenarios.length) * 100;

  function startQuest(id: string) {
    setQuestId(id);
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

  const result = quest.getResult(score);

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
          <button
            onClick={() => (screen === "lobby" ? navigate("/") : setScreen("lobby"))}
            className="flex items-center gap-1.5 text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon name="ArrowLeft" size={16} />
            {screen === "lobby" ? "На главную" : "К тренажёрам"}
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center pt-20 sm:pt-24 pb-8 sm:pb-12 px-4">
        <div className="w-full max-w-xl">

          {/* ЛОББИ */}
          {screen === "lobby" && (
            <div className="animate-fade-in">
              <div className="text-center mb-6 sm:mb-8">
                <div className="text-4xl sm:text-5xl mb-3">🗺️</div>
                <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-2">Тренажёры</h1>
                <p className="font-body text-sm sm:text-base text-muted-foreground">Выберите тренажёр и проверьте свои знания</p>
              </div>
              <div className="space-y-4">
                {QUESTS.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => startQuest(q.id)}
                    className="w-full bg-white rounded-3xl shadow-md hover:shadow-xl transition-all p-6 text-left flex items-start gap-5 group active:scale-[0.98]"
                  >
                    <span className={`text-4xl w-16 h-16 rounded-2xl bg-gradient-to-br ${q.color} flex items-center justify-center shrink-0 shadow-lg`}>
                      {q.icon}
                    </span>
                    <div className="flex-1">
                      <div className="font-display text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{q.title}</div>
                      <p className="font-body text-sm text-muted-foreground leading-relaxed">{q.desc}</p>
                      <div className="mt-3 flex items-center gap-1.5 text-xs font-body font-semibold text-primary">
                        <Icon name="Play" size={12} />
                        5 вопросов
                      </div>
                    </div>
                    <Icon name="ChevronRight" size={20} className="text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
                  </button>
                ))}

                <div className="pt-2">
                  <p className="font-body text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">🎮 Интерактивные тренажёры</p>
                  {SPECIAL_QUESTS.map((q) => (
                    <button
                      key={q.id}
                      onClick={() => navigate(q.path)}
                      className="w-full bg-white rounded-3xl shadow-md hover:shadow-xl transition-all p-6 text-left flex items-start gap-5 group active:scale-[0.98]"
                    >
                      <span className={`text-4xl w-16 h-16 rounded-2xl bg-gradient-to-br ${q.color} flex items-center justify-center shrink-0 shadow-lg`}>
                        {q.icon}
                      </span>
                      <div className="flex-1">
                        <div className="font-display text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{q.title}</div>
                        <p className="font-body text-sm text-muted-foreground leading-relaxed">{q.desc}</p>
                        <div className="mt-3 flex items-center gap-1.5 text-xs font-body font-semibold text-primary">
                          <Icon name="Layers" size={12} />
                          {q.count}
                        </div>
                      </div>
                      <Icon name="ChevronRight" size={20} className="text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ИГРА */}
          {screen === "play" && (
            <div className="bg-white rounded-3xl shadow-xl p-5 sm:p-8 animate-fade-in">
              <div className="h-2 bg-slate-100 rounded-full mb-6 overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${quest.color} rounded-full transition-all duration-500`}
                  style={{ width: `${progress}%` }}
                />
              </div>

              <p className="font-body text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                {q.phase} · Вопрос {current + 1} из {scenarios.length}
              </p>
              <h2 className="font-display text-lg font-bold text-foreground mb-5 leading-snug">{q.question}</h2>

              <div className="space-y-3 mb-4">
                {q.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => selectOption(i)}
                    disabled={showFeedback}
                    className={`w-full text-left px-4 py-3.5 rounded-2xl border-2 font-body text-sm transition-all
                      ${selected === i ? "border-primary bg-primary/5" : showFeedback ? "border-border bg-slate-50 opacity-60 cursor-not-allowed" : "border-border bg-white hover:border-primary/50 hover:bg-primary/3 cursor-pointer"}`}
                  >
                    {opt.text}
                  </button>
                ))}
              </div>

              {showFeedback && selected !== null && (
                <div className={`border rounded-2xl p-4 animate-fade-in ${feedbackStyle[q.options[selected].type as keyof typeof feedbackStyle]}`}>
                  <div className="flex items-center gap-2 font-body font-bold text-sm mb-1">
                    {q.options[selected].score > 0 ? "✅ Верный вектор" : q.options[selected].score === 0 ? "⚖️ Нейтрально" : "⛔ Зона роста"}
                  </div>
                  <span className="inline-block text-xs bg-white/70 border border-border px-2 py-0.5 rounded-lg font-body text-muted-foreground mb-2">
                    {q.options[selected].principle}
                  </span>
                  <p className="font-body text-sm text-foreground leading-relaxed mb-3">{q.options[selected].tip}</p>
                  <button onClick={nextQuestion}
                    className={`w-full py-2.5 rounded-xl bg-gradient-to-r ${quest.color} text-white font-body font-semibold text-sm hover:opacity-90 transition-all active:scale-95`}>
                    {current + 1 < scenarios.length ? "Далее →" : "Получить результат"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* РЕЗУЛЬТАТ */}
          {screen === "result" && (
            <div className="bg-white rounded-3xl shadow-xl p-5 sm:p-8 text-center animate-fade-in">
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

              <div className="grid grid-cols-2 gap-3 mb-3">
                <button onClick={() => startQuest(questId)}
                  className="py-3 rounded-2xl bg-slate-100 text-foreground font-body font-semibold text-sm hover:bg-slate-200 transition-all active:scale-95">
                  🔄 Пройти снова
                </button>
                <button onClick={() => {
                  const txt = `Я прошёл квест «${quest.title}» и получил: ${result.level}!`;
                  if (navigator.share) navigator.share({ title: quest.title, text: txt, url: location.href });
                  else navigator.clipboard.writeText(txt + " " + location.href);
                }}
                  className={`py-3 rounded-2xl bg-gradient-to-r ${quest.color} text-white font-body font-semibold text-sm hover:opacity-90 transition-all active:scale-95`}>
                  📤 Поделиться
                </button>
              </div>
              <button onClick={() => setScreen("lobby")}
                className="w-full py-2.5 rounded-2xl border border-border text-sm font-body text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all">
                Выбрать другой тренажёр
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}