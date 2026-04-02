import { useUserStore } from '../../stores/useUserStore';
import { haptic } from '../../utils/telegram';
import { useNavigate } from 'react-router-dom';

const C = {
  bg: '#FAF5EF', white: '#FFFFFF', bark: '#1C1810',
  stone: '#8B7355', dust: '#B8A898', terra: '#774936', border: '#EDE4D8',
  petal: '#F2E9DF',
};

export default function ProfilePage() {
  const { user, logout } = useUserStore();
  const navigate = useNavigate();
  const name = user ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Пользователь';

  return (
    <div className="min-h-screen pb-28 font-instrument" style={{ background: C.bg }}>
      {/* Header */}
      <div className="px-5 pt-10 pb-6" style={{ background: C.white, boxShadow: '0 1px 0 #EDE4D8' }}>
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-3xl flex-shrink-0"
            style={{ background: C.petal }}
          >
            🪷
          </div>
          <div>
            <h1 className="font-syne font-bold text-xl" style={{ color: C.bark }}>{name}</h1>
            {user?.phone && (
              <p className="text-sm mt-0.5" style={{ color: C.dust }}>{user.phone as string}</p>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-5 py-5">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Занятий', value: '0' },
            { label: 'Streak', value: '0 🔥' },
            { label: 'В месяце', value: '0' },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl p-4 text-center"
              style={{ background: C.white, boxShadow: '0 2px 12px rgba(28,24,16,0.06)' }}
            >
              <div className="font-syne font-bold text-xl" style={{ color: C.bark }}>{s.value}</div>
              <div className="text-xs mt-1" style={{ color: C.dust }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Subscription */}
      <div className="px-5 pb-5">
        <h2 className="font-syne font-bold text-base mb-3" style={{ color: C.bark }}>Абонемент</h2>
        <div className="rounded-2xl p-5" style={{ background: C.white, boxShadow: '0 2px 12px rgba(28,24,16,0.06)' }}>
          <p className="text-sm text-center py-3" style={{ color: C.dust }}>
            У вас нет активного абонемента
          </p>
          <button
            onClick={() => haptic('medium')}
            className="w-full font-semibold py-3 rounded-full text-sm mt-2 transition-all active:scale-95"
            style={{ background: C.terra, color: '#fff' }}
          >
            Купить абонемент
          </button>
        </div>
      </div>

      {/* Settings */}
      <div className="px-5 pb-8">
        <h2 className="font-syne font-bold text-base mb-3" style={{ color: C.bark }}>Настройки</h2>
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: C.white, boxShadow: '0 2px 12px rgba(28,24,16,0.06)' }}
        >
          {[
            { label: 'Язык', value: 'Русский' },
            { label: 'Уведомления', value: '✅ Включены' },
          ].map((item, i) => (
            <button
              key={item.label}
              onClick={() => haptic()}
              className="w-full flex items-center justify-between px-4 py-4 text-left"
              style={{ borderTop: i > 0 ? `1px solid ${C.border}` : 'none' }}
            >
              <span style={{ color: C.bark }}>{item.label}</span>
              <span className="text-sm" style={{ color: C.dust }}>{item.value}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => { haptic('medium'); logout(); navigate('/'); }}
          className="w-full mt-4 font-semibold py-4 rounded-2xl text-sm transition-all active:scale-95"
          style={{ background: '#FBF0EE', color: '#A05040' }}
        >
          Выйти
        </button>
      </div>
    </div>
  );
}
