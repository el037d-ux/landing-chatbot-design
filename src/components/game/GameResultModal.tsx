import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Game, downloadGame } from "./GameTypes";

export default function GameResultModal({ game, onClose }: { game: Game; onClose: () => void }) {
  const [tab, setTab] = useState<"overview" | "materials" | "tips">("overview");

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col animate-fade-in-up" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-4 sm:px-8 pt-5 sm:pt-7 pb-5 border-b border-border flex-shrink-0">
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
        <div className="overflow-y-auto flex-1 px-4 sm:px-8 py-5 sm:py-6 space-y-5">

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
                        <p className="font-body text-sm text-foreground mt-1.5 leading-relaxed">{s.action}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {game.scoring && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-indigo-light border border-indigo-mid">
                  <Icon name="Trophy" size={15} className="text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-body text-xs font-semibold text-primary uppercase tracking-wider">Баллы и победа</span>
                    <p className="font-body text-sm text-foreground mt-0.5">{game.scoring}</p>
                  </div>
                </div>
              )}

              {game.adaptation && (
                <div className="p-3 rounded-xl bg-slate border border-border">
                  <div className="font-body text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Адаптация</div>
                  <p className="font-body text-sm text-foreground">{game.adaptation}</p>
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
        <div className="px-4 sm:px-8 py-4 border-t border-border flex-shrink-0">
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