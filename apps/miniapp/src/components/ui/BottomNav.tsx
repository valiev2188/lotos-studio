import { NavLink } from 'react-router-dom';

const tabs = [
  { to: '/', label: 'Главная', emoji: '🌸' },
  { to: '/schedule', label: 'Расписание', emoji: '🗓' },
  { to: '/my-bookings', label: 'Записи', emoji: '🤍' },
  { to: '/profile', label: 'Профиль', emoji: '👤' },
];

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: '#fff',
        borderTop: '1px solid #EDE4D8',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="flex">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors font-instrument ${
                isActive ? 'text-[#774936]' : 'text-[#B8A898]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className="text-xl">{tab.emoji}</span>
                <span className={`text-[10px] ${isActive ? 'font-semibold' : 'font-normal'}`}>
                  {tab.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
