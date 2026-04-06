import { NavLink } from 'react-router-dom';
import { Home, CalendarDays, Bookmark, User } from 'lucide-react';

const C = {
  bg: '#FAF5EF', white: '#FFFFFF', bark: '#1C1810',
  stone: '#8B7355', dust: '#B8A898', terra: '#774936', border: '#EDE4D8',
  petal: '#F2E9DF', green: '#4CAF50', amber: '#F59E0B', red: '#EF4444',
  purple: '#662E9B', purpleLight: '#f3ecfb',
};

const tabs = [
  { to: '/',            label: 'Главная',    Icon: Home },
  { to: '/schedule',    label: 'Расписание', Icon: CalendarDays },
  { to: '/my-bookings', label: 'Записи',     Icon: Bookmark },
  { to: '/profile',     label: 'Профиль',    Icon: User },
];

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: C.white,
        borderTop: `1px solid ${C.border}`,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="flex">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className="flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors font-instrument"
          >
            {({ isActive }) => (
              <>
                <tab.Icon
                  size={20}
                  color={isActive ? C.terra : C.dust}
                  strokeWidth={isActive ? 2 : 1.5}
                />
                <span
                  className={`text-[10px] ${isActive ? 'font-semibold' : 'font-normal'}`}
                  style={{ color: isActive ? C.terra : C.dust }}
                >
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
