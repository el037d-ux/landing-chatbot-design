import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

const HERO_IMAGE = "https://cdn.poehali.dev/projects/3a27d5a9-016a-43ab-946d-4c4fe8129705/bucket/fb741ecb-cd4a-4766-ba6b-9c590c24dfe7.png";

function Navbar({ onStart, onAuth, onPayment, onProfile }: { onStart: () => void; onAuth: () => void; onPayment: () => void; onProfile: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const links = [
    { href: "#about", label: "О сервисе" },
    { href: "#demo", label: "Примеры" },
    { href: "#faq", label: "Вопросы" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-border" : "bg-transparent"
      }`}
    >
      <div className="container max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/30">
            <Icon name="GraduationCap" size={16} className="text-white" />
          </span>
          <span className="font-display text-xl font-bold text-foreground tracking-tight">УрокАИ</span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a key={l.href} href={l.href}
              className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors font-medium">
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button onClick={() => navigate("/quests")} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-sm font-body font-semibold text-amber hover:border-amber/40 hover:bg-amber/5 transition-all">
            <Icon name="Swords" size={14} className="text-amber" />
            Квесты
          </button>
          <button onClick={onPayment} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-sm font-body font-semibold text-primary hover:border-primary/40 hover:bg-primary/5 transition-all">
            <Icon name="Crown" size={14} className="text-primary" />
            Тарифы
          </button>
          <button onClick={onStart} className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-body font-semibold hover:bg-primary/90 transition-all shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 active:scale-95">
            Начать бесплатно
          </button>
        </div>

        <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
          <Icon name={menuOpen ? "X" : "Menu"} size={20} />
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-border px-6 py-4 space-y-3 animate-fade-in">
          {links.map((l) => (
            <a key={l.href} href={l.href}
              className="block text-sm font-body text-muted-foreground hover:text-foreground py-1.5 font-medium"
              onClick={() => setMenuOpen(false)}>
              {l.label}
            </a>
          ))}
          <div className="pt-2 space-y-2">
            <button onClick={() => { navigate("/quests"); setMenuOpen(false); }} className="w-full py-2.5 text-sm font-body font-semibold border border-amber/30 text-amber rounded-xl flex items-center justify-center gap-2">
              <Icon name="Swords" size={14} />Квесты
            </button>
            <button onClick={onPayment} className="w-full py-2.5 text-sm font-body font-semibold border border-primary/30 text-primary rounded-xl flex items-center justify-center gap-2">
              <Icon name="Crown" size={14} />Тарифы
            </button>
            <button onClick={onStart} className="w-full py-2.5 text-sm font-body font-semibold bg-primary text-white rounded-xl">Начать бесплатно</button>
          </div>
        </div>
      )}
    </nav>
  );
}

function Hero({ onStart, onGame, onAnalysis, onPayment, lessonsLeft, gamesLeft, isPaid }: { onStart: () => void; onGame: () => void; onAnalysis: () => void; onPayment: () => void; lessonsLeft: number | null; gamesLeft: number | null; isPaid: boolean }) {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-indigo-light/40 to-teal-light/30 -z-10" />
      <div className="absolute top-1/4 right-0 w-48 sm:w-80 md:w-[500px] h-48 sm:h-80 md:h-[500px] rounded-full bg-primary/8 blur-3xl -z-10" />
      <div className="absolute bottom-0 left-1/4 w-40 sm:w-64 md:w-[400px] h-40 sm:h-64 md:h-[400px] rounded-full bg-amber-light blur-3xl -z-10" />
      <div className="absolute top-1/2 left-0 w-32 sm:w-52 md:w-[300px] h-32 sm:h-52 md:h-[300px] rounded-full bg-teal-light/50 blur-3xl -z-10" />

      <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20 grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full badge-amber mb-6 sm:mb-8 animate-fade-in-up">
            <span className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse-soft" />
            <span className="text-xs font-body font-semibold">ИИ для педагогов нового поколения</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-[1.1] text-foreground mb-5 sm:mb-6 animate-fade-in-up delay-100">
            Готовьте уроки{" "}
            <span className="gradient-text">в 10 раз быстрее</span>{" "}
            с помощью ИИ
          </h1>

          <p className="font-body text-base sm:text-lg text-muted-foreground leading-relaxed mb-6 sm:mb-8 animate-fade-in-up delay-200">
            Опишите тему, возраст учеников и предмет — УрокАИ предложит идеи активностей, методы оценивания и готовый план урока за секунды.
          </p>

          {/* Две главные кнопки */}
          <div className="grid grid-cols-2 gap-3 mb-6 animate-fade-in-up delay-300">
            {/* Генератор урока */}
            <button
              onClick={onStart}
              className="flex flex-col items-center gap-2 px-4 py-4 rounded-2xl bg-primary text-white font-body font-semibold hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/25 active:scale-95 group"
            >
              <span className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <Icon name="BookOpen" size={20} className="text-white" />
              </span>
              <span className="text-sm font-bold">Генератор урока</span>
              {!isPaid && lessonsLeft !== null && (
                <span className="text-xs font-body font-normal opacity-80">
                  {lessonsLeft > 0 ? `Осталось бесплатно: ${lessonsLeft}` : "Лимит исчерпан"}
                </span>
              )}
              {isPaid && <span className="text-xs font-body font-normal opacity-80">Безлимитно</span>}
            </button>

            {/* Генератор игры */}
            <button
              onClick={onGame}
              className="flex flex-col items-center gap-2 px-4 py-4 rounded-2xl bg-amber text-foreground font-body font-semibold hover:bg-amber/90 transition-all hover:shadow-lg hover:shadow-amber/25 active:scale-95 group"
            >
              <span className="w-10 h-10 rounded-xl bg-black/10 flex items-center justify-center group-hover:bg-black/15 transition-colors">
                <Icon name="Gamepad2" size={20} className="text-foreground" />
              </span>
              <span className="text-sm font-bold">Генератор игры</span>
              {!isPaid && gamesLeft !== null && (
                <span className="text-xs font-body font-normal opacity-70">
                  {gamesLeft > 0 ? `Осталось бесплатно: ${gamesLeft}` : "Лимит исчерпан"}
                </span>
              )}
              {isPaid && <span className="text-xs font-body font-normal opacity-70">Безлимитно</span>}
            </button>

          </div>

          <div className="flex flex-wrap gap-4 sm:gap-6 animate-fade-in-up delay-500">
            {[
              { n: "4 000+", l: "педагогов", color: "text-primary" },
              { n: "50 000+", l: "уроков создано", color: "text-teal" },
              { n: "5 мин", l: "на подготовку урока", color: "text-amber" },
            ].map((s) => (
              <div key={s.l}>
                <div className={`font-display text-2xl font-bold ${s.color}`}>{s.n}</div>
                <div className="font-body text-sm text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative animate-fade-in-up delay-300 hidden lg:block">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-primary/10 animate-float">
            <img
              src={HERO_IMAGE}
              alt="Педагог с ИИ-помощником"
              className="w-full h-[480px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
          </div>

          <div className="absolute -left-8 top-16 bg-white rounded-xl p-3 shadow-xl border border-border animate-fade-in delay-500 max-w-[200px]">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-6 h-6 rounded-lg bg-teal-light flex items-center justify-center">
                <Icon name="Zap" size={12} className="text-teal" />
              </span>
              <span className="font-body text-xs font-semibold">Урок готов</span>
            </div>
            <p className="font-body text-xs text-muted-foreground">Фотосинтез, 6 класс — 4 активности, 3 метода оценки</p>
          </div>

          <div className="absolute -right-4 bottom-20 bg-white rounded-xl p-3 shadow-xl border border-border animate-fade-in delay-600 max-w-[180px]">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-6 h-6 rounded-lg bg-amber-light flex items-center justify-center">
                <Icon name="Clock" size={12} className="text-amber" />
              </span>
              <span className="font-body text-xs font-semibold">Сэкономлено</span>
            </div>
            <p className="font-body text-xs text-muted-foreground">2 часа 15 минут на подготовку</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export { Navbar, Hero };