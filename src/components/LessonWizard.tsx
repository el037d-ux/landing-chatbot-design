import { useState } from "react";
import Icon from "@/components/ui/icon";

const GENERATE_LESSON_URL = "https://functions.poehali.dev/1186dab1-1c68-4be5-95d4-74d1e710571e";

const TOTAL_STEPS = 7;

const STEPS = [
  { id: 1, label: "Тема урока", icon: "BookOpen", hint: "Укажите тему конкретного урока" },
  { id: 2, label: "Цель урока", icon: "Target", hint: "Чего должны достичь ученики по итогу урока?" },
  { id: 3, label: "Задачи урока", icon: "ListChecks", hint: "Образовательные, развивающие и воспитательные задачи" },
  { id: 4, label: "Методическое и техническое оснащение", icon: "Wrench", hint: "Учебники, пособия, оборудование, ИКТ и т.д." },
  { id: 5, label: "Технология обучения", icon: "Layers", hint: "Например: проблемное обучение, ИКТ, игровая, кейс-метод" },
  { id: 6, label: "Класс / курс", icon: "Users", hint: "Выберите класс или укажите возраст аудитории" },
  { id: 7, label: "Длительность урока", icon: "Clock", hint: "Выберите длительность" },
];

const DURATION_OPTIONS = ["45 мин", "90 мин"];

const CLASS_OPTIONS = [
  "1 класс","2 класс","3 класс","4 класс","5 класс","6 класс","7 класс",
  "8 класс","9 класс","10 класс","11 класс","Студенты / взрослые",
];

type LessonStage = {
  name: string;
  duration: string;
  teacher_actions: string;
  student_actions: string;
  method: string;
  materials: string;
};

type LessonPlan = {
  title: string;
  grade: string;
  duration: string;
  goal: string;
  tasks: { educational: string; developmental: string; upbringing: string };
  equipment: string;
  technology: string;
  organizational_moment: LessonStage;
  topic_actualization: LessonStage;
  new_topic: LessonStage;
  practical_work: LessonStage;
  consolidation: LessonStage;
  reflection: LessonStage;
  homework: string;
};

function downloadLesson(lesson: LessonPlan) {
  const sep = "=".repeat(60);
  const lines: string[] = [];
  lines.push(sep);
  lines.push(`ТЕХНОЛОГИЧЕСКАЯ КАРТА УРОКА`);
  lines.push(sep);
  lines.push(`Тема: ${lesson.title}`);
  lines.push(`Класс: ${lesson.grade}`);
  lines.push(`Длительность: ${lesson.duration}`);
  lines.push(`Технология обучения: ${lesson.technology}`);
  lines.push(`\nЦЕЛЬ УРОКА:\n${lesson.goal}`);
  lines.push(`\nЗАДАЧИ УРОКА:`);
  lines.push(`  Образовательные: ${lesson.tasks.educational}`);
  lines.push(`  Развивающие: ${lesson.tasks.developmental}`);
  lines.push(`  Воспитательные: ${lesson.tasks.upbringing}`);
  lines.push(`\nМЕТОДИЧЕСКОЕ И ТЕХНИЧЕСКОЕ ОСНАЩЕНИЕ:\n${lesson.equipment}`);

  const stages = [
    { label: "1. ОРГАНИЗАЦИОННЫЙ МОМЕНТ", data: lesson.organizational_moment },
    { label: "2. АКТУАЛИЗАЦИЯ ТЕМЫ", data: lesson.topic_actualization },
    { label: "3. СООБЩЕНИЕ НОВОЙ ТЕМЫ", data: lesson.new_topic },
    { label: "4. ВЫПОЛНЕНИЕ ПРАКТИЧЕСКОЙ РАБОТЫ", data: lesson.practical_work },
    { label: "5. ЗАКРЕПЛЕНИЕ ИЗУЧЕННОЙ ТЕМЫ", data: lesson.consolidation },
    { label: "6. РЕФЛЕКСИЯ", data: lesson.reflection },
  ];

  lines.push(`\n${sep}`);
  lines.push("ХОД УРОКА");
  lines.push(sep);

  stages.forEach(({ label, data }) => {
    if (!data) return;
    lines.push(`\n${label} (${data.duration})`);
    lines.push(`Действия учителя: ${data.teacher_actions}`);
    lines.push(`Действия учеников: ${data.student_actions}`);
    if (data.method) lines.push(`Метод/приём: ${data.method}`);
    if (data.materials) lines.push(`Материалы: ${data.materials}`);
  });

  lines.push(`\n${sep}`);
  lines.push("ДОМАШНЕЕ ЗАДАНИЕ");
  lines.push(sep);
  lines.push(lesson.homework);

  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${lesson.title.replace(/[^\wа-яёА-ЯЁ\s]/gi, "").trim()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

const STAGE_LABELS: Record<string, string> = {
  organizational_moment: "Организационный момент",
  topic_actualization: "Актуализация темы",
  new_topic: "Сообщение новой темы",
  practical_work: "Практическая работа",
  consolidation: "Закрепление",
  reflection: "Рефлексия",
};

const STAGE_KEYS = ["organizational_moment","topic_actualization","new_topic","practical_work","consolidation","reflection"] as const;

function LessonResult({ lesson, onClose }: { lesson: LessonPlan; onClose: () => void }) {
  const [activeStage, setActiveStage] = useState<string>("organizational_moment");

  const stage = lesson[activeStage as keyof LessonPlan] as LessonStage | undefined;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col animate-fade-in-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 pt-7 pb-5 border-b border-border flex-shrink-0">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-5 h-5 rounded-md bg-primary flex items-center justify-center">
                  <Icon name="Sparkles" size={12} className="text-white" />
                </span>
                <span className="font-body text-xs font-semibold text-primary uppercase tracking-wider">Технологическая карта готова</span>
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground leading-tight">{lesson.title}</h2>
              <p className="font-body text-sm text-muted-foreground mt-1">{lesson.grade} · {lesson.duration} · {lesson.technology}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate flex items-center justify-center transition-colors flex-shrink-0">
              <Icon name="X" size={16} className="text-muted-foreground" />
            </button>
          </div>

          {/* Цель и задачи */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 rounded-xl bg-indigo-light border border-indigo-mid">
              <div className="font-body text-xs font-semibold text-primary uppercase tracking-wider mb-1">Цель урока</div>
              <p className="font-body text-xs text-foreground leading-relaxed">{lesson.goal}</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-light border border-amber-mid">
              <div className="font-body text-xs font-semibold text-amber uppercase tracking-wider mb-1">Оснащение</div>
              <p className="font-body text-xs text-foreground leading-relaxed">{lesson.equipment}</p>
            </div>
          </div>

          {/* Навигация по этапам */}
          <div className="flex gap-1 overflow-x-auto pb-1">
            {STAGE_KEYS.map((key, i) => (
              <button
                key={key}
                onClick={() => setActiveStage(key)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg font-body text-xs font-semibold transition-all whitespace-nowrap ${
                  activeStage === key
                    ? "bg-primary text-white shadow-sm"
                    : "bg-slate text-muted-foreground hover:text-foreground"
                }`}
              >
                {i + 1}. {STAGE_LABELS[key]}
              </button>
            ))}
          </div>
        </div>

        {/* Этап урока */}
        <div className="overflow-y-auto flex-1 px-8 py-6">
          {stage ? (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-body text-sm font-bold flex-shrink-0">
                  {(STAGE_KEYS as readonly string[]).indexOf(activeStage) + 1}
                </div>
                <div>
                  <div className="font-display text-lg font-bold text-foreground">{STAGE_LABELS[activeStage]}</div>
                  <div className="font-body text-xs text-muted-foreground">{stage.duration}</div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="User" size={14} className="text-primary" />
                    <span className="font-body text-xs font-semibold text-primary uppercase tracking-wider">Действия учителя</span>
                  </div>
                  <p className="font-body text-sm text-foreground leading-relaxed">{stage.teacher_actions}</p>
                </div>
                <div className="p-4 rounded-2xl bg-teal-light border border-teal/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="Users" size={14} className="text-teal" />
                    <span className="font-body text-xs font-semibold text-teal uppercase tracking-wider">Действия учеников</span>
                  </div>
                  <p className="font-body text-sm text-foreground leading-relaxed">{stage.student_actions}</p>
                </div>
              </div>

              {(stage.method || stage.materials) && (
                <div className="flex flex-wrap gap-2">
                  {stage.method && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-light border border-indigo-mid">
                      <Icon name="Layers" size={12} className="text-primary" />
                      <span className="font-body text-xs text-primary font-medium">{stage.method}</span>
                    </div>
                  )}
                  {stage.materials && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-light border border-amber-mid">
                      <Icon name="Package" size={12} className="text-amber" />
                      <span className="font-body text-xs font-medium" style={{color: 'hsl(38 80% 30%)'}}>{stage.materials}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-border flex-shrink-0 space-y-3">
          {lesson.homework && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-light border border-amber-mid">
              <Icon name="BookOpen" size={16} className="text-amber flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-body text-xs font-semibold text-amber uppercase tracking-wider">Домашнее задание</span>
                <p className="font-body text-sm text-foreground mt-0.5">{lesson.homework}</p>
              </div>
            </div>
          )}
          <button
            onClick={() => downloadLesson(lesson)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white font-body text-sm font-semibold hover:bg-primary/90 transition-all active:scale-95 shadow-md shadow-primary/25"
          >
            <Icon name="Download" size={16} />
            Скачать технологическую карту
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LessonWizard({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [animating, setAnimating] = useState(false);
  const [form, setForm] = useState({
    topic: "",
    goal: "",
    tasks: "",
    equipment: "",
    technology: "",
    grade: "",
    duration: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lesson, setLesson] = useState<LessonPlan | null>(null);

  const goTo = (next: number, dir: "next" | "prev") => {
    if (animating) return;
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => {
      setStep(next);
      setAnimating(false);
    }, 220);
  };

  const handleNext = async () => {
    if (step < TOTAL_STEPS) { goTo(step + 1, "next"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(GENERATE_LESSON_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.ok && data.lesson) {
        setLesson(data.lesson);
      } else {
        setError("Не удалось сгенерировать урок. Попробуйте ещё раз.");
      }
    } catch {
      setError("Ошибка соединения. Проверьте интернет и попробуйте снова.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrev = () => { if (step > 1) goTo(step - 1, "prev"); };

  const current = STEPS[step - 1];
  const progress = (step / TOTAL_STEPS) * 100;
  const slideClass = animating
    ? direction === "next" ? "opacity-0 translate-x-4" : "opacity-0 -translate-x-4"
    : "opacity-100 translate-x-0";

  // Текущее значение поля
  const fieldMap: Record<number, keyof typeof form> = {
    1: "topic", 2: "goal", 3: "tasks", 4: "equipment", 5: "technology",
  };
  const currentFieldKey = fieldMap[step];

  const canProceed = () => {
    if (step === 6) return !!form.grade;
    if (step === 7) return !!form.duration;
    if (currentFieldKey) return !!form[currentFieldKey].trim();
    return true;
  };

  if (lesson) {
    return <LessonResult lesson={lesson} onClose={onClose} />;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg animate-fade-in-up overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/30">
                <Icon name="GraduationCap" size={16} className="text-white" />
              </span>
              <span className="font-display text-lg font-bold text-foreground">Создание урока</span>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate flex items-center justify-center transition-colors">
              <Icon name="X" size={16} className="text-muted-foreground" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="relative">
            <div className="h-2 bg-slate rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-teal rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-2">
              {STEPS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => s.id < step && goTo(s.id, "prev")}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    s.id < step ? "bg-primary cursor-pointer" : s.id === step ? "bg-primary scale-150" : "bg-slate-mid"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Step content */}
        <div className="px-8 pb-8">
          <div className={`transition-all duration-200 ease-out ${slideClass}`}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-indigo-light flex items-center justify-center">
                <Icon name={current.icon} fallback="BookOpen" size={20} className="text-primary" />
              </div>
              <div>
                <div className="font-body text-xs text-muted-foreground uppercase tracking-wider">Шаг {step} из {TOTAL_STEPS}</div>
                <div className="font-display text-xl font-bold text-foreground">{current.label}</div>
              </div>
            </div>

            {/* Шаг 6 — класс */}
            {step === 6 ? (
              <div className="grid grid-cols-3 gap-2 mb-6">
                {CLASS_OPTIONS.map((cls) => (
                  <button
                    key={cls}
                    onClick={() => setForm(f => ({ ...f, grade: cls }))}
                    className={`px-3 py-2.5 rounded-xl text-sm font-body font-medium border transition-all ${
                      form.grade === cls
                        ? "bg-primary text-white border-primary shadow-sm shadow-primary/20"
                        : "bg-white text-foreground border-border hover:border-primary/30 hover:bg-indigo-light"
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            ) : step === 7 ? (
              /* Шаг 7 — длительность */
              <div className="flex gap-4 mb-6">
                {DURATION_OPTIONS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setForm(f => ({ ...f, duration: d }))}
                    className={`flex-1 py-4 rounded-xl text-base font-body font-semibold border transition-all ${
                      form.duration === d
                        ? "bg-primary text-white border-primary shadow-md shadow-primary/25"
                        : "bg-white text-foreground border-border hover:border-primary/30 hover:bg-indigo-light"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            ) : (
              /* Текстовые шаги */
              <div className="mb-6">
                <textarea
                  value={form[currentFieldKey]}
                  onChange={e => setForm(f => ({ ...f, [currentFieldKey]: e.target.value }))}
                  placeholder={current.hint}
                  autoFocus
                  rows={step === 1 ? 2 : 4}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-slate font-body text-sm focus:outline-none focus:border-primary/40 focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground resize-none"
                />
                {step === 1 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {["Биология","История","Математика","Русский язык","Физика","Химия","Литература","География","Информатика"].map(s => (
                      <button
                        key={s}
                        onClick={() => setForm(f => ({ ...f, topic: s }))}
                        className={`px-3 py-1.5 rounded-full text-xs font-body border transition-all ${
                          form.topic === s
                            ? "bg-primary text-white border-primary"
                            : "bg-white border-border text-muted-foreground hover:border-primary/30 hover:bg-indigo-light"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
                {step === 5 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {["Проблемное обучение","ИКТ-технологии","Игровая технология","Кейс-метод","Проектная деятельность","Развивающее обучение"].map(t => (
                      <button
                        key={t}
                        onClick={() => setForm(f => ({ ...f, technology: t }))}
                        className={`px-3 py-1.5 rounded-full text-xs font-body border transition-all ${
                          form.technology === t
                            ? "bg-primary text-white border-primary"
                            : "bg-white border-border text-muted-foreground hover:border-primary/30 hover:bg-indigo-light"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-2">
                <Icon name="AlertCircle" size={16} className="text-destructive flex-shrink-0" />
                <span className="font-body text-sm text-destructive">{error}</span>
              </div>
            )}

            <div className="flex gap-3">
              {step > 1 && !loading && (
                <button
                  onClick={handlePrev}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl border border-border font-body text-sm font-medium text-foreground hover:bg-slate transition-colors"
                >
                  <Icon name="ChevronLeft" size={16} />
                  Назад
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={loading || !canProceed()}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-white font-body text-sm font-semibold hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-primary/25"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ИИ создаёт карту урока...
                  </>
                ) : step === TOTAL_STEPS ? (
                  <>
                    <Icon name="Sparkles" size={16} />
                    Создать урок
                  </>
                ) : (
                  <>
                    Далее
                    <Icon name="ChevronRight" size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}