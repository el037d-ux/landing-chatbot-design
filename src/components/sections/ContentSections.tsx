import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

const STUDENTS_IMAGE = "https://cdn.poehali.dev/projects/3a27d5a9-016a-43ab-946d-4c4fe8129705/files/a75ebe32-992a-474d-964e-72a5f83e9bed.jpg";

const DEMO_CHAT = [
  {
    role: "user",
    text: "Хочу провести урок по фотосинтезу для 6 класса. Ученики активные, любят игры.",
  },
  {
    role: "bot",
    text: "Отличная тема! Вот план для вашего урока:",
    list: [
      "🌱 Вводная игра «Стань листом» — дети разыгрывают процесс фотосинтеза по ролям (5 мин)",
      "📊 Мини-лекция с интерактивной схемой на доске (10 мин)",
      "🔬 Практика: рассматриваем лист под лупой и зарисовываем хлоропласты (15 мин)",
      "🎯 Квиз в командах — кто быстрее ответит на 10 вопросов (7 мин)",
    ],
  },
  {
    role: "user",
    text: "Как оценить работу учеников на этом уроке?",
  },
  {
    role: "bot",
    text: "Предлагаю три метода оценивания:",
    list: [
      "✅ Наблюдение за работой в группах — отмечайте активность и правильность ответов",
      "📝 Зарисовка хлоропласта — критерии: аккуратность, наличие подписей",
      "🏆 Квиз — автоматически даёт баллы каждой команде, легко сравнить",
    ],
  },
];

const FAQ_ITEMS = [
  {
    q: "Нужны ли технические навыки для работы с сервисом?",
    a: "Нет. УрокАИ создан специально для педагогов без технической подготовки. Просто опишите тему, класс и предмет — ИИ сделает остальное.",
  },
  {
    q: "Работает ли сервис с Google Classroom и Microsoft Teams?",
    a: "Да! УрокАИ интегрируется с Google Classroom, Microsoft Teams, а также другими платформами управления классом. Готовые материалы можно экспортировать в один клик.",
  },
  {
    q: "Могу ли я сохранять свои уроки?",
    a: "Конечно. Все разработанные уроки сохраняются в вашем личном кабинете. Вы можете редактировать, копировать и делиться ими с коллегами.",
  },
  {
    q: "Подходит ли сервис для разных предметов?",
    a: "УрокАИ работает для любых предметов — от математики и физики до литературы и физкультуры. ИИ адаптирует идеи под специфику каждой дисциплины.",
  },
  {
    q: "Сколько стоит использование?",
    a: "Есть бесплатный тариф с базовыми функциями. Премиум-план открывает неограниченные уроки, интеграции и приоритетную поддержку.",
  },
];

const ARTICLES = [
  {
    tag: "Методика",
    title: "5 техник активного обучения, которые работают в любом классе",
    desc: "Как превратить пассивных слушателей в участников урока с помощью простых приёмов.",
    time: "5 мин",
  },
  {
    tag: "Оценивание",
    title: "Формативное оценивание без стресса: инструменты и примеры",
    desc: "Как регулярно проверять знания учеников так, чтобы это помогало, а не пугало.",
    time: "7 мин",
  },
  {
    tag: "Технологии",
    title: "Google Classroom + ИИ: как сократить подготовку урока вдвое",
    desc: "Пошаговое руководство по интеграции ИИ-помощника в привычный рабочий процесс.",
    time: "4 мин",
  },
];

const FEATURES = [
  { icon: "Lightbulb", title: "Идеи и активности", desc: "ИИ предлагает конкретные упражнения, игры и задания с учётом возраста и предмета" },
  { icon: "BarChart3", title: "Методы оценивания", desc: "Получите готовые критерии оценки, рубрики и форматы проверки знаний" },
  { icon: "Puzzle", title: "Интеграции", desc: "Экспорт в Google Classroom, Microsoft Teams и другие платформы в один клик" },
  { icon: "BookOpen", title: "Библиотека уроков", desc: "Сохраняйте, редактируйте и делитесь уроками с коллегами" },
  { icon: "Users", title: "Адаптация под класс", desc: "Укажите особенности аудитории — ИИ настроит подачу материала" },
  { icon: "Clock", title: "Экономия времени", desc: "Подготовка урока занимает 5 минут вместо нескольких часов" },
];

function About() {
  return (
    <section id="about" className="py-24 bg-white">
      <div className="container max-w-6xl mx-auto px-6">
        <div className="section-fade text-center mb-16">
          <span className="font-body text-sm font-medium text-green uppercase tracking-wider">О сервисе</span>
          <h2 className="font-display text-4xl lg:text-5xl font-semibold mt-3 mb-5 text-foreground">
            Всё необходимое для{" "}
            <em className="not-italic text-green">современного урока</em>
          </h2>
          <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
            УрокАИ — это интеллектуальный ассистент, который понимает специфику педагогической работы и помогает создавать вовлекающие уроки.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="section-fade group p-6 rounded-2xl border border-border hover:border-green/30 hover:shadow-lg hover:shadow-green/5 transition-all duration-300 bg-white"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="w-10 h-10 rounded-xl bg-warm group-hover:bg-green-light transition-colors flex items-center justify-center mb-4">
                <Icon name={f.icon} fallback="Lightbulb" size={20} className="text-foreground group-hover:text-green transition-colors" />
              </div>
              <h3 className="font-body font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="section-fade mt-16 rounded-2xl overflow-hidden bg-warm relative">
          <div className="grid lg:grid-cols-2 gap-0">
            <div className="p-10 lg:p-14">
              <span className="font-body text-xs font-medium text-green uppercase tracking-wider">Интеграции</span>
              <h3 className="font-display text-3xl font-semibold mt-3 mb-4 text-foreground">
                Работает с вашими любимыми платформами
              </h3>
              <p className="font-body text-muted-foreground mb-6 leading-relaxed">
                Экспортируйте готовые материалы напрямую в Google Classroom, Microsoft Teams, Moodle и другие LMS.
              </p>
              <div className="flex flex-wrap gap-3">
                {["Google Classroom", "Microsoft Teams", "Moodle", "Edmodo"].map((p) => (
                  <span key={p} className="px-3 py-1.5 rounded-full bg-white border border-border font-body text-sm font-medium text-foreground">
                    {p}
                  </span>
                ))}
              </div>
            </div>
            <div className="relative overflow-hidden">
              <img
                src={STUDENTS_IMAGE}
                alt="Интеграции с платформами"
                className="w-full h-full object-cover min-h-[280px]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-warm/80 to-transparent lg:from-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ChatDemo() {
  const [visibleMessages, setVisibleMessages] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  const startDemo = () => {
    setIsStarted(true);
    setVisibleMessages(1);
  };

  useEffect(() => {
    if (!isStarted) return;
    if (visibleMessages >= DEMO_CHAT.length) return;
    const timer = setTimeout(() => {
      setVisibleMessages((v) => v + 1);
    }, 1200);
    return () => clearTimeout(timer);
  }, [isStarted, visibleMessages]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [visibleMessages]);

  return (
    <section id="demo" className="py-24 bg-[hsl(220,15%,97%)]">
      <div className="container max-w-6xl mx-auto px-6">
        <div className="section-fade text-center mb-16">
          <span className="font-body text-sm font-medium text-green uppercase tracking-wider">Примеры работы</span>
          <h2 className="font-display text-4xl lg:text-5xl font-semibold mt-3 mb-5 text-foreground">
            Посмотрите, как это работает
          </h2>
          <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
            Реальный диалог с ИИ-помощником. Педагог описывает задачу — бот предлагает готовое решение.
          </p>
        </div>

        <div className="section-fade max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl shadow-foreground/5 border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green flex items-center justify-center">
                <Icon name="Bot" size={16} className="text-white" />
              </div>
              <div>
                <div className="font-body text-sm font-semibold text-foreground">УрокАИ</div>
                <div className="font-body text-xs text-green flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green inline-block" />
                  Онлайн
                </div>
              </div>
              <div className="ml-auto flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[hsl(0,70%,75%)]" />
                <span className="w-3 h-3 rounded-full bg-[hsl(38,70%,75%)]" />
                <span className="w-3 h-3 rounded-full bg-[hsl(120,50%,65%)]" />
              </div>
            </div>

            <div ref={chatRef} className="h-[400px] overflow-y-auto p-6 space-y-4 scroll-smooth">
              {!isStarted && (
                <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-warm flex items-center justify-center">
                    <Icon name="MessageCircle" size={28} className="text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-body font-medium text-foreground mb-1">Демо-диалог с УрокАИ</p>
                    <p className="font-body text-sm text-muted-foreground">Нажмите, чтобы увидеть пример работы</p>
                  </div>
                  <button
                    onClick={startDemo}
                    className="px-5 py-2.5 rounded-xl bg-primary text-white font-body text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    Запустить демо
                  </button>
                </div>
              )}

              {DEMO_CHAT.slice(0, visibleMessages).map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in-up`}
                >
                  {msg.role === "bot" && (
                    <div className="w-7 h-7 rounded-full bg-green flex-shrink-0 flex items-center justify-center mr-2 mt-0.5">
                      <Icon name="Bot" size={14} className="text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-primary text-white rounded-tr-sm"
                        : "bg-warm text-foreground rounded-tl-sm"
                    }`}
                  >
                    <p className="font-body text-sm leading-relaxed">{msg.text}</p>
                    {"list" in msg && msg.list && (
                      <ul className="mt-2 space-y-1.5">
                        {msg.list.map((item, j) => (
                          <li key={j} className="font-body text-sm leading-relaxed">{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}

              {isStarted && visibleMessages < DEMO_CHAT.length && visibleMessages % 2 === 1 && (
                <div className="flex justify-start animate-fade-in">
                  <div className="w-7 h-7 rounded-full bg-green flex-shrink-0 flex items-center justify-center mr-2">
                    <Icon name="Bot" size={14} className="text-white" />
                  </div>
                  <div className="bg-warm rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 bg-white">
      <div className="container max-w-3xl mx-auto px-6">
        <div className="section-fade text-center mb-16">
          <span className="font-body text-sm font-medium text-green uppercase tracking-wider">Вопросы и ответы</span>
          <h2 className="font-display text-4xl lg:text-5xl font-semibold mt-3 mb-5 text-foreground">
            Частые вопросы
          </h2>
          <p className="font-body text-lg text-muted-foreground">
            Если не нашли ответ — напишите нам в поддержку.
          </p>
        </div>

        <div className="section-fade space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <div
              key={i}
              className="border border-border rounded-xl overflow-hidden hover:border-green/30 transition-colors"
            >
              <button
                className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left hover:bg-warm/50 transition-colors"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="font-body font-medium text-foreground text-sm leading-relaxed">{item.q}</span>
                <Icon
                  name={open === i ? "ChevronUp" : "ChevronDown"}
                  size={18}
                  className="text-muted-foreground flex-shrink-0"
                />
              </button>
              {open === i && (
                <div className="px-6 pb-5 animate-fade-in">
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Articles() {
  return (
    <section id="articles" className="py-24 bg-warm">
      <div className="container max-w-6xl mx-auto px-6">
        <div className="section-fade flex items-end justify-between mb-12">
          <div>
            <span className="font-body text-sm font-medium text-green uppercase tracking-wider">Блог</span>
            <h2 className="font-display text-4xl lg:text-5xl font-semibold mt-3 text-foreground">
              Статьи и советы
            </h2>
          </div>
          <a href="#" className="hidden md:flex items-center gap-1.5 font-body text-sm font-medium text-foreground hover:text-green transition-colors">
            Все статьи
            <Icon name="ArrowRight" size={16} />
          </a>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {ARTICLES.map((a, i) => (
            <div
              key={i}
              className="section-fade group bg-white rounded-2xl overflow-hidden border border-border hover:shadow-xl hover:shadow-foreground/5 transition-all duration-300 cursor-pointer"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="h-2 bg-gradient-to-r from-green to-[hsl(158,45%,60%)] group-hover:h-3 transition-all duration-300" />
              <div className="p-6">
                <span className="inline-block px-2.5 py-1 rounded-full bg-green-light text-green text-xs font-body font-medium mb-4">
                  {a.tag}
                </span>
                <h3 className="font-body font-semibold text-foreground mb-2 leading-snug group-hover:text-green transition-colors">
                  {a.title}
                </h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed mb-4">{a.desc}</p>
                <div className="flex items-center gap-1.5 text-xs font-body text-muted-foreground">
                  <Icon name="Clock" size={13} />
                  {a.time} чтения
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export { About, ChatDemo, FAQ, Articles };
