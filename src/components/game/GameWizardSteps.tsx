import Icon from "@/components/ui/icon";
import {
  SUBJECTS, CLASS_OPTIONS, DURATION_OPTIONS, FORMAT_OPTIONS,
  TECH_OPTIONS, STUDENTS_OPTIONS, GameForm,
} from "./GameTypes";

type Props = {
  step: number;
  form: GameForm;
  setForm: React.Dispatch<React.SetStateAction<GameForm>>;
  error: string;
  loading: boolean;
};

export default function GameWizardSteps({ step, form, setForm, error, loading }: Props) {
  return (
    <>
      {step === 1 && (
        <div className="space-y-4 mb-6">
          <div>
            <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Предмет / Дисциплина</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {SUBJECTS.map(s => (
                <button key={s} onClick={() => setForm(f => ({ ...f, subject: s }))}
                  className={`px-3 py-1.5 rounded-full text-xs font-body border transition-all ${form.subject === s ? "bg-amber text-white border-amber" : "bg-white border-border text-muted-foreground hover:border-amber/40 hover:bg-amber-light"}`}>
                  {s}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={form.subject}
              onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
              placeholder="Или введите свой предмет..."
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-slate font-body text-sm focus:outline-none focus:border-amber/40 focus:bg-white transition-all placeholder:text-muted-foreground"
            />
          </div>
          <div>
            <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Класс / Возраст</label>
            <div className="flex flex-wrap gap-2">
              {CLASS_OPTIONS.map(c => (
                <button key={c} onClick={() => setForm(f => ({ ...f, grade: c }))}
                  className={`px-3 py-1.5 rounded-full text-xs font-body border transition-all ${form.grade === c ? "bg-amber text-white border-amber" : "bg-white border-border text-muted-foreground hover:border-amber/40 hover:bg-amber-light"}`}>
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

      {loading && (
        <div className="mb-6 flex flex-col items-center gap-4 py-4">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-4 border-amber/20" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber animate-spin" />
            <div className="absolute inset-2 rounded-full bg-amber-light flex items-center justify-center">
              <Icon name="Gamepad2" size={18} className="text-amber" />
            </div>
          </div>
          <div className="text-center">
            <div className="font-display text-base font-bold text-foreground">Придумываю игру...</div>
            <div className="font-body text-sm text-muted-foreground mt-1">Это займёт около 15 секунд</div>
          </div>
        </div>
      )}
    </>
  );
}
