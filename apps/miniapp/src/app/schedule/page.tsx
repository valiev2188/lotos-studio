import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/client';
import { haptic, hapticSuccess } from '../../utils/telegram';

interface ClassItem {
  id: string;
  title: string;
  startsAt: string;
  durationMin: number;
  maxSpots: number;
  level: string;
  status: string;
  direction?: { name: string };
  trainer?: { user?: { firstName: string } };
  _count?: { bookings: number };
}

const C = {
  bg: '#FAF5EF', white: '#FFFFFF', bark: '#1C1810',
  stone: '#8B7355', dust: '#B8A898', terra: '#774936', border: '#EDE4D8',
};

const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const DIRS = ['Все', 'Йога', 'Пилатес', 'Стретчинг', 'Фитнес', 'Медитация'];

function getDateForOffset(offset: number) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

export default function SchedulePage() {
  const [dayOffset, setDayOffset] = useState(0);
  const [dir, setDir] = useState('Все');
  const qc = useQueryClient();

  const dateStr = getDateForOffset(dayOffset);
  const nextDay = getDateForOffset(dayOffset + 1);

  const { data, isLoading } = useQuery({
    queryKey: ['schedule', dateStr, dir],
    queryFn: () => apiFetch<{ data: ClassItem[] }>(`/schedule?dateFrom=${dateStr}&dateTo=${nextDay}`),
  });

  const bookMutation = useMutation({
    mutationFn: (classId: string) =>
      apiFetch('/bookings', { method: 'POST', body: JSON.stringify({ classId }) }),
    onSuccess: () => {
      hapticSuccess();
      qc.invalidateQueries({ queryKey: ['schedule'] });
      qc.invalidateQueries({ queryKey: ['bookings'] });
    },
  });

  const classes = (data?.data || []).filter(
    (c) => dir === 'Все' || c.direction?.name === dir,
  );

  return (
    <div className="min-h-screen pb-28 font-instrument" style={{ background: C.bg }}>
      {/* Header */}
      <div className="px-5 pt-10 pb-4" style={{ background: C.white, boxShadow: '0 1px 0 #EDE4D8' }}>
        <h1 className="font-syne font-bold text-2xl mb-4" style={{ color: C.bark }}>
          Расписание
        </h1>

        {/* Day tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {DAYS.map((day, i) => {
            const d = new Date();
            d.setDate(d.getDate() + i);
            const num = d.getDate();
            const active = dayOffset === i;
            return (
              <button
                key={day}
                onClick={() => { haptic(); setDayOffset(i); }}
                className="flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-2xl text-sm transition-all"
                style={{
                  background: active ? C.terra : 'transparent',
                  color: active ? '#fff' : C.stone,
                  minWidth: 48,
                }}
              >
                <span className="text-[10px] uppercase">{day}</span>
                <span className="font-bold text-base leading-tight">{num}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Direction filter */}
      <div className="flex gap-2 overflow-x-auto px-5 py-3"
           style={{ borderBottom: `1px solid ${C.border}` }}>
        {DIRS.map((d) => (
          <button
            key={d}
            onClick={() => { haptic(); setDir(d); }}
            className="flex-shrink-0 text-xs font-medium px-4 py-2 rounded-full border whitespace-nowrap transition-all"
            style={{
              background: dir === d ? C.terra : C.white,
              borderColor: dir === d ? C.terra : C.border,
              color: dir === d ? '#fff' : C.stone,
            }}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Classes */}
      <div className="px-5 py-4 space-y-3">
        {isLoading && (
          <div className="text-center py-12" style={{ color: C.dust }}>Загрузка...</div>
        )}
        {!isLoading && classes.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🌿</div>
            <p className="text-sm" style={{ color: C.dust }}>Занятий на этот день нет</p>
          </div>
        )}
        {classes.map((c) => {
          const dt = new Date(c.startsAt);
          const time = dt.toLocaleTimeString('ru-RU', {
            hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tashkent',
          });
          const booked = c._count?.bookings || 0;
          const available = c.maxSpots - booked;
          const isFull = available <= 0;

          return (
            <div key={c.id} className="rounded-2xl p-4"
                 style={{ background: C.white, boxShadow: '0 2px 12px rgba(28,24,16,0.06)' }}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {c.direction && (
                      <span className="text-[10px] font-medium px-2.5 py-1 rounded-full"
                            style={{ background: '#F2E9DF', color: C.stone }}>
                        {c.direction.name}
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-sm" style={{ color: C.bark }}>{c.title}</p>
                  <p className="text-xs mt-1" style={{ color: C.stone }}>
                    {time} · {c.durationMin} мин
                  </p>
                  {c.trainer?.user && (
                    <p className="text-xs mt-0.5" style={{ color: C.dust }}>
                      {c.trainer.user.firstName}
                    </p>
                  )}
                  <p className="text-xs mt-2" style={{ color: isFull ? '#C4927A' : C.dust }}>
                    {isFull ? 'Мест нет' : `${available} из ${c.maxSpots} мест`}
                  </p>
                </div>
                <button
                  onClick={() => { haptic('medium'); bookMutation.mutate(c.id); }}
                  disabled={isFull || bookMutation.isPending || c.status !== 'scheduled'}
                  className="ml-3 text-xs font-semibold px-4 py-2.5 rounded-full transition-all active:scale-95 flex-shrink-0"
                  style={{
                    background: isFull ? C.border : C.terra,
                    color: isFull ? C.dust : '#fff',
                  }}
                >
                  {bookMutation.isPending ? '...' : isFull ? 'Полный' : 'Записаться'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
