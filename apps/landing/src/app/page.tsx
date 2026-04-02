import Link from 'next/link';

const TG_LINK = 'https://t.me/lotos_bot?startapp=book';

const directions = [
  { name: 'Йога', icon: '🧘', desc: 'Хатха, виньяса и восстановительные практики для тела и разума' },
  { name: 'Пилатес', icon: '💪', desc: 'Укрепление кора, осанка и гибкость для всех уровней' },
  { name: 'Стретчинг', icon: '🤸', desc: 'Растяжка и гибкость — занятия для начинающих и опытных' },
  { name: 'Фитнес', icon: '🏋️', desc: 'Функциональные тренировки, кардио и силовые упражнения' },
  { name: 'Медитация', icon: '🧠', desc: 'Осознанность, дыхание и глубокая релаксация' },
  { name: 'Барре', icon: '🩰', desc: 'Балетные тренировки для тонуса, грации и осанки' },
];

const schedule = [
  { day: 'Пн', time: '08:00', title: 'Утренняя йога', trainer: 'Камила Р.', spots: 5 },
  { day: 'Пн', time: '18:00', title: 'Пилатес', trainer: 'Диана К.', spots: 3 },
  { day: 'Вт', time: '10:00', title: 'Стретчинг', trainer: 'Диана К.', spots: 8 },
  { day: 'Вт', time: '19:00', title: 'Вечерняя йога', trainer: 'Камила Р.', spots: 4 },
  { day: 'Ср', time: '08:00', title: 'Фитнес', trainer: 'Азиз К.', spots: 6 },
  { day: 'Ср', time: '17:00', title: 'Барре', trainer: 'Азиз К.', spots: 2 },
];

const trainers = [
  {
    name: 'Камила Рахимова',
    spec: 'Йога · Медитация',
    exp: '5 лет',
    cert: 'RYT-200',
    bio: 'Сертифицированный инструктор йоги. Создаёт атмосферу тепла и принятия на каждом занятии.',
  },
  {
    name: 'Диана Ким',
    spec: 'Пилатес · Стретчинг',
    exp: '7 лет',
    cert: 'STOTT Pilates',
    bio: 'Мастер пилатеса и стретчинга. Помогает обрести гибкость и правильную осанку.',
  },
  {
    name: 'Азиз Каримов',
    spec: 'Фитнес · Барре',
    exp: '4 года',
    cert: 'NASM-CPT',
    bio: 'Фитнес-тренер с энергией и мотивацией. Каждая тренировка — новое достижение.',
  },
];

const usps = [
  { icon: '📱', title: 'Удобная запись', desc: 'Запишитесь на занятие в пару кликов прямо в Telegram — без звонков и очередей' },
  { icon: '🏆', title: 'Лучшие тренеры', desc: 'Сертифицированные специалисты с многолетним опытом и индивидуальным подходом' },
  { icon: '🌸', title: 'Уютная атмосфера', desc: 'Студия в центре Ташкента — светлый зал, профессиональное оборудование, душ' },
  { icon: '📅', title: 'Гибкое расписание', desc: 'Занятия утром и вечером, 6 дней в неделю. Всегда найдётся удобное время' },
];

const plans = [
  { name: 'Пробное', price: 'Бесплатно', classes: '1 занятие', validity: '7 дней', highlight: false },
  { name: 'Базовый', price: '400 000 UZS', classes: '8 занятий', validity: '30 дней', highlight: false },
  { name: 'Стандарт', price: '550 000 UZS', classes: '12 занятий', validity: '30 дней', highlight: true },
  { name: 'Безлимит', price: '800 000 UZS', classes: 'Без ограничений', validity: '30 дней', highlight: false },
];

const faqs = [
  { q: 'Нужна ли подготовка для первого занятия?', a: 'Нет, большинство наших занятий подходят для начинающих. Просто сообщите тренеру, что вы пришли первый раз.' },
  { q: 'Как записаться на занятие?', a: 'Нажмите кнопку "Записаться" — откроется Telegram Mini App, где вы выберете удобное время и подтвердите запись за несколько секунд.' },
  { q: 'Можно ли отменить запись?', a: 'Да, отменить запись можно бесплатно не позднее чем за 2 часа до начала занятия. Занятие возвращается на абонемент.' },
  { q: 'Что взять с собой?', a: 'Удобную спортивную форму, носки для йоги и пилатеса, воду. Коврики и оборудование предоставляем мы.' },
  { q: 'Есть ли абонементы?', a: 'Да! У нас 4 варианта абонементов от пробного занятия до безлимита. Оплата через Payme, Click или Telegram Pay.' },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-cream font-instrument">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-cream/90 backdrop-blur border-b border-dark/10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="font-syne font-bold text-xl text-dark">🪷 Лотос</span>
          <a
            href={TG_LINK}
            className="bg-brown text-cream text-sm font-medium px-4 py-2 rounded-full hover:bg-brown-dark transition-colors"
          >
            Записаться
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-20 px-4 max-w-6xl mx-auto">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-purple/10 text-purple text-sm font-medium px-3 py-1 rounded-full mb-6">
            🌟 Первое занятие — бесплатно
          </div>
          <h1 className="font-syne text-5xl sm:text-6xl lg:text-7xl font-bold text-dark leading-tight mb-6">
            Студия<br />
            <span className="text-brown">Лотос</span>
          </h1>
          <p className="text-dark/70 text-lg sm:text-xl leading-relaxed mb-10 max-w-xl">
            Йога, пилатес, стретчинг, фитнес и медитация в уютной студии в центре Ташкента. Найдите своё направление и запишитесь прямо сейчас.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href={TG_LINK}
              className="inline-flex items-center justify-center gap-2 bg-dark text-cream font-semibold px-8 py-4 rounded-2xl hover:bg-dark/90 transition-colors text-lg"
            >
              Записаться в Telegram →
            </a>
            <a
              href="#schedule"
              className="inline-flex items-center justify-center gap-2 bg-brown/10 text-brown font-semibold px-8 py-4 rounded-2xl hover:bg-brown/20 transition-colors text-lg"
            >
              Расписание
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-16 max-w-lg">
          {[
            { n: '6', l: 'направлений' },
            { n: '3', l: 'тренера' },
            { n: '500+', l: 'клиентов' },
          ].map((s) => (
            <div key={s.l} className="bg-dark text-cream rounded-2xl p-4 text-center">
              <div className="font-syne text-3xl font-bold">{s.n}</div>
              <div className="text-cream/60 text-xs mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Directions */}
      <section id="directions" className="py-20 bg-dark px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-syne text-4xl font-bold text-cream mb-4">Направления</h2>
          <p className="text-cream/50 mb-12 max-w-lg">Выберите занятие, которое подходит именно вам — для любого уровня подготовки</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {directions.map((d) => (
              <a
                key={d.name}
                href={TG_LINK}
                className="group bg-cream/5 hover:bg-cream/10 border border-cream/10 rounded-2xl p-6 transition-all hover:border-brown/50"
              >
                <div className="text-3xl mb-3">{d.icon}</div>
                <h3 className="font-syne text-xl font-semibold text-cream mb-2">{d.name}</h3>
                <p className="text-cream/50 text-sm leading-relaxed">{d.desc}</p>
                <div className="mt-4 text-brown text-sm font-medium group-hover:underline">Записаться →</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Schedule preview */}
      <section id="schedule" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-syne text-4xl font-bold text-dark mb-4">Расписание</h2>
          <p className="text-dark/60 mb-12 max-w-lg">Ближайшие занятия на этой неделе. Полное расписание — в приложении.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {schedule.map((s, i) => (
              <div key={i} className="bg-dark rounded-2xl p-5 flex items-start gap-4">
                <div className="bg-brown/20 rounded-xl px-3 py-2 text-center min-w-[3rem]">
                  <div className="text-cream/60 text-xs">{s.day}</div>
                  <div className="text-cream font-syne font-bold text-sm">{s.time}</div>
                </div>
                <div className="flex-1">
                  <div className="text-cream font-medium">{s.title}</div>
                  <div className="text-cream/50 text-sm">{s.trainer}</div>
                  <div className="text-purple text-xs mt-1">{s.spots} мест осталось</div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <a
              href={TG_LINK}
              className="inline-flex items-center gap-2 bg-brown text-cream font-semibold px-8 py-4 rounded-2xl hover:bg-brown-dark transition-colors"
            >
              Смотреть всё расписание →
            </a>
          </div>
        </div>
      </section>

      {/* Trainers */}
      <section id="trainers" className="py-20 bg-dark/5 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-syne text-4xl font-bold text-dark mb-4">Тренеры</h2>
          <p className="text-dark/60 mb-12 max-w-lg">Сертифицированные специалисты с многолетним опытом</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {trainers.map((t) => (
              <div key={t.name} className="bg-cream border border-dark/10 rounded-2xl p-6">
                <div className="w-16 h-16 rounded-full bg-brown/20 flex items-center justify-center text-2xl mb-4">
                  {t.spec.includes('Йога') ? '🧘' : t.spec.includes('Пилатес') ? '💪' : '🏋️'}
                </div>
                <h3 className="font-syne text-xl font-semibold text-dark">{t.name}</h3>
                <p className="text-purple text-sm font-medium mt-1">{t.spec}</p>
                <p className="text-dark/60 text-sm mt-3 leading-relaxed">{t.bio}</p>
                <div className="flex gap-3 mt-4">
                  <span className="bg-dark/5 text-dark/60 text-xs px-2 py-1 rounded-full">{t.exp}</span>
                  <span className="bg-dark/5 text-dark/60 text-xs px-2 py-1 rounded-full">{t.cert}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* USPs */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-syne text-4xl font-bold text-dark mb-4">Почему Лотос?</h2>
          <p className="text-dark/60 mb-12 max-w-lg">4 причины, почему клиенты выбирают нас и остаются надолго</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {usps.map((u) => (
              <div key={u.title} className="flex gap-4 p-6 bg-dark rounded-2xl">
                <div className="text-3xl">{u.icon}</div>
                <div>
                  <h3 className="font-syne text-lg font-semibold text-cream mb-2">{u.title}</h3>
                  <p className="text-cream/60 text-sm leading-relaxed">{u.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-dark/5 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-syne text-4xl font-bold text-dark mb-4">Абонементы</h2>
          <p className="text-dark/60 mb-12 max-w-lg">Выберите удобный формат. Оплата через Payme, Click или Telegram Pay.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((p) => (
              <div
                key={p.name}
                className={`rounded-2xl p-6 flex flex-col ${
                  p.highlight
                    ? 'bg-dark text-cream ring-2 ring-brown'
                    : 'bg-cream border border-dark/10 text-dark'
                }`}
              >
                {p.highlight && (
                  <div className="text-brown text-xs font-semibold uppercase tracking-wider mb-3">Популярный</div>
                )}
                <h3 className={`font-syne text-xl font-bold mb-2 ${p.highlight ? 'text-cream' : 'text-dark'}`}>
                  {p.name}
                </h3>
                <div className={`text-2xl font-syne font-bold mb-1 ${p.highlight ? 'text-cream' : 'text-dark'}`}>
                  {p.price}
                </div>
                <div className={`text-sm mb-1 ${p.highlight ? 'text-cream/60' : 'text-dark/50'}`}>{p.classes}</div>
                <div className={`text-xs mb-6 ${p.highlight ? 'text-cream/40' : 'text-dark/40'}`}>{p.validity}</div>
                <a
                  href={TG_LINK}
                  className={`mt-auto text-center py-3 rounded-xl font-semibold text-sm transition-colors ${
                    p.highlight
                      ? 'bg-brown text-cream hover:bg-brown-dark'
                      : 'bg-dark/10 text-dark hover:bg-dark/20'
                  }`}
                >
                  {p.name === 'Пробное' ? 'Попробовать бесплатно' : 'Купить абонемент'}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-syne text-4xl font-bold text-dark mb-12">Частые вопросы</h2>
          <div className="space-y-4">
            {faqs.map((f, i) => (
              <details key={i} className="group bg-dark rounded-2xl overflow-hidden">
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none text-cream font-medium">
                  <span>{f.q}</span>
                  <span className="text-cream/40 group-open:rotate-45 transition-transform text-2xl leading-none">+</span>
                </summary>
                <div className="px-6 pb-6 text-cream/60 text-sm leading-relaxed">{f.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-brown px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-syne text-4xl font-bold text-cream mb-4">Первое занятие бесплатно</h2>
          <p className="text-cream/70 mb-8">Запишитесь прямо сейчас и приходите знакомиться со студией</p>
          <a
            href={TG_LINK}
            className="inline-flex items-center gap-2 bg-cream text-dark font-bold px-10 py-4 rounded-2xl hover:bg-cream/90 transition-colors text-lg"
          >
            🪷 Открыть в Telegram
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-cream py-12 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <div className="font-syne text-xl font-bold mb-3">🪷 Студия Лотос</div>
            <p className="text-cream/50 text-sm leading-relaxed">Йога, пилатес, стретчинг и фитнес в центре Ташкента</p>
          </div>
          <div>
            <div className="font-semibold mb-3">Контакты</div>
            <div className="text-cream/50 text-sm space-y-2">
              <div>📍 Ташкент, ул. Амира Тимура, 12</div>
              <div>📞 +998 90 123 45 67</div>
              <div>✉️ hello@lotos-studio.uz</div>
            </div>
          </div>
          <div>
            <div className="font-semibold mb-3">Соцсети</div>
            <div className="flex gap-3">
              <a href="#" className="bg-cream/10 hover:bg-cream/20 text-cream w-10 h-10 rounded-xl flex items-center justify-center transition-colors">📸</a>
              <a href={TG_LINK} className="bg-cream/10 hover:bg-cream/20 text-cream w-10 h-10 rounded-xl flex items-center justify-center transition-colors">✈️</a>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-cream/10 text-center text-cream/30 text-xs">
          © 2025 Студия Лотос. Все права защищены.
        </div>
      </footer>
    </main>
  );
}
