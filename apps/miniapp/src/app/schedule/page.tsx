import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../api/client';
import { haptic } from '../../utils/telegram';

const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const DIRECTIONS = ['Все', 'Йога', 'Пилатес', 'Стретчинг', 'Фитнес', 'Медитация', 'Барре'];

interface ClassItem {
  id: string;
  title: string;
  startsAt: string;
  durationMin: number;
  availableSpots: number;
  maxSpots: number;
  level: string;
  trainer?: { user?: { firstName: string; lastName?: string } };
  direction?: { name: string; color?: string };
}

function getLevelLabel(level: string) {
  return { beginner: 'Новичок', intermediate: 'Средний', all: 'Все уровни' }[level] || level;
}

export default function SchedulePage() {
  const [activeDay, setActiveDay] = useState(0);
  const [activeDir, setActiveDir] = useState('Все');

  const today = new Date();
  const dateFrom = new Date(today);
  dateFrom.setDate(today.getDate() + activeDay);
  dateFrom.setHours(0, 0, 0, 0);
  const dateTo = new Date(dateFrom);
  dateTo.setHours(23, 59, 59, 999);

  const { data, isLoading } = useQuery({
    queryKey: ['schedule', activeDay],
    queryFn: () => apiFetch<{ data: ClassItem[] }>(
      `/schedule?dateFrom=${dateFrom.toISOString()}&dateTo=${dateTo.toISOString()}`
    ),
  });

  const classes = (data?.data || []).filter(
    (c) => activeDir === 'Все' || c.direction?.name === activeDir
  );

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-dark px-4 pt-8 pb-4">
        <h1 className="font-syne text-2xl font-bold text-cream mb-4">Расписание</h1>

        {/* Day tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {DAYS.map((d, i) => {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            return (
              <button
                key={d}
                onClick={() => { haptic(); setActiveDay(i); }}
                className={`flex-none flex flex-col items-center px-3 py-2 rounded-xl transition-colors ${
                  activeDay === i ? 'bg-brown text-cream' : 'bg-cream/10 text-cream/60'
                }`}
              >
                <span className="text-xs">{d}</span>
                <span className="text-sm font-bold">{date.getDate()}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Direction filter */}
      <div className="px-4 py-3 bg-dark/5">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {DIRECTIONS.map((d) => (
            <button
              key={d}
              onClick={() => { haptic(); setActiveDir(d); }}
              className={`flex-none text-xs font-instrument font-semibold px-3 py-1.5 rounded-full transition-colors ${
                activeDir === d ? 'bg-dark text-cream' : 'bg-dark/10 text-dark/60'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Classes */}
      <div className="px-4 py-4 space-y-3">
        {isLoading && (
          <div className="text-center py-12 text-dark/40 font-instrument">Загрузка...</div>
        )}
        {!isLoading && classes.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🌿</div>
            <div className="text-dark/50 font-instrument">На этот день занятий нет</div>
          </div>
        )}
        {classes.map((cls) => {
          const time = new Date(cls.startsAt).toLocaleTimeString('ru-RU', {
            hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tashkent',
          });
          const trainerName = cls.trainer?.user
            ? `${cls.trainer.user.firstName} ${cls.trainer.user.lastName?.[0] || ''}.`
            : 'Тренер';
          const isFull = cls.availableSpots <= 0;

          return (
            <div key={cls.id} className="bg-dark rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="bg-brown/20 rounded-xl px-3 py-2 text-center min-w-[52px]">
                  <div className="text-cream font-syne font-bold">{time}</div>
                  <div className="text-cream/40 text-[10px]">{cls.durationMin} мин</div>
                </div>
                <div className="flex-1">
                  <div className="text-cream font-instrument font-semibold">{cls.title}</div>
                  <div className="text-cream/50 text-xs mt-0.5">{trainerName}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] bg-cream/10 text-cream/60 px-2 py-0.5 rounded-full">
                      {getLevelLabel(cls.level)}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      isFull ? 'bg-red-500/20 text-red-400' : 'bg-purple/20 text-purple-light'
                    }`}>
                      {isFull ? 'Мест нет' : `${cls.availableSpots} мест`}
                    </span>
                  </div>
                </div>
                <button
                  disabled={isFull}
                  onClick={() => haptic('medium')}
                  className={`text-xs font-semibold px-3 py-2 rounded-xl transition-colors ${
                    isFull
                      ? 'bg-cream/10 text-cream/30 cursor-not-allowed'
                      : 'bg-brown text-cream hover:bg-brown-dark'
                  }`}
                >
                  {isFull ? 'Лист ожидания' : 'Записаться'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
