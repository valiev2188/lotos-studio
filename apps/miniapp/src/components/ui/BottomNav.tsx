import { NavLink } from 'react-router-dom';

const tabs = [
  { to: '/', label: 'Главная', icon: '🏠' },
  { to: '/schedule', label: 'Расписание', icon: '📅' },
  { to: '/my-bookings', label: 'Записи', icon: '✅' },
  { to: '/profile', label: 'Профиль', icon: '👤' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-dark border-t border-cream/10 safe-bottom z-50">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-4 py-2 transition-colors ${
                isActive ? 'text-cream' : 'text-cream/40'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className="text-xl">{tab.icon}</span>
                <span className={`text-[10px] font-instrument ${isActive ? 'text-cream' : 'text-cream/40'}`}>
                  {tab.label}
                </span>
                {isActive && <div className="w-1 h-1 rounded-full bg-purple mt-0.5" />}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
