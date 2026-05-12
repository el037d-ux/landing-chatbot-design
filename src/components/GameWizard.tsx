import { useState } from "react";
import Icon from "@/components/ui/icon";
import { STEPS, GENERATE_GAME_URL, Game, GameForm } from "./game/GameTypes";
import GameResultModal from "./game/GameResultModal";
import GameWizardSteps from "./game/GameWizardSteps";

export default function GameWizard({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [form, setForm] = useState<GameForm>({
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

  if (game) return <GameResultModal game={game} onClose={onClose} />;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg animate-fade-in-up overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-4 sm:px-8 pt-6 sm:pt-8 pb-6">
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

        <div className="px-4 sm:px-8 pb-6 sm:pb-8">
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

            <GameWizardSteps
              step={step}
              form={form}
              setForm={setForm}
              error={error}
              loading={loading}
            />

            <div className="flex gap-3">
              {step > 1 && !loading && (
                <button onClick={() => goTo(step - 1, "prev")}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl border border-border font-body text-sm font-medium text-foreground hover:bg-slate transition-colors">
                  <Icon name="ChevronLeft" size={16} />Назад
                </button>
              )}
              {!loading && (
                <button onClick={handleNext} disabled={loading || !canProceed()}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber text-white font-body text-sm font-bold hover:bg-amber/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-amber/25">
                  {step === 4 ? (
                    <><Icon name="Gamepad2" size={16} />Создать игру</>
                  ) : (
                    <>Далее<Icon name="ChevronRight" size={16} /></>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}