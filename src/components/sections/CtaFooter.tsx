import Icon from "@/components/ui/icon";

function CTA({ onStart }: { onStart: () => void }) {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-[hsl(243,75%,45%)] to-[hsl(174,62%,30%)]" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-amber/15 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-white/8 blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-teal/10 blur-3xl" />

      <div className="relative container max-w-3xl mx-auto px-6 text-center section-fade">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/25 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse-soft" />
          <span className="text-xs font-body font-semibold text-white">Начните сегодня</span>
        </div>
        <h2 className="font-display text-4xl lg:text-5xl font-bold mt-3 mb-5 text-white leading-tight">
          Сделайте каждый урок{" "}
          <span className="text-amber">незабываемым</span>
        </h2>
        <p className="font-body text-lg text-white/70 mb-8 max-w-xl mx-auto">
          Присоединяйтесь к тысячам педагогов, которые готовятся к урокам быстрее и увереннее.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={onStart}
            className="px-8 py-3.5 rounded-xl bg-white text-foreground font-body font-bold hover:bg-white/95 transition-all hover:shadow-xl hover:shadow-white/20 active:scale-95"
          >
            Начать бесплатно
          </button>
          <button className="px-8 py-3.5 rounded-xl border border-white/30 text-white font-body font-medium hover:bg-white/12 transition-colors">
            Подробнее о тарифах
          </button>
        </div>
      </div>
    </section>
  );
}

function Contacts() {
  return (
    <section id="contacts" className="py-16 bg-white">
      <div className="container max-w-6xl mx-auto px-6">
        <div className="section-fade flex flex-col sm:flex-row items-center justify-center gap-4">
          <span className="font-body text-muted-foreground">Есть вопросы?</span>
          <a
            href="mailto:en1350@rambler.ru"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-body font-semibold hover:bg-primary/90 transition-all shadow-md shadow-primary/25 active:scale-95"
          >
            <Icon name="Mail" size={16} className="text-white" />
            Написать нам
          </a>
          <span className="font-body text-sm text-muted-foreground">en1350@rambler.ru</span>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-foreground border-t border-border py-12">
      <div className="container max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/30">
                <Icon name="GraduationCap" size={16} className="text-white" />
              </span>
              <span className="font-display text-xl font-bold text-white">УрокАИ</span>
            </div>
            <p className="font-body text-sm text-white/50 leading-relaxed max-w-xs">
              ИИ-помощник для педагогов. Создавайте вдохновляющие уроки быстрее с помощью искусственного интеллекта.
            </p>
          </div>
          <div>
            <div className="font-body text-sm font-semibold text-white mb-4">Продукт</div>
            <ul className="space-y-2">
              {["О сервисе", "Тарифы", "Интеграции", "Безопасность"].map((l) => (
                <li key={l}><a href="#" className="font-body text-sm text-white/50 hover:text-white transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <div className="font-body text-sm font-semibold text-white mb-4">Поддержка</div>
            <ul className="space-y-2">
              {["FAQ", "Документация", "Блог", "Контакты"].map((l) => (
                <li key={l}><a href="#" className="font-body text-sm text-white/50 hover:text-white transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="font-body text-xs text-white/40">© 2025 УрокАИ. Все права защищены.</p>
          <div className="flex gap-4">
            <a href="/privacy" className="font-body text-xs text-white/40 hover:text-white/70 transition-colors">Политика конфиденциальности</a>
            <a href="/terms" className="font-body text-xs text-white/40 hover:text-white/70 transition-colors">Пользовательское соглашение</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export { CTA, Contacts, Footer };