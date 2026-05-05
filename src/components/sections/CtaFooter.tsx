import Icon from "@/components/ui/icon";

function CTA({ onStart }: { onStart: () => void }) {
  return (
    <section className="py-24 bg-primary relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-[hsl(220,15%,8%)] to-[hsl(158,30%,15%)]" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-green/10 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-white/5 blur-3xl" />

      <div className="relative container max-w-3xl mx-auto px-6 text-center section-fade">
        <span className="font-body text-sm font-medium text-green uppercase tracking-wider">Начните сегодня</span>
        <h2 className="font-display text-4xl lg:text-5xl font-semibold mt-3 mb-5 text-white">
          Сделайте каждый урок{" "}
          <em className="not-italic text-green">незабываемым</em>
        </h2>
        <p className="font-body text-lg text-white/60 mb-8 max-w-xl mx-auto">
          Присоединяйтесь к тысячам педагогов, которые готовятся к урокам быстрее и увереннее.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button onClick={onStart} className="px-8 py-3.5 rounded-xl bg-white text-foreground font-body font-semibold hover:bg-white/90 transition-all hover:shadow-xl hover:shadow-white/10 active:scale-95">
            Начать бесплатно
          </button>
          <button className="px-8 py-3.5 rounded-xl border border-white/20 text-white font-body font-medium hover:bg-white/10 transition-colors">
            Подробнее о тарифах
          </button>
        </div>
      </div>
    </section>
  );
}

function Contacts() {
  return (
    <section id="contacts" className="py-24 bg-white">
      <div className="container max-w-6xl mx-auto px-6">
        <div className="section-fade text-center mb-14">
          <span className="font-body text-sm font-medium text-green uppercase tracking-wider">Контакты</span>
          <h2 className="font-display text-4xl lg:text-5xl font-semibold mt-3 mb-4 text-foreground">
            Мы рядом
          </h2>
          <p className="font-body text-lg text-muted-foreground max-w-xl mx-auto">
            Есть вопросы или хотите договориться о демонстрации для вашей школы?
          </p>
        </div>

        <div className="section-fade grid md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: "Mail", title: "Email", val: "hello@urokii.ru", desc: "Ответим в течение рабочего дня" },
            { icon: "MessageSquare", title: "Telegram", val: "@urokii_support", desc: "Быстрая помощь в чате" },
            { icon: "Phone", title: "Телефон", val: "+7 800 123-45-67", desc: "Пн–Пт, 9:00–18:00 МСК" },
          ].map((c) => (
            <div key={c.title} className="p-6 rounded-2xl border border-border text-center hover:border-green/30 hover:shadow-lg hover:shadow-green/5 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-warm group-hover:bg-green-light transition-colors flex items-center justify-center mx-auto mb-4">
                <Icon name={c.icon} fallback="Mail" size={22} className="text-foreground group-hover:text-green transition-colors" />
              </div>
              <div className="font-body font-semibold text-foreground mb-1">{c.title}</div>
              <div className="font-body font-medium text-green mb-1">{c.val}</div>
              <div className="font-body text-sm text-muted-foreground">{c.desc}</div>
            </div>
          ))}
        </div>

        <div className="section-fade max-w-lg mx-auto bg-warm rounded-2xl p-8">
          <h3 className="font-display text-2xl font-semibold text-foreground mb-6">Написать нам</h3>
          <div className="space-y-4">
            <div>
              <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Ваше имя</label>
              <input
                type="text"
                placeholder="Иван Иванов"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-white font-body text-sm focus:outline-none focus:border-green/50 transition-colors"
              />
            </div>
            <div>
              <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Email</label>
              <input
                type="email"
                placeholder="ivan@school.ru"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-white font-body text-sm focus:outline-none focus:border-green/50 transition-colors"
              />
            </div>
            <div>
              <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Сообщение</label>
              <textarea
                rows={4}
                placeholder="Расскажите, чем мы можем помочь..."
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-white font-body text-sm focus:outline-none focus:border-green/50 transition-colors resize-none"
              />
            </div>
            <button className="w-full py-3 rounded-xl bg-primary text-white font-body font-medium hover:bg-primary/90 transition-colors">
              Отправить сообщение
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[hsl(220,15%,97%)] border-t border-border py-12">
      <div className="container max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white text-xs font-bold font-body">У</span>
              </span>
              <span className="font-display text-xl font-semibold text-foreground">УрокАИ</span>
            </div>
            <p className="font-body text-sm text-muted-foreground leading-relaxed max-w-xs">
              ИИ-помощник для педагогов. Создавайте вдохновляющие уроки быстрее с помощью искусственного интеллекта.
            </p>
          </div>
          <div>
            <div className="font-body text-sm font-semibold text-foreground mb-4">Продукт</div>
            <ul className="space-y-2">
              {["О сервисе", "Тарифы", "Интеграции", "Безопасность"].map((l) => (
                <li key={l}><a href="#" className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <div className="font-body text-sm font-semibold text-foreground mb-4">Поддержка</div>
            <ul className="space-y-2">
              {["FAQ", "Документация", "Блог", "Контакты"].map((l) => (
                <li key={l}><a href="#" className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="font-body text-xs text-muted-foreground">© 2024 УрокАИ. Все права защищены.</p>
          <div className="flex gap-4">
            <a href="#" className="font-body text-xs text-muted-foreground hover:text-foreground transition-colors">Политика конфиденциальности</a>
            <a href="#" className="font-body text-xs text-muted-foreground hover:text-foreground transition-colors">Условия использования</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export { CTA, Contacts, Footer };
