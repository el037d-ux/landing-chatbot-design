import { useState } from "react";
import Icon from "@/components/ui/icon";

const GENERATE_LESSON_URL = "https://functions.poehali.dev/1186dab1-1c68-4be5-95d4-74d1e710571e";

const STEPS = [
  { id: 1, label: "Предмет / дисциплина", icon: "BookOpen", hint: "Например: биология, история, математика" },
  { id: 2, label: "Класс / курс", icon: "Users", hint: "Выберите класс или укажите возраст аудитории" },
  { id: 3, label: "Тема урока", icon: "Lightbulb", hint: "Тема конкретного урока" },
  { id: 4, label: "Длительность урока", icon: "Clock", hint: "Выберите длительность" },
];

const DURATION_OPTIONS = ["45 мин", "90 мин"];

const CLASS_OPTIONS = [
  "1 класс","2 класс","3 класс","4 класс","5 класс","6 класс","7 класс",
  "8 класс","9 класс","10 класс","11 класс","Студенты / взрослые",
];

type LessonPlan = {
  title: string;
  duration: string;
  overview: string;
  stages: { name: string; duration: string; description: string; method: string; materials: string }[];
  activities: { title: string; type: string; description: string; duration: string }[];
  assessment: { methods: string[]; criteria: string[]; tools: string };
  homework: string;
  tips: string[];
};

function LessonResult({ lesson, onClose }: { lesson: LessonPlan; onClose: () => void }) {
  const [tab, setTab] = useState<"stages" | "activities" | "assessment">("stages");
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 pt-7 pb-5 border-b border-border flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-5 h-5 rounded-md bg-green flex items-center justify-center">
                  <Icon name="Sparkles" size={12} className="text-white" />
                </span>
                <span className="font-body text-xs font-medium text-green uppercase tracking-wider">Урок готов</span>
              </div>
              <h2 className="font-display text-2xl font-semibold text-foreground leading-tight">{lesson.title}</h2>
              <p className="font-body text-sm text-muted-foreground mt-1">{lesson.duration} · {lesson.overview}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-warm flex items-center justify-center transition-colors flex-shrink-0">
              <Icon name="X" size={16} className="text-muted-foreground" />
            </button>
          </div>
          {/* Tabs */}
          <div className="flex gap-1 mt-5 bg-warm rounded-xl p-1">
            {([["stages","Этапы урока"],["activities","Активности"],["assessment","Оценивание"]] as const).map(([t, l]) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-1.5 rounded-lg font-body text-xs font-medium transition-all ${
                  tab === t ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >{l}</button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-8 py-6 space-y-4">
          {tab === "stages" && lesson.stages.map((s, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center font-body text-xs font-bold flex-shrink-0">{i+1}</div>
                {i < lesson.stages.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
              </div>
              <div className="pb-4 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-body font-semibold text-foreground text-sm">{s.name}</span>
                  <span className="px-2 py-0.5 rounded-full bg-warm font-body text-xs text-muted-foreground">{s.duration}</span>
                </div>
                <p className="font-body text-sm text-muted-foreground leading-relaxed mb-1.5">{s.description}</p>
                <div className="flex flex-wrap gap-2">
                  {s.method && <span className="px-2 py-0.5 rounded-full bg-green-light text-green font-body text-xs">📋 {s.method}</span>}
                  {s.materials && <span className="px-2 py-0.5 rounded-full bg-[hsl(38,50%,92%)] text-[hsl(38,50%,35%)] font-body text-xs">🎒 {s.materials}</span>}
                </div>
              </div>
            </div>
          ))}

          {tab === "activities" && lesson.activities.map((a, i) => (
            <div key={i} className="p-4 rounded-2xl border border-border hover:border-green/30 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-full bg-green-light text-green font-body text-xs">{a.type}</span>
                <span className="px-2 py-0.5 rounded-full bg-warm text-muted-foreground font-body text-xs">{a.duration}</span>
              </div>
              <div className="font-body font-semibold text-foreground text-sm mb-1">{a.title}</div>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">{a.description}</p>
            </div>
          ))}

          {tab === "assessment" && lesson.assessment && (
            <div className="space-y-5">
              <div>
                <div className="font-body text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Методы оценивания</div>
                <div className="flex flex-wrap gap-2">
                  {lesson.assessment.methods.map((m, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-warm border border-border">
                      <span className="w-1.5 h-1.5 rounded-full bg-green flex-shrink-0" />
                      <span className="font-body text-sm text-foreground">{m}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="font-body text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Критерии оценки</div>
                <div className="space-y-2">
                  {lesson.assessment.criteria.map((c, i) => (
                    <div key={i} className="flex items-center gap-2.5 p-3 rounded-xl border border-border">
                      <span className="w-5 h-5 rounded-full bg-primary text-white font-body text-xs flex items-center justify-center flex-shrink-0">{i+1}</span>
                      <span className="font-body text-sm text-foreground">{c}</span>
                    </div>
                  ))}
                </div>
              </div>
              {lesson.assessment.tools && (
                <div className="p-4 rounded-xl bg-green-light border border-green/20">
                  <div className="font-body text-xs font-semibold text-green uppercase tracking-wider mb-1">Инструменты</div>
                  <p className="font-body text-sm text-foreground">{lesson.assessment.tools}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {(lesson.homework || (lesson.tips && lesson.tips.length > 0)) && (
          <div className="px-8 py-5 border-t border-border flex-shrink-0 space-y-3">
            {lesson.homework && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[hsl(38,50%,93%)]">
                <Icon name="BookOpen" size={16} className="text-[hsl(38,60%,40%)] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-body text-xs font-semibold text-[hsl(38,60%,40%)] uppercase tracking-wider">Домашнее задание</span>
                  <p className="font-body text-sm text-foreground mt-0.5">{lesson.homework}</p>
                </div>
              </div>
            )}
            {lesson.tips && lesson.tips.length > 0 && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-green-light">
                <Icon name="Lightbulb" size={16} className="text-green flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-body text-xs font-semibold text-green uppercase tracking-wider">Советы педагогу</span>
                  <ul className="mt-1 space-y-0.5">
                    {lesson.tips.map((t, i) => <li key={i} className="font-body text-xs text-foreground">• {t}</li>)}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function LessonWizard({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [animating, setAnimating] = useState(false);
  const [form, setForm] = useState({
    subject: "",
    grade: "",
    topic: "",
    duration: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lesson, setLesson] = useState<LessonPlan | null>(null);

  const fields = ["subject","grade","topic","duration"] as const;

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
    if (step < 4) { goTo(step + 1, "next"); return; }
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
  const fieldKey = fields[step - 1];
  const progress = (step / 4) * 100;
  const slideClass = animating
    ? direction === "next" ? "opacity-0 translate-x-4" : "opacity-0 -translate-x-4"
    : "opacity-100 translate-x-0";

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
              <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white text-xs font-bold font-body">У</span>
              </span>
              <span className="font-display text-lg font-semibold text-foreground">Создание урока</span>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-warm flex items-center justify-center transition-colors">
              <Icon name="X" size={16} className="text-muted-foreground" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="relative">
            <div className="h-1.5 bg-warm rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green to-[hsl(158,45%,60%)] rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-2">
              {STEPS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => goTo(s.id, s.id > step ? "next" : "prev")}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    s.id < step ? "bg-green" : s.id === step ? "bg-green scale-125" : "bg-warm-mid"
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
              <div className="w-10 h-10 rounded-xl bg-green-light flex items-center justify-center">
                <Icon name={current.icon} fallback="BookOpen" size={20} className="text-green" />
              </div>
              <div>
                <div className="font-body text-xs text-muted-foreground uppercase tracking-wider">Шаг {step} из 4</div>
                <div className="font-display text-xl font-semibold text-foreground">{current.label}</div>
              </div>
            </div>

            {step === 4 ? (
              <div className="flex gap-4 mb-6">
                {DURATION_OPTIONS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setForm(f => ({ ...f, duration: d }))}
                    className={`flex-1 py-4 rounded-xl text-base font-body font-semibold border transition-all ${
                      form.duration === d
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-foreground border-border hover:border-green/40 hover:bg-green-light"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            ) : step === 2 ? (
              <div className="grid grid-cols-3 gap-2 mb-6">
                {CLASS_OPTIONS.map((cls) => (
                  <button
                    key={cls}
                    onClick={() => setForm(f => ({ ...f, grade: cls }))}
                    className={`px-3 py-2.5 rounded-xl text-sm font-body font-medium border transition-all ${
                      form.grade === cls
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-foreground border-border hover:border-green/40 hover:bg-green-light"
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            ) : step === 1 ? (
              <div className="mb-6">
                <input
                  type="text"
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  placeholder={current.hint}
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl border border-border bg-warm font-body text-sm focus:outline-none focus:border-green/60 focus:bg-white transition-all placeholder:text-muted-foreground"
                />
                <div className="flex flex-wrap gap-2 mt-3">
                  {["Биология","История","Математика","Русский язык","Физика","Химия","Литература","География"].map(s => (
                    <button
                      key={s}
                      onClick={() => setForm(f => ({ ...f, subject: s }))}
                      className={`px-3 py-1.5 rounded-full text-xs font-body border transition-all ${
                        form.subject === s
                          ? "bg-primary text-white border-primary"
                          : "bg-white border-border text-muted-foreground hover:border-green/40 hover:text-foreground"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <textarea
                value={form[fieldKey]}
                onChange={e => setForm(f => ({ ...f, [fieldKey]: e.target.value }))}
                placeholder={current.hint}
                autoFocus
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-border bg-warm font-body text-sm focus:outline-none focus:border-green/60 focus:bg-white transition-all placeholder:text-muted-foreground resize-none mb-6"
              />
            )}

            {step !== 2 && step !== 4 && <div className="mb-6" />}

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
                  className="flex items-center gap-2 px-5 py-3 rounded-xl border border-border font-body text-sm font-medium text-foreground hover:bg-warm transition-colors"
                >
                  <Icon name="ChevronLeft" size={16} />
                  Назад
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-white font-body text-sm font-medium hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ИИ генерирует урок...
                  </>
                ) : step === 4 ? (
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
