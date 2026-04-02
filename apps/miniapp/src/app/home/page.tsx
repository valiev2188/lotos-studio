import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../stores/useUserStore';
import { haptic } from '../../utils/telegram';

const quickActions = [
  { label: 'Расписание', icon: '📅', path: '/schedule', color: 'bg-brown' },
  { label: 'Мои записи', icon: '✅', path: '/my-bookings', color: 'bg-purple' },
  { label: 'Тренеры', icon: '🏆', path: '/trainers', color: 'bg-dark' },
  { label: 'Упражнения', icon: '🤸', path: '/exercises', color: 'bg-brown/80' },
];

const directions = ['Йога', 'Пилатес', 'Стретчинг', 'Фитнес', 'Медитация', 'Барре'];

export default function HomePage() {
  const { user } = useUserStore();
  const navigate = useNavigate();
  const firstName = (user?.firstName as string) || 'друг';

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-dark px-4 pt-8 pb-8">
        <p className="text-cream/50 text-sm font-instrument">Привет,</p>
        <h1 className="font-syne text-2xl font-bold text-cream">{firstName} 🪷</h1>

        {/* Banner */}
        <div className="mt-5 bg-brown/30 border border-brown/50 rounded-2xl p-4">
          <div className="text-cream/70 text-xs uppercase tracking-widest font-semibold mb-1">Специальное предложение</div>
          <div className="text-cream font-syne font-bold text-lg">Первое занятие — бесплатно</div>
          <button
            onClick={() => { haptic('medium'); navigate('/schedule'); }}
            className="mt-3 bg-brown text-cream text-sm font-semibold px-4 py-2 rounded-xl"
          >
            Записаться →
          </button>
        </div>
      </div>

      {/* Quick actions */}
      <div className="px-4 py-6">
        <h2 className="font-syne font-bold text-dark text-lg mb-4">Быстрые действия</h2>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((a) => (
            <button
              key={a.label}
              onClick={() => { haptic(); navigate(a.path); }}
              className={`${a.color} text-cream rounded-2xl p-4 flex items-center gap-3 text-left`}
            >
              <span className="text-2xl">{a.icon}</span>
              <span className="font-instrument font-semibold text-sm">{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Directions */}
      <div className="px-4 pb-6">
        <h2 className="font-syne font-bold text-dark text-lg mb-4">Направления</h2>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {directions.map((d) => (
            <button
              key={d}
              onClick={() => { haptic(); navigate('/schedule'); }}
              className="flex-none bg-dark text-cream text-sm font-instrument font-medium px-4 py-2 rounded-full whitespace-nowrap"
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Upcoming */}
      <div className="px-4 pb-8">
        <h2 className="font-syne font-bold text-dark text-lg mb-4">Ближайшие занятия</h2>
        <div className="space-y-3">
          {[
            { title: 'Утренняя йога', time: 'Пн, 08:00', trainer: 'Камила Р.', spots: 5 },
            { title: 'Пилатес', time: 'Пн, 18:00', trainer: 'Диана К.', spots: 3 },
            { title: 'Стретчинг', time: 'Вт, 10:00', trainer: 'Диана К.', spots: 8 },
          ].map((cls, i) => (
            <button
              key={i}
              onClick={() => { haptic(); navigate('/schedule'); }}
              className="w-full bg-dark rounded-2xl p-4 flex items-center gap-4 text-left"
            >
              <div className="bg-brown/20 rounded-xl px-3 py-2 text-center min-w-[56px]">
                <div className="text-cream/60 text-[10px]">{cls.time.split(',')[0]}</div>
                <div className="text-cream font-syne font-bold text-sm">{cls.time.split(',')[1]?.trim()}</div>
              </div>
              <div className="flex-1">
                <div className="text-cream font-instrument font-semibold">{cls.title}</div>
                <div className="text-cream/50 text-xs mt-0.5">{cls.trainer}</div>
              </div>
              <div className="text-purple text-xs text-right">
                <div>{cls.spots}</div>
                <div>мест</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
