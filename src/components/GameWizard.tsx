import { useState } from "react";
import Icon from "@/components/ui/icon";

const GENERATE_GAME_URL = "https://functions.poehali.dev/5626bab5-bf92-4e3d-9994-865dfeda70ec";

const TOTAL_STEPS = 4;

const CLASS_OPTIONS = [
  "1 класс","2 класс","3 класс","4 класс","5 класс","6 класс","7 класс",
  "8 класс","9 класс","10 класс","11 класс","Студенты / взрослые",
];

const DURATION_OPTIONS = ["5 мин", "10 мин", "15 мин"];

const SUBJECTS = ["Биология","История","Математика","Русский язык","Физика","Химия","Литература","География","Информатика","Английский язык"];

type GameStep = { step: number; duration: string; action: string };

type Game = {
  name: string;
  type: string;
  duration: string;
  subject: string;
  grade: string;
  topic: string;
  goal: string;
  description: string;
  materials: string;
  rules: string[];
  steps: GameStep[];
  teacher_tips: string[];
  variations: string;
};

function downloadGame(game: Game) {
  const sep = "=".repeat(60);
  const lines: string[] = [];
  lines.push(sep);
  lines.push(`ИГРА ДЛЯ УРОКА: ${game.name}`);
  lines.push(sep);
  lines.push(`Тип: ${game.type}`);
  lines.push(`Предмет: ${game.subject} | Класс: ${game.grade}`);
  lines.push(`Тема: ${game.topic}`);
  lines.push(`Время: ${game.duration}`);
  lines.push(`\nЦЕЛЬ ИГРЫ:\n${game.goal}`);
  lines.push(`\nОПИСАНИЕ:\n${game.description}`);
  lines.push(`\nМАТЕРИАЛЫ:\n${game.materials}`);
  lines.push(`\n${sep}`);
  lines.push("ПРАВИЛА");
  lines.push(sep);
  game.rules.forEach((r, i) => lines.push(`${i + 1}. ${r}`));
  lines.push(`\n${sep}`);
  lines.push("ХОД ИГРЫ");
  lines.push(sep);
  game.steps.forEach(s => lines.push(`\nШаг ${s.step} (${s.duration}):\n${s.action}`));
  if (game.teacher_tips?.length) {
    lines.push(`\n${sep}`);
    lines.push("СОВЕТЫ УЧИТЕЛЮ");
    lines.push(sep);
    game.teacher_tips.forEach((t, i) => lines.push(`${i + 1}. ${t}`));
  }
  if (game.variations) {
    lines.push(`\n${sep}`);
    lines.push("ВАРИАНТЫ");
    lines.push(sep);
    lines.push(game.variations);
  }

  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${game.name.replace(/[^\wа-яёА-ЯЁ\s]/gi, "").trim()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

function GameResult({ game, onClose }: { game: Game; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col animate-fade-in-up"
        onClick={e => e.stopPropagation()}
      >
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
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="px-2 py-0.5 rounded-full badge-indigo font-body text-xs">{game.type}</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-light border border-amber-mid font-body text-xs font-medium" style={{color:'hsl(38 80% 30%)'}}>⏱ {game.duration}</span>
                <span className="px-2 py-0.5 rounded-full bg-slate font-body text-xs text-muted-foreground">{game.grade}</span>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate flex items-center justify-center transition-colors flex-shrink-0">
              <Icon name="X" size={16} className="text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-8 py-6 space-y-5">
          {/* Цель и описание */}
          <div className="p-4 rounded-2xl bg-indigo-light border border-indigo-mid">
            <div className="font-body text-xs font-semibold text-primary uppercase tracking-wider mb-1">Цель игры</div>
            <p className="font-body text-sm text-foreground leading-relaxed">{game.goal}</p>
          </div>

          <div>
            <p className="font-body text-sm text-muted-foreground leading-relaxed">{game.description}</p>
          </div>

          {/* Материалы */}
          {game.materials && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-light border border-amber-mid">
              <Icon name="Package" size={15} className="text-amber flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-body text-xs font-semibold text-amber uppercase tracking-wider">Материалы</span>
                <p className="font-body text-sm text-foreground mt-0.5">{game.materials}</p>
              </div>
            </div>
          )}

          {/* Правила */}
          <div>
            <div className="font-body text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Правила игры</div>
            <div className="space-y-2">
              {game.rules.map((rule, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-primary text-white font-body text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  <p className="font-body text-sm text-foreground leading-relaxed">{rule}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Ход игры */}
          <div>
            <div className="font-body text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Ход игры</div>
            <div className="space-y-3">
              {game.steps.map((s, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-teal text-white flex items-center justify-center font-body text-xs font-bold flex-shrink-0">{s.step}</div>
                    {i < game.steps.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                  </div>
                  <div className="pb-3 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-full bg-teal-light font-body text-xs text-teal font-medium">{s.duration}</span>
                    </div>
                    <p className="font-body text-sm text-foreground leading-relaxed">{s.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Советы */}
          {game.teacher_tips?.length > 0 && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-indigo-light border border-indigo-mid">
              <Icon name="Lightbulb" size={15} className="text-primary flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-body text-xs font-semibold text-primary uppercase tracking-wider">Советы учителю</span>
                <ul className="mt-1 space-y-1">
                  {game.teacher_tips.map((t, i) => <li key={i} className="font-body text-xs text-foreground">• {t}</li>)}
                </ul>
              </div>
            </div>
          )}

          {/* Варианты */}
          {game.variations && (
            <div className="p-3 rounded-xl bg-slate border border-border">
              <div className="font-body text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Варианты</div>
              <p className="font-body text-xs text-foreground leading-relaxed">{game.variations}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-border flex-shrink-0">
          <button
            onClick={() => downloadGame(game)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber text-foreground font-body text-sm font-bold hover:bg-amber/90 transition-all active:scale-95 shadow-md shadow-amber/25"
          >
            <Icon name="Download" size={16} />
            Скачать бесплатно
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GameWizard({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [animating, setAnimating] = useState(false);
  const [form, setForm] = useState({ subject: "", grade: "", duration: "", topic: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [game, setGame] = useState<Game | null>(null);

  const goTo = (next: number, dir: "next" | "prev") => {
    if (animating) return;
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => { setStep(next); setAnimating(false); }, 220);
  };

  const handleNext = async () => {
    if (step < TOTAL_STEPS) { goTo(step + 1, "next"); return; }
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
        setError("Не удалось придумать игру. Попробуйте ещё раз.");
      }
    } catch {
      setError("Ошибка соединения. Проверьте интернет и попробуйте снова.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrev = () => { if (step > 1) goTo(step - 1, "prev"); };

  const canProceed = () => {
    if (step === 1) return !!form.subject.trim();
    if (step === 2) return !!form.grade;
    if (step === 3) return !!form.duration;
    if (step === 4) return !!form.topic.trim();
    return true;
  };

  const progress = (step / TOTAL_STEPS) * 100;
  const slideClass = animating
    ? direction === "next" ? "opacity-0 translate-x-4" : "opacity-0 -translate-x-4"
    : "opacity-100 translate-x-0";

  const stepTitles = ["Предмет / дисциплина", "Класс / группа", "Время на игру", "Тема урока"];
  const stepIcons = ["BookOpen", "Users", "Timer", "Lightbulb"];

  if (game) return <GameResult game={game} onClose={onClose} />;

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
              <span className="w-8 h-8 rounded-xl bg-amber flex items-center justify-center shadow-md shadow-amber/30">
                <Icon name="Gamepad2" size={16} className="text-white" />
              </span>
              <span className="font-display text-lg font-bold text-foreground">Придумай игру</span>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate flex items-center justify-center transition-colors">
              <Icon name="X" size={16} className="text-muted-foreground" />
            </button>
          </div>

          <div className="h-2 bg-slate rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber to-primary rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <button
                key={i}
                onClick={() => i + 1 < step && goTo(i + 1, "prev")}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i + 1 < step ? "bg-amber cursor-pointer" : i + 1 === step ? "bg-amber scale-150" : "bg-slate-mid"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="px-8 pb-8">
          <div className={`transition-all duration-200 ease-out ${slideClass}`}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-amber-light flex items-center justify-center">
                <Icon name={stepIcons[step - 1]} fallback="BookOpen" size={20} className="text-amber" />
              </div>
              <div>
                <div className="font-body text-xs text-muted-foreground uppercase tracking-wider">Шаг {step} из {TOTAL_STEPS}</div>
                <div className="font-display text-xl font-bold text-foreground">{stepTitles[step - 1]}</div>
              </div>
            </div>

            {/* Шаг 1 — предмет */}
            {step === 1 && (
              <div className="mb-6">
                <input
                  type="text"
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  placeholder="Например: биология, история, математика"
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl border border-border bg-slate font-body text-sm focus:outline-none focus:border-amber/40 focus:bg-white focus:ring-2 focus:ring-amber/10 transition-all placeholder:text-muted-foreground"
                />
                <div className="flex flex-wrap gap-2 mt-3">
                  {SUBJECTS.map(s => (
                    <button
                      key={s}
                      onClick={() => setForm(f => ({ ...f, subject: s }))}
                      className={`px-3 py-1.5 rounded-full text-xs font-body border transition-all ${
                        form.subject === s
                          ? "bg-amber text-white border-amber"
                          : "bg-white border-border text-muted-foreground hover:border-amber/40 hover:bg-amber-light"
                      }`}
                    >{s}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Шаг 2 — класс */}
            {step === 2 && (
              <div className="grid grid-cols-3 gap-2 mb-6">
                {CLASS_OPTIONS.map(cls => (
                  <button
                    key={cls}
                    onClick={() => setForm(f => ({ ...f, grade: cls }))}
                    className={`px-3 py-2.5 rounded-xl text-sm font-body font-medium border transition-all ${
                      form.grade === cls
                        ? "bg-amber text-white border-amber shadow-sm shadow-amber/20"
                        : "bg-white text-foreground border-border hover:border-amber/40 hover:bg-amber-light"
                    }`}
                  >{cls}</button>
                ))}
              </div>
            )}

            {/* Шаг 3 — время */}
            {step === 3 && (
              <div className="flex gap-4 mb-6">
                {DURATION_OPTIONS.map(d => (
                  <button
                    key={d}
                    onClick={() => setForm(f => ({ ...f, duration: d }))}
                    className={`flex-1 py-5 rounded-xl text-lg font-display font-bold border transition-all ${
                      form.duration === d
                        ? "bg-amber text-white border-amber shadow-md shadow-amber/25"
                        : "bg-white text-foreground border-border hover:border-amber/40 hover:bg-amber-light"
                    }`}
                  >{d}</button>
                ))}
              </div>
            )}

            {/* Шаг 4 — тема */}
            {step === 4 && (
              <div className="mb-6">
                <textarea
                  value={form.topic}
                  onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
                  placeholder="Например: Фотосинтез, Великая Отечественная война, Дроби"
                  autoFocus
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-slate font-body text-sm focus:outline-none focus:border-amber/40 focus:bg-white focus:ring-2 focus:ring-amber/10 transition-all placeholder:text-muted-foreground resize-none"
                />
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
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber text-foreground font-body text-sm font-bold hover:bg-amber/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-amber/25"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                    ИИ придумывает игру...
                  </>
                ) : step === TOTAL_STEPS ? (
                  <>
                    <Icon name="Gamepad2" size={16} />
                    Придумать игру
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
