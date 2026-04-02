import Link from 'next/link';

const TG_LINK = 'https://t.me/lotos_bot?startapp=book';

const directions = [
  { name: 'Йога', desc: 'Хатха, виньяса и восстановительные практики для тела и разума.' },
  { name: 'Пилатес', desc: 'Укрепление кора, осанка и гибкость для всех уровней.' },
  { name: 'Стретчинг', desc: 'Растяжка и гибкость — занятия для начинающих и опытных.' },
  { name: 'Фитнес', desc: 'Функциональные тренировки, кардио и силовые упражнения.' },
  { name: 'Медитация', desc: 'Осознанность, дыхание и глубокая релаксация.' },
  { name: 'Барре', desc: 'Балетные тренировки для тонуса, грации и осанки.' },
];

const features = [
  { title: "Душевая с мягкими полотенцами", emoji: "🚿" },
  { title: "Уютная лаунж-зона", emoji: "🛋️" },
  { title: "Комфортный, просторный зал", emoji: "✨" },
  { title: "Чай, кофе, вода в свободном доступе", emoji: "☕" },
];

const trainers = [
  {
    name: 'Камила Рахимова',
    stats: 'Опыт: 5 лет',
    specs: ['Йога', 'Медитация'],
  },
  {
    name: 'Диана Ким',
    stats: 'Опыт: 7 лет',
    specs: ['Пилатес', 'Стретчинг', 'Здоровая спина'],
  },
  {
    name: 'Азиз Каримов',
    stats: 'Опыт: 4 года',
    specs: ['Фитнес', 'Барре', 'Силовые'],
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-estetica-bg font-onest text-estetica-text scroll-smooth">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b border-estetica-card/50">
        <div className="max-w-7xl mx-auto px-4 h-[72px] flex items-center justify-between">
          <div className="font-bold text-xl md:text-2xl tracking-tight text-estetica-text flex items-center gap-2">
            ЛОТОС <span className="hidden sm:inline text-xs font-medium text-estetica-muted uppercase tracking-widest mt-1">студия женского фитнеса</span>
          </div>
          <div className="flex gap-6 items-center">
             <a
              href="#directions"
              className="hidden md:block text-[15px] font-medium hover:text-estetica-terracotta transition-colors"
            >
              Направления
            </a>
            <a
              href="#trainers"
              className="hidden md:block text-[15px] font-medium hover:text-estetica-terracotta transition-colors"
            >
              Тренеры
            </a>
            <a
              href={TG_LINK}
              className="bg-estetica-terracotta text-white text-[15px] font-medium px-6 py-3 rounded-[14px] hover:bg-estetica-terracottaHover shadow-sm transition-all duration-200"
            >
              Записаться
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-[120px] pb-24 px-4 min-h-[85vh] flex items-center justify-center bg-estetica-card overflow-hidden">
        {/* Soft atmospheric gradient background */}
        <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none opacity-60">
          <div className="absolute w-[80vw] h-[80vw] md:w-[50vw] md:h-[50vw] bg-estetica-terracotta/10 rounded-full blur-[120px] top-[-20%] right-[-10%] animate-pulse" />
          <div className="absolute w-[70vw] h-[70vw] md:w-[40vw] md:h-[40vw] bg-estetica-olive/10 rounded-full blur-[120px] bottom-[-10%] left-[-10%]" />
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
          <h1 className="text-[44px] sm:text-[56px] md:text-[80px] font-bold leading-[1.05] tracking-tight mb-8">
            Студия фитнеса Лотос в Ташкенте<br />
            <span className="text-estetica-terracotta block mt-2">йога, пилатес, стретчинг</span>
          </h1>
          <p className="text-lg md:text-2xl text-estetica-muted mb-12 max-w-3xl mx-auto leading-relaxed">
            Опытные профессиональные тренеры. Индивидуальный подход. Персональный тренинг, групповые занятия, эстетика во всем.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <a
              href={TG_LINK}
              className="w-full sm:w-auto bg-estetica-terracotta text-white text-[17px] font-medium px-10 py-5 rounded-[14px] hover:bg-estetica-terracottaHover transition-all shadow-sm flex items-center justify-center"
            >
              Записаться на пробное
            </a>
            <a
              href={TG_LINK}
              className="w-full sm:w-auto border border-estetica-terracotta text-estetica-terracotta text-[17px] font-medium px-10 py-5 rounded-[14px] hover:bg-estetica-terracotta/5 transition-all flex items-center justify-center"
            >
              Смотреть расписание
            </a>
          </div>
        </div>
      </section>

      {/* Directions */}
      <section id="directions" className="py-[100px] px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-[32px] md:text-[44px] font-bold text-center mb-16 tracking-tight">
            Выберите направление, которое подходит именно Вам!
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {directions.map((d) => (
              <div
                key={d.name}
                className="bg-estetica-card rounded-[14px] p-8 flex flex-col h-full hover:shadow-[0_10px_30px_rgba(0,0,0,0.03)] transition-all duration-300 border border-transparent hover:border-gray-100"
              >
                <h3 className="text-2xl font-bold mb-4">{d.name}</h3>
                <p className="text-estetica-muted text-[17px] leading-[1.6] mb-10 flex-1">{d.desc}</p>
                <div className="flex flex-col gap-3 mt-auto">
                  <a
                    href={TG_LINK}
                    className="w-full text-center border border-estetica-terracotta text-estetica-terracotta font-medium px-6 py-[14px] rounded-[14px] hover:bg-estetica-terracotta/5 transition-all"
                  >
                    Записаться
                  </a>
                  <a
                    href="#"
                    className="w-full text-center border border-estetica-olive text-estetica-olive font-medium px-6 py-[14px] rounded-[14px] hover:bg-estetica-olive/5 transition-all"
                  >
                    Подробнее
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-[100px] px-4 bg-estetica-card">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-[32px] md:text-[44px] font-bold text-center mb-16 tracking-tight">
            Всё продумано до мелочей!
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-white rounded-[14px] p-8 text-center shadow-[0_5px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.05)] transition-shadow">
                <div className="text-[48px] mb-6 leading-none">{f.emoji}</div>
                <div className="font-semibold text-lg">{f.title}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trainers */}
      <section id="trainers" className="py-[100px] px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-[32px] md:text-[44px] font-bold text-center mb-16 tracking-tight">
            Тренеры, которым мы полностью доверяем!
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {trainers.map((t) => (
              <div key={t.name} className="flex flex-col bg-white border border-gray-100 shadow-[0_5px_20px_rgba(0,0,0,0.02)] rounded-[14px] p-8 hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition-all">
                {/* Temporary Avatar Placeholder */}
                <div className="w-[120px] h-[120px] bg-estetica-card rounded-full mb-8 flex items-center justify-center text-4xl text-estetica-muted font-bold mx-auto">
                  {t.name[0]}
                </div>
                <h3 className="text-[22px] font-bold mb-3">{t.name}</h3>
                <div className="text-[15px] font-medium text-estetica-muted mb-4">{t.stats}</div>
                <ul className="text-[15px] mb-8 space-y-2 text-estetica-text flex-1">
                  {t.specs.map(s => (
                    <li key={s} className="flex gap-2">
                       <span className="text-estetica-olive">•</span>
                       {s}
                    </li>
                  ))}
                </ul>
                <a
                  href="#"
                  className="mt-auto w-full text-center bg-estetica-terracotta text-white font-medium px-6 py-[14px] rounded-[14px] hover:bg-estetica-terracottaHover transition-all shadow-sm"
                >
                  Узнать больше
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 text-estetica-text py-[80px] px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="max-w-sm">
            <div className="font-bold text-3xl tracking-tight mb-4">ЛОТОС</div>
            <p className="text-estetica-muted text-[17px] flex flex-col gap-2 mt-6">
              <a href="tel:+998901234567" className="hover:text-estetica-terracotta transition-colors font-medium text-estetica-text">+998 (90) 123-45-67</a>
              <a href="mailto:hello@lotos-studio.uz" className="hover:text-estetica-terracotta transition-colors">hello@lotos-studio.uz</a>
            </p>
          </div>
          <div className="flex flex-col md:text-right gap-3 w-full md:w-auto">
             <a href="#" className="text-[15px] text-estetica-muted hover:text-estetica-terracotta transition-colors">Политика конфиденциальности</a>
             <a href="#" className="text-[15px] text-estetica-muted hover:text-estetica-terracotta transition-colors">Договор-оферта</a>
             <div className="mt-8 flex flex-wrap gap-3 md:justify-end">
               <a href={TG_LINK} className="px-5 py-3 border border-gray-200 rounded-[14px] font-medium hover:bg-gray-50 flex items-center gap-2 transition-all">
                 <span className="text-lg">🎯</span> Записаться
               </a>
             </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
