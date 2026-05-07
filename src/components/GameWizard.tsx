import { useState } from "react";
import Icon from "@/components/ui/icon";

const GENERATE_GAME_URL = "https://functions.poehali.dev/5626bab5-bf92-4e3d-9994-865dfeda70ec";

const CLASS_OPTIONS = [
  "1 класс","2 класс","3 класс","4 класс","5 класс","6 класс","7 класс",
  "8 класс","9 класс","10 класс","11 класс","Студенты / взрослые",
];
const DURATION_OPTIONS = ["10 мин","15 мин","20 мин","25 мин","30 мин","45 мин"];
const SUBJECTS = ["Биология","История","Математика","Русский язык","Физика","Химия","Литература","География","Информатика","Английский язык"];
const FORMAT_OPTIONS = ["Квиз","Командная настольная игра","Квест-станция","Ролевая симуляция","Цифровая игра","Без гаджетов"];
const TECH_OPTIONS = ["Доска и маркеры","Можно распечатать","Проектор","Компьютеры у учеников","Нет техники"];
const STUDENTS_OPTIONS = ["До 10","10–15","15–20","20–25","25–30","30+"];

type GameMaterial = { type: string; content: string };
type GameStep = { step: number; duration: string; action: string };

type Game = {
  name: string;
  legend: string;
  type: string;
  duration: string;
  subject: string;
  grade: string;
  topic: string;
  goal: string;
  description: string;
  teams: string;
  materials: string;
  rules: string[];
  steps: GameStep[];
  scoring: string;
  game_materials: GameMaterial[];
  adaptation: string;
  digital_tools: string;
  teacher_tips: string[];
  variations: string;
};

function downloadGame(game: Game) {
  const sep = "=".repeat(60);
  const lines: string[] = [
    sep, `ИГРА: ${game.name}`, sep,
    `${game.legend}`, "",
    `Тип: ${game.type} | Предмет: ${game.subject} | Класс: ${game.grade}`,
    `Тема: ${game.topic} | Время: ${game.duration}`, "",
    "ЦЕЛЬ:", game.goal, "",
    "ОПИСАНИЕ:", game.description, "",
    "КОМАНДЫ / РОЛИ:", game.teams, "",
    sep, "МАТЕРИАЛЫ ДЛЯ ПОДГОТОВКИ:", sep, game.materials, "",
    sep, "ПРАВИЛА:", sep,
    ...game.rules.map((r, i) => `${i + 1}. ${r}`), "",
    sep, "ХОД ИГРЫ:", sep,
    ...game.steps.map(s => `Шаг ${s.step} (${s.duration}):\n${s.action}\n`),
    sep, "БАЛЛЫ И ПОБЕДА:", sep, game.scoring, "",
  ];
  if (game.game_materials?.length) {
    lines.push(sep, "ИГРОВЫЕ МАТЕРИАЛЫ (к печати):", sep);
    game.game_materials.forEach((m, i) => lines.push(`${i + 1}. [${m.type}]\n${m.content}\n`));
  }
  lines.push(sep, "АДАПТАЦИЯ:", sep, game.adaptation, "");
  if (game.digital_tools) lines.push("ЦИФРОВЫЕ ИНСТРУМЕНТЫ:", game.digital_tools, "");
  lines.push(sep, "ЛАЙФХАКИ УЧИТЕЛЮ:", sep, ...game.teacher_tips.map((t, i) => `${i + 1}. ${t}`), "");
  if (game.variations) lines.push(sep, "ВАРИАНТЫ:", sep, game.variations);

  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `игра_${game.name.slice(0, 30)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

function GameResult({ game, onClose }: { game: Game; onClose: () => void }) {
  const [tab, setTab] = useState<"overview" | "materials" | "tips">("overview");

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col animate-fade-in-up" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-8 pt-7 pb-5 border-b border-border flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-5 h-5 rounded-md bg-amber flex items-center justify-center">
                  <Icon name="Gamepad2" size={12} className="text-white" />
                </span>
                <span className="font-body text-xs font-semibold text-amber uppercase tracking-wider">Игра готова!</span>
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground leading-tight">{game.name}</h2>
              {game.legend && <p className="font-body text-sm text-muted-foreground mt-1 italic">{game.legend}</p>}
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="px-2 py-0.5 rounded-full badge-indigo font-body text-xs">{game.type}</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-light border border-amber-mid font-body text-xs font-medium text-amber-700">⏱ {game.duration}</span>
                <span className="px-2 py-0.5 rounded-full bg-slate font-body text-xs text-muted-foreground">{game.grade}</span>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate flex items-center justify-center transition-colors flex-shrink-0">
              <Icon name="X" size={16} className="text-muted-foreground" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-slate rounded-xl p-1 mt-4">
            {([["overview","BookOpen","Игра"], ["materials","Printer","Материалы"], ["tips","Lightbulb","Лайфхаки"]] as const).map(([key, icon, label]) => (
              <button key={key} onClick={() => setTab(key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-body text-xs font-semibold transition-all ${tab === key ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                <Icon name={icon} size={12} />{label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-8 py-6 space-y-5">

          {tab === "overview" && (
            <>
              <div className="p-4 rounded-2xl bg-indigo-light border border-indigo-mid">
                <div className="font-body text-xs font-semibold text-primary uppercase tracking-wider mb-1">Цель игры</div>
                <p className="font-body text-sm text-foreground leading-relaxed">{game.goal}</p>
              </div>

              {game.teams && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-teal-light border border-teal/20">
                  <Icon name="Users" size={15} className="text-teal flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-body text-xs font-semibold text-teal uppercase tracking-wider">Команды / роли</span>
                    <p className="font-body text-sm text-foreground mt-0.5">{game.teams}</p>
                  </div>
                </div>
              )}

              {game.materials && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-light border border-amber-mid">
                  <Icon name="Package" size={15} className="text-amber flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-body text-xs font-semibold text-amber uppercase tracking-wider">Подготовка учителя</span>
                    <p className="font-body text-sm text-foreground mt-0.5">{game.materials}</p>
                  </div>
                </div>
              )}

              <div>
                <div className="font-body text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Правила</div>
                <div className="space-y-2">
                  {game.rules.map((rule, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-primary text-white font-body text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                      <p className="font-body text-sm text-foreground leading-relaxed">{rule}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="font-body text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Ход игры (тайминг)</div>
                <div className="space-y-3">
                  {game.steps.map((s, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-7 h-7 rounded-full bg-teal text-white flex items-center justify-center font-body text-xs font-bold flex-shrink-0">{s.step}</div>
                        {i < game.steps.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                      </div>
                      <div className="pb-3 flex-1">
                        <span className="px-2 py-0.5 rounded-full bg-teal-light font-body text-xs text-teal font-medium">{s.duration}</span>
                        <p className="font-body text-sm text-foreground leading-relaxed mt-1">{s.action}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {game.scoring && (
                <div className="p-3 rounded-xl bg-slate border border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon name="Trophy" size={14} className="text-amber" />
                    <span className="font-body text-xs font-semibold text-muted-foreground uppercase tracking-wider">Баллы и победа</span>
                  </div>
                  <p className="font-body text-sm text-foreground">{game.scoring}</p>
                </div>
              )}

              {game.adaptation && (
                <div className="p-3 rounded-xl bg-indigo-light border border-indigo-mid">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon name="Sliders" size={14} className="text-primary" />
                    <span className="font-body text-xs font-semibold text-primary uppercase tracking-wider">Адаптация</span>
                  </div>
                  <p className="font-body text-sm text-foreground leading-relaxed">{game.adaptation}</p>
                </div>
              )}
            </>
          )}

          {tab === "materials" && (
            <>
              {game.game_materials?.length > 0 ? (
                <div>
                  <div className="font-body text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Готово к печати</div>
                  <div className="space-y-3">
                    {game.game_materials.map((m, i) => (
                      <div key={i} className="p-4 rounded-xl border border-border bg-white">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-5 h-5 rounded-full bg-amber text-white font-body text-xs flex items-center justify-center font-bold">{i + 1}</span>
                          <span className="font-body text-xs font-semibold text-amber uppercase tracking-wider">{m.type}</span>
                        </div>
                        <p className="font-body text-sm text-foreground leading-relaxed">{m.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground font-body text-sm">Материалы не требуются для этого формата</div>
              )}

              {game.digital_tools && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-teal-light border border-teal/20">
                  <Icon name="Monitor" size={15} className="text-teal flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-body text-xs font-semibold text-teal uppercase tracking-wider">Цифровые инструменты</span>
                    <p className="font-body text-sm text-foreground mt-0.5">{game.digital_tools}</p>
                  </div>
                </div>
              )}
            </>
          )}

          {tab === "tips" && (
            <>
              {game.teacher_tips?.length > 0 && (
                <div>
                  <div className="font-body text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Лайфхаки учителю</div>
                  <div className="space-y-3">
                    {game.teacher_tips.map((t, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-indigo-light border border-indigo-mid">
                        <Icon name="Lightbulb" size={15} className="text-primary flex-shrink-0 mt-0.5" />
                        <p className="font-body text-sm text-foreground leading-relaxed">{t}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {game.variations && (
                <div className="p-4 rounded-xl bg-slate border border-border">
                  <div className="font-body text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Варианты усложнения / упрощения</div>
                  <p className="font-body text-sm text-foreground leading-relaxed">{game.variations}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-border flex-shrink-0">
          <button onClick={() => downloadGame(game)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber text-foreground font-body text-sm font-bold hover:bg-amber/90 transition-all active:scale-95 shadow-md shadow-amber/25">
            <Icon name="Download" size={16} />
            Скачать игру с материалами
          </button>
        </div>
      </div>
    </div>
  );
}

const STEPS = [
  { label: "Предмет и класс", icon: "BookOpen" },
  { label: "Тема и цель", icon: "Target" },
  { label: "Формат и время", icon: "Gamepad2" },
  { label: "Условия", icon: "Settings" },
];

export default function GameWizard({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [form, setForm] = useState({
    subject: "", grade: "", topic: "", lesson_goal: "",
    game_format: "", duration: "", students_count: "", tech: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [game, setGame] = useState<Game | null>(null);

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
      const res = await fetch(GENERATE_GAME_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.ok && data.game) {
        setGame(data.game);
      } else {
        setError("Не удалось создать игру. Попробуйте ещё раз.");
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

  if (game) return <GameResult game={game} onClose={onClose} />;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg animate-fade-in-up overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-8 pt-8 pb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-amber flex items-center justify-center shadow-md shadow-amber/30">
                <Icon name="Gamepad2" size={16} className="text-white" />
              </span>
              <span className="font-display text-lg font-bold text-foreground">Генератор игры</span>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate flex items-center justify-center transition-colors">
              <Icon name="X" size={16} className="text-muted-foreground" />
            </button>
          </div>

          {/* Progress */}
          <div className="h-2 bg-slate rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber to-amber/70 rounded-full transition-all duration-500" style={{ width: `${(step / 4) * 100}%` }} />
          </div>
          <div className="flex justify-between mt-2">
            {STEPS.map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full transition-all ${i + 1 < step ? "bg-amber" : i + 1 === step ? "bg-amber scale-150" : "bg-slate-mid"}`} />
            ))}
          </div>
        </div>

        <div className="px-8 pb-8">
          <div className={`transition-all duration-200 ease-out ${slideClass}`}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-amber-light flex items-center justify-center">
                <Icon name={STEPS[step - 1].icon} fallback="Gamepad2" size={20} className="text-amber" />
              </div>
              <div>
                <div className="font-body text-xs text-muted-foreground uppercase tracking-wider">Шаг {step} из 4</div>
                <div className="font-display text-xl font-bold text-foreground">{STEPS[step - 1].label}</div>
              </div>
            </div>

            {step === 1 && (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Предмет</label>
                  <div className="flex flex-wrap gap-2">
                    {SUBJECTS.map(s => (
                      <button key={s} onClick={() => setForm(f => ({ ...f, subject: s }))}
                        className={`px-3 py-1.5 rounded-full text-xs font-body border transition-all ${form.subject === s ? "bg-amber text-white border-amber" : "bg-white border-border text-muted-foreground hover:border-amber/40 hover:bg-amber-light"}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Класс</label>
                  <div className="grid grid-cols-4 gap-2">
                    {CLASS_OPTIONS.map(c => (
                      <button key={c} onClick={() => setForm(f => ({ ...f, grade: c }))}
                        className={`px-2 py-2 rounded-xl text-xs font-body font-medium border transition-all ${form.grade === c ? "bg-amber text-white border-amber" : "bg-white border-border text-foreground hover:border-amber/40"}`}>
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
                    placeholder="Например: Квадратные уравнения"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-slate font-body text-sm focus:outline-none focus:border-amber/40 focus:bg-white focus:ring-2 focus:ring-amber/10 transition-all placeholder:text-muted-foreground" />
                </div>
                <div>
                  <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Цель урока <span className="text-muted-foreground font-normal">(необязательно)</span></label>
                  <textarea value={form.lesson_goal} onChange={e => setForm(f => ({ ...f, lesson_goal: e.target.value }))} rows={2}
                    placeholder="Например: закрепить формулы / отработать диалоги на английском"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-slate font-body text-sm focus:outline-none focus:border-amber/40 focus:bg-white transition-all placeholder:text-muted-foreground resize-none" />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="font-body text-sm font-medium text-foreground mb-2 block">Формат игры</label>
                  <div className="flex flex-wrap gap-2">
                    {FORMAT_OPTIONS.map(f => (
                      <button key={f} onClick={() => setForm(fm => ({ ...fm, game_format: f }))}
                        className={`px-3 py-1.5 rounded-full text-xs font-body border transition-all ${form.game_format === f ? "bg-amber text-white border-amber" : "bg-white border-border text-muted-foreground hover:border-amber/40 hover:bg-amber-light"}`}>
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
                        className={`px-4 py-2 rounded-xl text-sm font-body font-medium border transition-all ${form.duration === d ? "bg-amber text-white border-amber" : "bg-white border-border text-foreground hover:border-amber/40"}`}>
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
                        className={`px-4 py-2 rounded-xl text-sm font-body font-medium border transition-all ${form.students_count === s ? "bg-amber text-white border-amber" : "bg-white border-border text-foreground hover:border-amber/40"}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="font-body text-sm font-medium text-foreground mb-2 block">Технические возможности</label>
                  <div className="flex flex-wrap gap-2">
                    {TECH_OPTIONS.map(t => (
                      <button key={t} onClick={() => setForm(f => ({ ...f, tech: f.tech === t ? "" : t }))}
                        className={`px-3 py-1.5 rounded-full text-xs font-body border transition-all ${form.tech === t ? "bg-amber text-white border-amber" : "bg-white border-border text-muted-foreground hover:border-amber/40 hover:bg-amber-light"}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-amber-light border border-amber-mid">
                  <div className="font-body text-xs font-semibold text-amber uppercase tracking-wider mb-2">Итого</div>
                  <div className="space-y-1 font-body text-sm text-foreground">
                    <div><span className="text-muted-foreground">Предмет:</span> {form.subject}, {form.grade}</div>
                    <div><span className="text-muted-foreground">Тема:</span> {form.topic}</div>
                    {form.game_format && <div><span className="text-muted-foreground">Формат:</span> {form.game_format}</div>}
                    <div><span className="text-muted-foreground">Время:</span> {form.duration}</div>
                    {form.students_count && <div><span className="text-muted-foreground">Учеников:</span> {form.students_count}</div>}
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
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber text-white font-body text-sm font-bold hover:bg-amber/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-amber/25">
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Придумываю игру...</>
                ) : step === 4 ? (
                  <><Icon name="Gamepad2" size={16} />Создать игру</>
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
