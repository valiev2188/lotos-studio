import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../stores/useUserStore';
import { apiFetch } from '../../api/client';
import { haptic } from '../../utils/telegram';

interface ClassItem {
  id: string;
  title: string;
  startsAt: string;
  durationMin: number;
  trainer?: { user?: { firstName: string } };
  maxSpots: number;
  _count?: { bookings: number };
}

const DIRECTIONS = ['Йога', 'Пилатес', 'Стретчинг', 'Фитнес', 'Медитация', 'Барре'];

const C = {
  bg: '#FAF5EF',
  white: '#FFFFFF',
  bark: '#1C1810',
  stone: '#8B7355',
  dust: '#B8A898',
  terra: '#774936',
  border: '#EDE4D8',
};

export default function HomePage() {
  const { user } = useUserStore();
  const navigate = useNavigate();
  const today = new Date().toISOString().slice(0, 10);
  const weekLater = new Date(Date.now() + 7 * 86400_000).toISOString().slice(0, 10);

  const { data } = useQuery({
    queryKey: ['schedule-home'],
    queryFn: () => apiFetch<{ data: ClassItem[] }>(`/schedule?dateFrom=${today}&dateTo=${weekLater}`),
  });
  const classes = (data?.data || []).slice(0, 3);

  return (
    <div className="min-h-screen pb-28 font-instrument" style={{ background: C.bg }}>
      {/* Header */}
      <div className="px-5 pt-10 pb-2">
        {user?.firstName ? (
          <p className="text-sm mb-0.5" style={{ color: C.dust }}>Привет, {user.firstName} 🌸</p>
        ) : (
          <p className="text-sm mb-0.5" style={{ color: C.dust }}>Добро пожаловать 🌸</p>
        )}
        <h1 className="font-syne font-bold text-2xl" style={{ color: C.bark }}>Студия Лотос</h1>
      </div>

      {/* Promo banner */}
      <div className="mx-5 mt-4 mb-6 rounded-3xl p-5 relative overflow-hidden"
           style={{ background: 'linear-gradient(135deg, #774936 0%, #9A6452 100%)' }}>
        <p className="text-[11px] tracking-widest uppercase mb-1 font-medium"
           style={{ color: 'rgba(250,245,239,0.65)' }}>
          Специальное предложение
        </p>
        <h2 className="font-syne font-bold text-lg leading-tight mb-3" style={{ color: '#FAF5EF' }}>
          Первое занятие — бесплатно
        </h2>
        <button
          onClick={() => { haptic('medium'); navigate('/schedule'); }}
          className="text-sm font-semibold px-5 py-2.5 rounded-full active:scale-95 transition-all"
          style={{ background: '#FAF5EF', color: '#774936' }}
        >
          Записаться →
        </button>
        <div className="absolute -right-2 -bottom-3 text-6xl opacity-15 select-none">🪷</div>
      </div>

      {/* Quick actions */}
      <div className="px-5 mb-6">
        <h2 className="font-syne font-bold text-base mb-3" style={{ color: C.bark }}>
          Быстрые действия
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {([
            { label: 'Расписание', emoji: '🗓', path: '/schedule' },
            { label: 'Мои записи', emoji: '🤍', path: '/my-bookings' },
            { label: 'Тренеры', emoji: '🧘', path: '/trainers' },
            { label: 'Упражнения', emoji: '🌿', path: '/exercises' },
          ] as const).map((a) => (
            <button
              key={a.label}
              onClick={() => { haptic(); navigate(a.path); }}
              className="flex items-center gap-3 p-4 rounded-2xl text-left active:scale-95 transition-all"
              style={{ background: C.white, boxShadow: '0 2px 12px rgba(28,24,16,0.06)' }}
            >
              <span className="text-2xl">{a.emoji}</span>
              <span className="font-medium text-sm" style={{ color: C.bark }}>{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Directions */}
      <div className="mb-6">
        <h2 className="font-syne font-bold text-base px-5 mb-3" style={{ color: C.bark }}>
          Направления
        </h2>
        <div className="flex gap-2 overflow-x-auto px-5 pb-1">
          {DIRECTIONS.map((d) => (
            <button
              key={d}
              onClick={() => { haptic(); navigate('/schedule'); }}
              className="flex-shrink-0 text-sm font-medium px-4 py-2 rounded-full border whitespace-nowrap active:scale-95 transition-all"
              style={{ background: C.white, borderColor: C.border, color: C.stone }}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Upcoming classes */}
      <div className="px-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-syne font-bold text-base" style={{ color: C.bark }}>
            Ближайшие занятия
          </h2>
          <button onClick={() => navigate('/schedule')} className="text-sm font-medium"
                  style={{ color: C.terra }}>
            Все →
          </button>
        </div>

        {classes.length === 0 && (
          <div className="text-center py-12" style={{ color: C.dust }}>
            <div className="text-4xl mb-3">🌸</div>
            <p className="text-sm">Занятия скоро появятся</p>
          </div>
        )}

        <div className="space-y-3">
          {classes.map((c) => {
            const dt = new Date(c.startsAt);
            const time = dt.toLocaleString('ru-RU', {
              weekday: 'short', day: 'numeric', month: 'short',
              hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tashkent',
            });
            return (
              <div key={c.id} className="flex items-center justify-between p-4 rounded-2xl"
                   style={{ background: C.white, boxShadow: '0 2px 12px rgba(28,24,16,0.06)' }}>
                <div>
                  <p className="font-semibold text-sm" style={{ color: C.bark }}>{c.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: C.stone }}>{time}</p>
                  {c.trainer?.user && (
                    <p className="text-xs mt-0.5" style={{ color: C.dust }}>
                      {c.trainer.user.firstName}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => { haptic('medium'); navigate('/schedule'); }}
                  className="text-xs font-semibold px-4 py-2 rounded-full active:scale-95 transition-all"
                  style={{ background: C.terra, color: '#fff' }}
                >
                  Записаться
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
