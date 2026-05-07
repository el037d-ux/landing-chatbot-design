import { useState } from "react";
import Icon from "@/components/ui/icon";

const GENERATE_LESSON_URL = "https://functions.poehali.dev/1186dab1-1c68-4be5-95d4-74d1e710571e";

const CLASS_OPTIONS = ["1 класс","2 класс","3 класс","4 класс","5 класс","6 класс","7 класс","8 класс","9 класс","10 класс","11 класс","СПО / колледж","Студенты / взрослые"];
const DURATION_OPTIONS = ["45 мин","60 мин","90 мин","120 мин"];
const FORMAT_OPTIONS = ["Очный","Онлайн","Смешанный","Внеурочное мероприятие"];
const STUDENTS_OPTIONS = ["До 10","10–15","15–20","20–25","25–30","30+"];
const TECH_OPTIONS = ["Проектор","Компьютеры у учеников","Смартфоны","Доска и маркеры","Можно распечатать","Без техники"];
const SUBJECTS = ["Биология","История","Математика","Русский язык","Физика","Химия","Литература","География","Информатика","Английский язык","Обществознание","Классный час"];
const FEATURES_OPTIONS = ["Разноуровневая группа","Есть обучающиеся с ОВЗ","Высокая активность","Низкая мотивация","Дистанционные участники","Смешанные возрасты"];

const STEPS = [
  { label: "Предмет и класс", icon: "BookOpen" },
  { label: "Тема и цель", icon: "Target" },
  { label: "Формат и условия", icon: "Settings" },
  { label: "Результаты", icon: "CheckSquare" },
];

type LessonStage = {
  name: string;
  duration: string;
  goal: string;
  teacher_actions: string;
  student_actions: string;
  method: string;
  materials: string;
};

type LessonPlan = {
  title: string;
  lesson_type: string;
  grade: string;
  duration: string;
  format: string;
  goal: string;
  planned_results: { subject: string; meta: string; personal: string };
  equipment: string;
  interdisciplinary: string;
  stages: LessonStage[];
  homework: { basic: string; advanced: string; creative: string };
  adaptation: string;
  assessment: { formative: string; summative: string; checklist: string[] };
  risks: { risk: string; solution: string }[];
  handouts: { type: string; content: string }[];
  teacher_tips: string[];
};

function downloadLesson(lesson: LessonPlan) {
  const sep = "=".repeat(60);
  const lines: string[] = [
    sep, `ПЛАН-КОНСПЕКТ УРОКА`, sep,
    `Тема: ${lesson.title}`,
    `Тип урока: ${lesson.lesson_type}`,
    `Класс: ${lesson.grade} | Формат: ${lesson.format} | Длительность: ${lesson.duration}`,
    `\nЦЕЛЬ УРОКА:\n${lesson.goal}`,
    `\nПЛАНИРУЕМЫЕ РЕЗУЛЬТАТЫ:`,
    `  Предметные: ${lesson.planned_results.subject}`,
    `  Метапредметные: ${lesson.planned_results.meta}`,
    `  Личностные: ${lesson.planned_results.personal}`,
    `\nОБОРУДОВАНИЕ:\n${lesson.equipment}`,
    `\nМЕЖПРЕДМЕТНЫЕ СВЯЗИ:\n${lesson.interdisciplinary}`,
    `\n${sep}`, "ХОД УРОКА", sep,
  ];
  lesson.stages?.forEach((s, i) => {
    lines.push(`\n${i + 1}. ${s.name} (${s.duration})`);
    lines.push(`Цель этапа: ${s.goal}`);
    lines.push(`Учитель: ${s.teacher_actions}`);
    lines.push(`Обучающиеся: ${s.student_actions}`);
    if (s.method) lines.push(`Метод: ${s.method}`);
    if (s.materials) lines.push(`Материалы: ${s.materials}`);
  });
  lines.push(`\n${sep}`, "ДОМАШНЕЕ ЗАДАНИЕ", sep);
  lines.push(`Базовое: ${lesson.homework?.basic}`);
  lines.push(`Повышенное: ${lesson.homework?.advanced}`);
  lines.push(`Творческое: ${lesson.homework?.creative}`);
  lines.push(`\n${sep}`, "АДАПТАЦИЯ", sep, lesson.adaptation);
  lines.push(`\n${sep}`, "КРИТЕРИИ ОЦЕНКИ", sep);
  lines.push(`Формативные: ${lesson.assessment?.formative}`);
  lines.push(`Суммативные: ${lesson.assessment?.summative}`);
  lines.push(`\nЧек-лист самопроверки:`);
  lesson.assessment?.checklist?.forEach((c, i) => lines.push(`  ${i + 1}. ${c}`));
  if (lesson.risks?.length) {
    lines.push(`\n${sep}`, "РИСКИ И ЛАЙФХАКИ", sep);
    lesson.risks.forEach(r => lines.push(`⚠ ${r.risk}\n→ ${r.solution}\n`));
  }
  if (lesson.handouts?.length) {
    lines.push(`\n${sep}`, "РАЗДАТОЧНЫЕ МАТЕРИАЛЫ (к печати)", sep);
    lesson.handouts.forEach((h, i) => lines.push(`${i + 1}. [${h.type}]\n${h.content}\n`));
  }
  if (lesson.teacher_tips?.length) {
    lines.push(`\n${sep}`, "СОВЕТЫ УЧИТЕЛЮ", sep);
    lesson.teacher_tips.forEach((t, i) => lines.push(`${i + 1}. ${t}`));
  }

  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `конспект_${lesson.title?.slice(0, 30)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

function LessonResult({ lesson, onClose }: { lesson: LessonPlan; onClose: () => void }) {
  const [tab, setTab] = useState<"plan" | "handouts" | "assessment" | "risks">("plan");
  const [activeStage, setActiveStage] = useState(0);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col animate-fade-in-up" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="px-8 pt-7 pb-4 border-b border-border flex-shrink-0">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-5 h-5 rounded-md bg-primary flex items-center justify-center">
                  <Icon name="Sparkles" size={12} className="text-white" />
                </span>
                <span className="font-body text-xs font-semibold text-primary uppercase tracking-wider">План-конспект готов</span>
              </div>
              <h2 className="font-display text-xl font-bold text-foreground leading-tight">{lesson.title}</h2>
              <div className="flex flex-wrap gap-2 mt-1.5">
                <span className="px-2 py-0.5 rounded-full bg-indigo-light border border-indigo-mid font-body text-xs text-primary">{lesson.lesson_type}</span>
                <span className="px-2 py-0.5 rounded-full bg-slate font-body text-xs text-muted-foreground">{lesson.grade}</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-light border border-amber-mid font-body text-xs text-amber-700">⏱ {lesson.duration}</span>
                <span className="px-2 py-0.5 rounded-full bg-teal-light border border-teal/20 font-body text-xs text-teal">{lesson.format}</span>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate flex items-center justify-center transition-colors flex-shrink-0">
              <Icon name="X" size={16} className="text-muted-foreground" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-slate rounded-xl p-1">
            {([
              ["plan", "BookOpen", "Ход урока"],
              ["handouts", "Printer", "Материалы"],
              ["assessment", "CheckSquare", "Оценка"],
              ["risks", "AlertTriangle", "Риски"],
            ] as const).map(([key, icon, label]) => (
              <button key={key} onClick={() => setTab(key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-body text-xs font-semibold transition-all ${tab === key ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                <Icon name={icon} size={12} />{label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-8 py-5 space-y-4">

          {tab === "plan" && (
            <>
              {/* Цель и результаты */}
              <div className="p-4 rounded-2xl bg-indigo-light border border-indigo-mid">
                <div className="font-body text-xs font-semibold text-primary uppercase tracking-wider mb-1">Цель урока</div>
                <p className="font-body text-sm text-foreground">{lesson.goal}</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Предметные", text: lesson.planned_results?.subject, color: "bg-indigo-light border-indigo-mid text-primary" },
                  { label: "Метапредметные", text: lesson.planned_results?.meta, color: "bg-teal-light border-teal/20 text-teal" },
                  { label: "Личностные", text: lesson.planned_results?.personal, color: "bg-amber-light border-amber-mid text-amber-700" },
                ].map(({ label, text, color }) => (
                  <div key={label} className={`p-3 rounded-xl border ${color.split(" ")[0]} ${color.split(" ")[1]}`}>
                    <div className={`font-body text-xs font-semibold uppercase tracking-wider mb-1 ${color.split(" ")[2]}`}>{label}</div>
                    <p className="font-body text-xs text-foreground leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>

              {/* Навигация по этапам */}
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {lesson.stages?.map((s, i) => (
                  <button key={i} onClick={() => setActiveStage(i)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-lg font-body text-xs font-semibold transition-all whitespace-nowrap ${activeStage === i ? "bg-primary text-white" : "bg-slate text-muted-foreground hover:text-foreground"}`}>
                    {i + 1}. {s.name}
                  </button>
                ))}
              </div>

              {/* Активный этап */}
              {lesson.stages?.[activeStage] && (() => {
                const s = lesson.stages[activeStage];
                return (
                  <div className="space-y-3 animate-fade-in">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-body text-sm font-bold">{activeStage + 1}</div>
                      <div>
                        <div className="font-display text-lg font-bold text-foreground">{s.name}</div>
                        <div className="font-body text-xs text-muted-foreground">{s.duration} · {s.goal}</div>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="p-4 rounded-2xl bg-slate border border-border">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon name="User" size={13} className="text-primary" />
                          <span className="font-body text-xs font-semibold text-primary uppercase tracking-wider">Учитель</span>
                        </div>
                        <p className="font-body text-sm text-foreground leading-relaxed">{s.teacher_actions}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-teal-light border border-teal/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon name="Users" size={13} className="text-teal" />
                          <span className="font-body text-xs font-semibold text-teal uppercase tracking-wider">Обучающиеся</span>
                        </div>
                        <p className="font-body text-sm text-foreground leading-relaxed">{s.student_actions}</p>
                      </div>
                    </div>
                    {(s.method || s.materials) && (
                      <div className="flex flex-wrap gap-2">
                        {s.method && <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-light border border-indigo-mid"><Icon name="Layers" size={12} className="text-primary" /><span className="font-body text-xs text-primary">{s.method}</span></div>}
                        {s.materials && <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-light border border-amber-mid"><Icon name="Package" size={12} className="text-amber" /><span className="font-body text-xs text-amber-700">{s.materials}</span></div>}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* ДЗ */}
              {lesson.homework && (
                <div className="p-4 rounded-2xl bg-slate border border-border">
                  <div className="font-body text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Домашнее задание</div>
                  <div className="space-y-2">
                    {[
                      { label: "Базовое", text: lesson.homework.basic, color: "text-teal" },
                      { label: "Повышенное", text: lesson.homework.advanced, color: "text-primary" },
                      { label: "Творческое", text: lesson.homework.creative, color: "text-amber" },
                    ].map(({ label, text, color }) => text && (
                      <div key={label} className="flex items-start gap-2">
                        <span className={`font-body text-xs font-bold ${color} flex-shrink-0 mt-0.5 w-20`}>{label}:</span>
                        <p className="font-body text-sm text-foreground">{text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Адаптация */}
              {lesson.adaptation && (
                <div className="p-4 rounded-2xl bg-indigo-light border border-indigo-mid">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon name="Sliders" size={13} className="text-primary" />
                    <span className="font-body text-xs font-semibold text-primary uppercase tracking-wider">Адаптация и инклюзия</span>
                  </div>
                  <p className="font-body text-sm text-foreground leading-relaxed">{lesson.adaptation}</p>
                </div>
              )}
            </>
          )}

          {tab === "handouts" && (
            <>
              <div className="font-body text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Готово к копированию и печати</div>
              {lesson.handouts?.length > 0 ? (
                <div className="space-y-3">
                  {lesson.handouts.map((h, i) => (
                    <div key={i} className="p-4 rounded-xl border border-border bg-white">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-5 h-5 rounded-full bg-primary text-white font-body text-xs flex items-center justify-center font-bold">{i + 1}</span>
                        <span className="font-body text-xs font-semibold text-primary uppercase tracking-wider">{h.type}</span>
                      </div>
                      <p className="font-body text-sm text-foreground leading-relaxed whitespace-pre-line">{h.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground font-body text-sm">Раздаточные материалы не требуются</div>
              )}

              {lesson.interdisciplinary && (
                <div className="p-4 rounded-xl bg-teal-light border border-teal/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon name="GitBranch" size={13} className="text-teal" />
                    <span className="font-body text-xs font-semibold text-teal uppercase tracking-wider">Межпредметные связи</span>
                  </div>
                  <p className="font-body text-sm text-foreground">{lesson.interdisciplinary}</p>
                </div>
              )}
            </>
          )}

          {tab === "assessment" && (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-teal-light border border-teal/20">
                  <div className="font-body text-xs font-semibold text-teal uppercase tracking-wider mb-2">Формативные (в процессе)</div>
                  <p className="font-body text-sm text-foreground leading-relaxed">{lesson.assessment?.formative}</p>
                </div>
                <div className="p-4 rounded-2xl bg-indigo-light border border-indigo-mid">
                  <div className="font-body text-xs font-semibold text-primary uppercase tracking-wider mb-2">Суммативные (итог)</div>
                  <p className="font-body text-sm text-foreground leading-relaxed">{lesson.assessment?.summative}</p>
                </div>
              </div>

              {lesson.assessment?.checklist?.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate border border-border">
                  <div className="font-body text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Чек-лист самопроверки ученика</div>
                  <div className="space-y-2">
                    {lesson.assessment.checklist.map((c, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <div className="w-4 h-4 rounded border-2 border-border flex-shrink-0 mt-0.5" />
                        <span className="font-body text-sm text-foreground">{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {lesson.teacher_tips?.length > 0 && (
                <div>
                  <div className="font-body text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Советы учителю</div>
                  <div className="space-y-2">
                    {lesson.teacher_tips.map((t, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-indigo-light border border-indigo-mid">
                        <Icon name="Lightbulb" size={14} className="text-primary flex-shrink-0 mt-0.5" />
                        <p className="font-body text-sm text-foreground">{t}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {tab === "risks" && (
            <>
              {lesson.risks?.length > 0 ? (
                <div className="space-y-3">
                  {lesson.risks.map((r, i) => (
                    <div key={i} className="p-4 rounded-xl border border-border bg-white">
                      <div className="flex items-start gap-2 mb-2">
                        <Icon name="AlertTriangle" size={15} className="text-amber flex-shrink-0 mt-0.5" />
                        <p className="font-body text-sm font-semibold text-foreground">{r.risk}</p>
                      </div>
                      <div className="flex items-start gap-2 pl-5">
                        <Icon name="ArrowRight" size={13} className="text-teal flex-shrink-0 mt-0.5" />
                        <p className="font-body text-sm text-foreground leading-relaxed">{r.solution}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground font-body text-sm">Риски не обнаружены</div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-border flex-shrink-0">
          <button onClick={() => downloadLesson(lesson)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white font-body text-sm font-bold hover:bg-primary/90 transition-all active:scale-95 shadow-md shadow-primary/25">
            <Icon name="Download" size={16} />
            Скачать план-конспект
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LessonWizard({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [form, setForm] = useState({
    subject: "", grade: "", topic: "", goal: "",
    lesson_format: "", duration: "", students_count: "", tech: "",
    group_features: "", technology: "",
    results_subject: "", results_meta: "", results_personal: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lesson, setLesson] = useState<LessonPlan | null>(null);

  const goTo = (next: number, dir: "next" | "prev") => {
    if (animating) return;
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => { setStep(next); setAnimating(false); }, 200);
  };

  const canProceed = () => {
    if (step === 1) return !!form.subject && !!form.grade;
    if (step === 2) return !!form.topic.trim();
    if (step === 3) return !!form.duration;
    return true;
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
        setError("Не удалось создать план. Попробуйте ещё раз.");
      }
    } catch {
      setError("Ошибка соединения.");
    } finally {
      setLoading(false);
    }
  };

  const slideClass = animating
    ? direction === "next" ? "opacity-0 translate-x-4" : "opacity-0 -translate-x-4"
    : "opacity-100 translate-x-0";

  if (lesson) return <LessonResult lesson={lesson} onClose={onClose} />;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg animate-fade-in-up overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-8 pt-8 pb-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/30">
                <Icon name="BookOpen" size={16} className="text-white" />
              </span>
              <span className="font-display text-lg font-bold text-foreground">Генератор урока</span>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate flex items-center justify-center transition-colors">
              <Icon name="X" size={16} className="text-muted-foreground" />
            </button>
          </div>
          <div className="h-2 bg-slate rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-500" style={{ width: `${(step / 4) * 100}%` }} />
          </div>
          <div className="flex justify-between mt-2">
            {STEPS.map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full transition-all ${i + 1 < step ? "bg-primary" : i + 1 === step ? "bg-primary scale-150" : "bg-slate-mid"}`} />
            ))}
          </div>
        </div>

        <div className="px-8 pb-8">
          <div className={`transition-all duration-200 ease-out ${slideClass}`}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-indigo-light flex items-center justify-center">
                <Icon name={STEPS[step - 1].icon} fallback="BookOpen" size={20} className="text-primary" />
              </div>
              <div>
                <div className="font-body text-xs text-muted-foreground uppercase tracking-wider">Шаг {step} из 4</div>
                <div className="font-display text-xl font-bold text-foreground">{STEPS[step - 1].label}</div>
              </div>
            </div>

            {step === 1 && (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Предмет / дисциплина</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {SUBJECTS.map(s => (
                      <button key={s} onClick={() => setForm(f => ({ ...f, subject: s }))}
                        className={`px-3 py-1.5 rounded-full text-xs font-body border transition-all ${form.subject === s ? "bg-primary text-white border-primary" : "bg-white border-border text-muted-foreground hover:border-primary/40 hover:bg-indigo-light"}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                  <input type="text" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                    placeholder="Или введите свой предмет..."
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-slate font-body text-sm focus:outline-none focus:border-primary/40 focus:bg-white transition-all placeholder:text-muted-foreground" />
                </div>
                <div>
                  <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Класс / возраст</label>
                  <div className="grid grid-cols-4 gap-2">
                    {CLASS_OPTIONS.map(c => (
                      <button key={c} onClick={() => setForm(f => ({ ...f, grade: c }))}
                        className={`px-2 py-2 rounded-xl text-xs font-body font-medium border transition-all ${form.grade === c ? "bg-primary text-white border-primary" : "bg-white border-border text-foreground hover:border-primary/40"}`}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Тема урока</label>
                  <input type="text" value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))} autoFocus
                    placeholder="Например: Фотосинтез"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-slate font-body text-sm focus:outline-none focus:border-primary/40 focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground" />
                </div>
                <div>
                  <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Цель урока <span className="text-muted-foreground font-normal">(необязательно)</span></label>
                  <textarea value={form.goal} onChange={e => setForm(f => ({ ...f, goal: e.target.value }))} rows={2}
                    placeholder="Например: сформировать понимание / отработать навык..."
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-slate font-body text-sm focus:outline-none focus:border-primary/40 focus:bg-white transition-all placeholder:text-muted-foreground resize-none" />
                </div>
                <div>
                  <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Особенности группы <span className="text-muted-foreground font-normal">(необязательно)</span></label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {FEATURES_OPTIONS.map(f => (
                      <button key={f} onClick={() => setForm(fm => ({ ...fm, group_features: fm.group_features === f ? "" : f }))}
                        className={`px-3 py-1.5 rounded-full text-xs font-body border transition-all ${form.group_features === f ? "bg-primary text-white border-primary" : "bg-white border-border text-muted-foreground hover:border-primary/40"}`}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="font-body text-sm font-medium text-foreground mb-2 block">Формат</label>
                  <div className="flex flex-wrap gap-2">
                    {FORMAT_OPTIONS.map(f => (
                      <button key={f} onClick={() => setForm(fm => ({ ...fm, lesson_format: f }))}
                        className={`px-4 py-2 rounded-xl text-sm font-body font-medium border transition-all ${form.lesson_format === f ? "bg-primary text-white border-primary" : "bg-white border-border text-foreground hover:border-primary/40"}`}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="font-body text-sm font-medium text-foreground mb-2 block">Длительность</label>
                  <div className="flex flex-wrap gap-2">
                    {DURATION_OPTIONS.map(d => (
                      <button key={d} onClick={() => setForm(f => ({ ...f, duration: d }))}
                        className={`px-4 py-2 rounded-xl text-sm font-body font-medium border transition-all ${form.duration === d ? "bg-primary text-white border-primary" : "bg-white border-border text-foreground hover:border-primary/40"}`}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="font-body text-sm font-medium text-foreground mb-2 block">Количество учеников</label>
                  <div className="flex flex-wrap gap-2">
                    {STUDENTS_OPTIONS.map(s => (
                      <button key={s} onClick={() => setForm(f => ({ ...f, students_count: s }))}
                        className={`px-4 py-2 rounded-xl text-sm font-body font-medium border transition-all ${form.students_count === s ? "bg-primary text-white border-primary" : "bg-white border-border text-foreground hover:border-primary/40"}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="font-body text-sm font-medium text-foreground mb-2 block">Технические возможности</label>
                  <div className="flex flex-wrap gap-2">
                    {TECH_OPTIONS.map(t => (
                      <button key={t} onClick={() => setForm(f => ({ ...f, tech: f.tech === t ? "" : t }))}
                        className={`px-3 py-1.5 rounded-full text-xs font-body border transition-all ${form.tech === t ? "bg-primary text-white border-primary" : "bg-white border-border text-muted-foreground hover:border-primary/40"}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Предметные результаты <span className="text-muted-foreground font-normal">(необязательно)</span></label>
                  <input type="text" value={form.results_subject} onChange={e => setForm(f => ({ ...f, results_subject: e.target.value }))}
                    placeholder="Что узнают / научатся делать"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-slate font-body text-sm focus:outline-none focus:border-primary/40 focus:bg-white transition-all placeholder:text-muted-foreground" />
                </div>
                <div>
                  <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Метапредметные УУД <span className="text-muted-foreground font-normal">(необязательно)</span></label>
                  <input type="text" value={form.results_meta} onChange={e => setForm(f => ({ ...f, results_meta: e.target.value }))}
                    placeholder="Коммуникация, критическое мышление, рефлексия"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-slate font-body text-sm focus:outline-none focus:border-primary/40 focus:bg-white transition-all placeholder:text-muted-foreground" />
                </div>
                <div>
                  <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Личностные результаты <span className="text-muted-foreground font-normal">(необязательно)</span></label>
                  <input type="text" value={form.results_personal} onChange={e => setForm(f => ({ ...f, results_personal: e.target.value }))}
                    placeholder="Ценности, мотивация, социальная ответственность"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-slate font-body text-sm focus:outline-none focus:border-primary/40 focus:bg-white transition-all placeholder:text-muted-foreground" />
                </div>
                <div className="p-4 rounded-xl bg-indigo-light border border-indigo-mid">
                  <div className="font-body text-xs font-semibold text-primary uppercase tracking-wider mb-2">Итого</div>
                  <div className="space-y-1 font-body text-sm text-foreground">
                    <div><span className="text-muted-foreground">Предмет:</span> {form.subject}, {form.grade}</div>
                    <div><span className="text-muted-foreground">Тема:</span> {form.topic}</div>
                    {form.lesson_format && <div><span className="text-muted-foreground">Формат:</span> {form.lesson_format}</div>}
                    <div><span className="text-muted-foreground">Время:</span> {form.duration}</div>
                  </div>
                </div>
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
                <button onClick={() => goTo(step - 1, "prev")}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl border border-border font-body text-sm font-medium text-foreground hover:bg-slate transition-colors">
                  <Icon name="ChevronLeft" size={16} />Назад
                </button>
              )}
              <button onClick={handleNext} disabled={loading || !canProceed()}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-white font-body text-sm font-bold hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-primary/25">
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Создаю план-конспект...</>
                ) : step === 4 ? (
                  <><Icon name="Sparkles" size={16} />Создать план-конспект</>
                ) : (
                  <>Далее<Icon name="ChevronRight" size={16} /></>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
