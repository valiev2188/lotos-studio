import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';

const NAV = [
  { to: '/', icon: '◈', label: 'Dashboard' },
  { to: '/schedule', icon: '◷', label: 'Расписание' },
  { to: '/clients', icon: '◉', label: 'Клиенты' },
  { to: '/bookings', icon: '◎', label: 'Записи' },
  { to: '/trainers', icon: '◈', label: 'Тренеры' },
  { to: '/finance', icon: '◈', label: 'Финансы' },
  { to: '/notifications', icon: '◈', label: 'Рассылки' },
  { to: '/settings', icon: '◈', label: 'Настройки' },
];

export default function Sidebar() {
  const { admin, logout } = useAuthStore();

  return (
    <aside className="w-60 min-h-screen bg-dark-200 border-r border-dark-50 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-dark-50">
        <div className="font-syne font-bold text-xl text-cream">🪷 Лотос</div>
        <div className="text-cream/30 text-xs mt-0.5 font-instrument">Панель управления</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-instrument transition-colors ${
                isActive
                  ? 'bg-purple/20 text-purple-light font-semibold'
                  : 'text-cream/50 hover:text-cream hover:bg-dark-100'
              }`
            }
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Admin info */}
      <div className="px-4 py-4 border-t border-dark-50">
        <div className="text-cream/70 text-sm font-instrument font-medium">{admin?.firstName}</div>
        <div className="text-cream/30 text-xs">{admin?.email}</div>
        <button
          onClick={logout}
          className="mt-3 text-xs text-red-400 hover:text-red-300 transition-colors"
        >
          Выйти
        </button>
      </div>
    </aside>
  );
}
