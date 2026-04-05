import ContactForm from "@/components/ContactForm";
import StickyBar from "@/components/StickyBar";

const TG_BOT = "https://t.me/lotos_bot";
const TG_BOOK = "https://t.me/lotos_bot?startapp=book";

// ─── Data ────────────────────────────────────────────────────────────────────

const directions = [
  { emoji: "🧘", name: "Йога", desc: "Хатха, виньяса и восстановительные практики для тела и разума." },
  { emoji: "🤸", name: "Пилатес", desc: "Укрепление кора, правильная осанка и гибкость для всех уровней." },
  { emoji: "🌿", name: "Стретчинг", desc: "Глубокая растяжка — снимает напряжение и улучшает подвижность." },
  { emoji: "💪", name: "Фитнес", desc: "Функциональные тренировки, кардио и силовые упражнения." },
  { emoji: "🕯️", name: "Медитация", desc: "Осознанность, дыхательные практики и глубокая релаксация." },
  { emoji: "🩰", name: "Барре", desc: "Балетные тренировки для тонуса, грации и красивой осанки." },
];

const features = [
  { emoji: "🚿", title: "Душ с мягкими полотенцами" },
  { emoji: "🛋️", title: "Уютная лаунж-зона" },
  { emoji: "✨", title: "Просторный светлый зал" },
  { emoji: "☕", title: "Чай, кофе, вода бесплатно" },
];

const trainers = [
  { name: "Камила Рахимова", experience: "5 лет опыта", specs: ["Йога", "Медитация", "Виньяса"] },
  { name: "Диана Ким",       experience: "7 лет опыта", specs: ["Пилатес", "Стретчинг", "Здоровая спина"] },
  { name: "Азиз Каримов",    experience: "4 года опыта", specs: ["Фитнес", "Барре", "Силовые"] },
];

const plans = [
  { name: "Пробное",   sessions: "1 занятие",    validity: "—",        price: "Бесплатно",    highlight: false },
  { name: "Базовый",   sessions: "8 занятий",    validity: "30 дней",  price: "500 000 сум",  highlight: false },
  { name: "Стандарт",  sessions: "12 занятий",   validity: "30 дней",  price: "700 000 сум",  highlight: true  },
  { name: "Безлимит",  sessions: "∞ занятий",    validity: "30 дней",  price: "900 000 сум",  highlight: false },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <main className="min-h-screen bg-lotos-cream font-instrument text-lotos-text scroll-smooth pb-[72px]">

      {/* ── Nav ───────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-lotos-brown/10 shadow-[0_2px_16px_rgba(119,73,54,0.06)]">
        <div className="max-w-7xl mx-auto px-4 h-[68px] flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <span className="font-syne font-bold text-xl text-lotos-brown tracking-tight">ЛОТОС</span>
            <span className="hidden sm:block text-xs text-lotos-muted uppercase tracking-widest mt-0.5">
              студия фитнеса
            </span>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6 text-[15px] font-medium text-lotos-text">
            <a href="#directions" className="hover:text-lotos-purple transition-colors">Направления</a>
            <a href="#trainers"   className="hover:text-lotos-purple transition-colors">Тренеры</a>
            <a href={TG_BOT} target="_blank" rel="noopener noreferrer" className="hover:text-lotos-purple transition-colors">Расписание</a>
            <a href="#plans"      className="hover:text-lotos-purple transition-colors">Тарифы</a>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Phone */}
            <a href="tel:+998901234567" className="hidden lg:flex items-center gap-1.5 text-lotos-brown text-[14px] font-medium hover:text-lotos-brownHover transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.1a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.61 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.1 6.1l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              +998 90 123-45-67
            </a>
            {/* Telegram icon */}
            <a href={TG_BOT} target="_blank" rel="noopener noreferrer" aria-label="Telegram" className="hidden sm:flex w-9 h-9 items-center justify-center text-lotos-brown hover:text-lotos-purple transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.88 13.747l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.838.812h-.53z"/>
              </svg>
            </a>
            <a href={TG_BOOK} className="btn-purple text-[14px] px-5 py-2.5">
              Записаться
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative pt-[100px] pb-24 px-4 min-h-[88vh] flex items-center bg-lotos-cream overflow-hidden">
        {/* Декоративные пятна */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-lotos-purple/10 rounded-full blur-[120px] top-[-10%] right-[-5%]" />
          <div className="absolute w-[50vw] h-[50vw] max-w-[500px] max-h-[500px] bg-lotos-brown/10 rounded-full blur-[100px] bottom-[-5%] left-[-10%]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 bg-lotos-purpleLight text-lotos-purple text-sm font-semibold px-5 py-2 rounded-full mb-8">
            <span>🌸</span> Студия женского фитнеса в Ташкенте
          </div>

          <h1 className="font-syne font-bold text-[40px] sm:text-[56px] md:text-[72px] leading-[1.05] tracking-tight mb-6 text-lotos-text">
            Йога, пилатес и&nbsp;стретчинг<br />
            <span className="text-lotos-purple">для вашего тела</span>
          </h1>

          <p className="text-lg md:text-xl text-lotos-muted mb-12 max-w-2xl mx-auto leading-relaxed">
            Опытные тренеры · Индивидуальный подход · Уютная атмосфера
          </p>

          {/* 3 pill CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <a
              href={TG_BOT}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline-brown w-full sm:w-auto text-center text-[16px] px-8 py-3.5"
            >
              📅 Расписание
            </a>
            <a
              href="#contact"
              className="btn-purple w-full sm:w-auto text-center text-[16px] px-8 py-3.5"
            >
              🌸 Записаться на пробное
            </a>
            <a
              href="#plans"
              className="btn-outline-brown w-full sm:w-auto text-center text-[16px] px-8 py-3.5"
            >
              💳 Купить абонемент
            </a>
          </div>
        </div>
      </section>

      {/* ── Directions ────────────────────────────────────────────────────── */}
      <section id="directions" className="py-[90px] px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="section-title mb-4">Выберите направление</h2>
            <p className="text-lotos-muted text-lg max-w-xl mx-auto">
              Найдите практику, которая подходит именно вам — для любого уровня и цели
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {directions.map((d) => (
              <div
                key={d.name}
                className="bg-lotos-surface rounded-2xl p-7 flex flex-col border border-lotos-brown/10 hover:border-lotos-purple/30 hover:shadow-[0_8px_32px_rgba(102,46,155,0.08)] transition-all duration-300"
              >
                <div className="text-4xl mb-5">{d.emoji}</div>
                <h3 className="font-syne font-bold text-xl mb-3 text-lotos-text">{d.name}</h3>
                <p className="text-lotos-muted text-[15px] leading-relaxed mb-7 flex-1">{d.desc}</p>
                <a
                  href={TG_BOOK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-purple text-center text-[14px] px-5 py-2.5"
                >
                  Записаться
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section className="py-[90px] px-4 bg-lotos-brown">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-syne font-bold text-[28px] sm:text-[36px] md:text-[44px] text-white tracking-tight mb-4">
              Всё продумано до мелочей
            </h2>
            <p className="text-lotos-cream/70 text-lg max-w-xl mx-auto">
              Мы создали пространство, где вы будете чувствовать себя как дома
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-7 text-center border border-white/15 hover:bg-white/15 transition-all"
              >
                <div className="text-[44px] mb-5 leading-none">{f.emoji}</div>
                <div className="font-semibold text-lotos-cream text-[16px] leading-snug">{f.title}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trainers ──────────────────────────────────────────────────────── */}
      <section id="trainers" className="py-[90px] px-4 bg-lotos-cream">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="section-title mb-4">Тренеры, которым мы доверяем</h2>
            <p className="text-lotos-muted text-lg max-w-xl mx-auto">
              Профессионалы с многолетним опытом — для вашего прогресса и безопасности
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {trainers.map((t) => (
              <div
                key={t.name}
                className="bg-white rounded-2xl p-8 flex flex-col items-center text-center border border-lotos-brown/10 hover:shadow-[0_8px_32px_rgba(119,73,54,0.1)] transition-all"
              >
                {/* Avatar placeholder */}
                <div className="w-[96px] h-[96px] rounded-full bg-lotos-brownLight flex items-center justify-center text-3xl font-syne font-bold text-lotos-brown mb-6">
                  {t.name[0]}
                </div>
                <h3 className="font-syne font-bold text-[20px] text-lotos-text mb-1">{t.name}</h3>
                <p className="text-lotos-muted text-sm mb-5">{t.experience}</p>
                <ul className="flex flex-wrap justify-center gap-2 mb-7">
                  {t.specs.map((s) => (
                    <li
                      key={s}
                      className="bg-lotos-purpleLight text-lotos-purple text-[13px] font-medium px-3 py-1 rounded-full"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
                <a
                  href={TG_BOOK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-purple text-[14px] px-6 py-2.5"
                >
                  Записаться
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Plans ─────────────────────────────────────────────────────────── */}
      <section id="plans" className="py-[90px] px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="section-title mb-4">Абонементы</h2>
            <p className="text-lotos-muted text-lg max-w-xl mx-auto">
              Выберите подходящий вариант — первое занятие всегда бесплатно
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {plans.map((p) => (
              <div
                key={p.name}
                className={`rounded-2xl p-7 flex flex-col border-2 transition-all ${
                  p.highlight
                    ? "border-lotos-purple bg-lotos-purpleLight shadow-[0_8px_40px_rgba(102,46,155,0.15)]"
                    : "border-lotos-brown/15 bg-lotos-surface hover:border-lotos-brown/30"
                }`}
              >
                {p.highlight && (
                  <div className="inline-block bg-lotos-purple text-white text-[12px] font-bold px-3 py-1 rounded-full mb-4 self-start">
                    Популярный
                  </div>
                )}
                <h3 className="font-syne font-bold text-xl text-lotos-text mb-2">{p.name}</h3>
                <div className="text-lotos-muted text-sm mb-1">{p.sessions}</div>
                <div className="text-lotos-muted text-sm mb-5">{p.validity !== "—" ? `Срок: ${p.validity}` : "Разовое посещение"}</div>
                <div className={`font-syne font-bold text-2xl mb-7 ${p.highlight ? "text-lotos-purple" : "text-lotos-brown"}`}>
                  {p.price}
                </div>
                <a
                  href={TG_BOOK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`mt-auto text-center font-semibold text-[14px] px-5 py-3 rounded-full transition-all ${
                    p.highlight
                      ? "bg-lotos-purple text-white hover:bg-lotos-purpleHover"
                      : "btn-outline-brown"
                  }`}
                >
                  {p.price === "Бесплатно" ? "Записаться" : "Купить"}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact Form ──────────────────────────────────────────────────── */}
      <section id="contact" className="py-[90px] px-4 bg-lotos-surface">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-title mb-4">Оставьте заявку</h2>
            <p className="text-lotos-muted text-lg max-w-xl mx-auto">
              Мы свяжемся с вами и ответим на все вопросы
            </p>
          </div>
          <ContactForm />
        </div>
      </section>

      {/* ── Map ───────────────────────────────────────────────────────────── */}
      <section className="py-[90px] px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-title mb-4">Как нас найти</h2>
            <p className="text-lotos-muted text-lg">г. Ташкент, ул. Примерная, 123</p>
          </div>

          {/* Info row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            {[
              { emoji: "📍", title: "Адрес", desc: "г. Ташкент,\nул. Примерная, 123" },
              { emoji: "🕐", title: "График работы", desc: "Пн–Пт: 7:00–22:00\nСб–Вс: 8:00–20:00" },
              { emoji: "📞", title: "Телефон", desc: "+998 90 123-45-67\nhello@lotos-studio.uz" },
            ].map((item) => (
              <div key={item.title} className="bg-lotos-surface rounded-2xl p-6 text-center border border-lotos-brown/10">
                <div className="text-3xl mb-3">{item.emoji}</div>
                <div className="font-syne font-bold text-lotos-text mb-2">{item.title}</div>
                <p className="text-lotos-muted text-sm whitespace-pre-line">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Yandex Maps iframe */}
          <div className="rounded-2xl overflow-hidden border border-lotos-brown/10 shadow-sm">
            <iframe
              src="https://yandex.ru/map-widget/v1/?ll=69.240593%2C41.299496&z=15&pt=69.240593%2C41.299496%2Cpm2rdm&lang=ru_RU"
              width="100%"
              height="420"
              frameBorder="0"
              allowFullScreen
              title="Студия Лотос на карте"
              className="block"
            />
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="bg-lotos-brown text-lotos-cream py-[70px] px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
            {/* Brand */}
            <div>
              <div className="font-syne font-bold text-2xl text-lotos-cream mb-3">ЛОТОС</div>
              <p className="text-lotos-cream/70 text-sm leading-relaxed mb-6">
                Студия женского фитнеса в Ташкенте. Йога, пилатес, стретчинг, барре и медитация.
              </p>
              <div className="flex items-center gap-3">
                <a href={TG_BOT} target="_blank" rel="noopener noreferrer" aria-label="Telegram"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-lotos-cream">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.88 13.747l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.838.812h-.53z"/>
                  </svg>
                </a>
                <a href="https://wa.me/998901234567" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-lotos-cream">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Directions */}
            <div>
              <div className="font-syne font-bold text-lotos-cream mb-4">Направления</div>
              <ul className="space-y-2">
                {directions.slice(0, 6).map((d) => (
                  <li key={d.name}>
                    <a href={TG_BOOK} className="text-lotos-cream/70 text-sm hover:text-lotos-cream transition-colors">
                      {d.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contacts */}
            <div>
              <div className="font-syne font-bold text-lotos-cream mb-4">Контакты</div>
              <ul className="space-y-3 text-sm text-lotos-cream/70">
                <li>
                  <a href="tel:+998901234567" className="hover:text-lotos-cream transition-colors">
                    +998 90 123-45-67
                  </a>
                </li>
                <li>
                  <a href="mailto:hello@lotos-studio.uz" className="hover:text-lotos-cream transition-colors">
                    hello@lotos-studio.uz
                  </a>
                </li>
                <li className="text-lotos-cream/60">г. Ташкент, ул. Примерная, 123</li>
                <li className="text-lotos-cream/60">Пн–Пт: 7:00–22:00<br />Сб–Вс: 8:00–20:00</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/15 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-lotos-cream/50 text-sm">© 2025 Студия Лотос. Все права защищены.</p>
            <div className="flex gap-5 text-sm">
              <a href="#" className="text-lotos-cream/50 hover:text-lotos-cream transition-colors">
                Политика конфиденциальности
              </a>
              <a href="#" className="text-lotos-cream/50 hover:text-lotos-cream transition-colors">
                Договор-оферта
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* ── Sticky Bar ────────────────────────────────────────────────────── */}
      <StickyBar />

    </main>
  );
}
