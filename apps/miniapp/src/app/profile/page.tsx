import { useUserStore } from '../../stores/useUserStore';
import { haptic } from '../../utils/telegram';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const { user, logout } = useUserStore();
  const navigate = useNavigate();
  const name = user ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Пользователь';

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-dark px-4 pt-8 pb-8">
        <h1 className="font-syne text-2xl font-bold text-cream mb-6">Профиль</h1>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-brown/30 flex items-center justify-center text-3xl">
            🪷
          </div>
          <div>
            <div className="text-cream font-syne font-bold text-lg">{name}</div>
            {user?.phone && <div className="text-cream/50 text-sm mt-0.5">{user.phone as string}</div>}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 py-6">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Занятий', value: '0' },
            { label: 'Streak', value: '0 🔥' },
            { label: 'В месяце', value: '0' },
          ].map((s) => (
            <div key={s.label} className="bg-dark rounded-2xl p-4 text-center">
              <div className="text-cream font-syne font-bold text-xl">{s.value}</div>
              <div className="text-cream/40 text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Subscription */}
      <div className="px-4 pb-6">
        <h2 className="font-syne font-bold text-dark text-lg mb-3">Абонемент</h2>
        <div className="bg-dark rounded-2xl p-5">
          <div className="text-cream/50 text-sm text-center py-4">
            У вас нет активного абонемента
          </div>
          <button
            onClick={() => haptic('medium')}
            className="w-full bg-brown text-cream font-semibold py-3 rounded-xl text-sm mt-2"
          >
            Купить абонемент
          </button>
        </div>
      </div>

      {/* Settings */}
      <div className="px-4 pb-8">
        <h2 className="font-syne font-bold text-dark text-lg mb-3">Настройки</h2>
        <div className="bg-dark rounded-2xl overflow-hidden">
          {[
            { label: 'Язык', value: 'Русский' },
            { label: 'Уведомления', value: '✅ Включены' },
          ].map((item, i) => (
            <button
              key={item.label}
              onClick={() => haptic()}
              className={`w-full flex items-center justify-between px-4 py-4 text-left ${
                i > 0 ? 'border-t border-cream/10' : ''
              }`}
            >
              <span className="text-cream font-instrument">{item.label}</span>
              <span className="text-cream/40 text-sm">{item.value}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => { haptic('medium'); logout(); navigate('/'); }}
          className="w-full mt-4 bg-red-500/10 text-red-400 font-instrument font-semibold py-4 rounded-2xl text-sm"
        >
          Выйти
        </button>
      </div>
    </div>
  );
}
