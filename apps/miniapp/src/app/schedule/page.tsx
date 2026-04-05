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
  room?: string;
  direction?: { name: string };
  trainer?: { user?: { firstName: string; lastName?: string } };
  _count?: { bookings: number };
}

const C = {
  bg: '#FAF5EF',
  white: '#FFFFFF',
  bark: '#1C1810',
  stone: '#8B7355',
  dust: '#B8A898',
  terra: '#774936',
  border: '#EDE4D8',
  petal: '#F2E9DF',
  green: '#4CAF50',
  amber: '#F59E0B',
  red: '#EF4444',
};

const DAY_NAMES   = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
const DAY_FULL    = ['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота'];
const MONTH_NAMES = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
const DIRS        = ['Все','Йога','Пилатес','Стретчинг','Фитнес','Медитация','Барре'];

function toISO(d: Date) { return d.toISOString().slice(0, 10); }

function toTime(iso: string) {
  return new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tashkent' });
}

function toEndTime(iso: string, dur: number) {
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() + dur);
  return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tashkent' });
}

function spotsStatus(available: number, max: number): 'ok' | 'few' | 'full' {
  if (available <= 0) return 'full';
  if (available <= 3 || available / max < 0.25) return 'few';
  return 'ok';
}

export default function SchedulePage() {
  const todayBase = new Date();
  todayBase.setHours(0, 0, 0, 0);

  // weekOffset: 0 = текущая неделя, 1 = следующая
  const [weekOffset, setWeekOffset] = useState(0);
  // Индекс дня в неделе (0=вс … 6=сб)
  const [dayInWeek, setDayInWeek] = useState(() => new Date().getDay());
  const [dir, setDir] = useState('Все');
  const qc = useQueryClient();

  // Начало отображаемой недели (воскресенье)
  const weekStart = new Date(todayBase);
  weekStart.setDate(todayBase.getDate() + weekOffset * 7 - todayBase.getDay());

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const selectedDate = weekDays[dayInWeek];
  const nextDate = new Date(selectedDate);
  nextDate.setDate(selectedDate.getDate() + 1);

  const isToday = toISO(selectedDate) === toISO(todayBase);
  const headerTitle = `${selectedDate.getDate()} ${MONTH_NAMES[selectedDate.getMonth()]}, ${DAY_FULL[selectedDate.getDay()]}`;

  const { data, isLoading } = useQuery({
    queryKey: ['schedule', toISO(selectedDate), dir],
    queryFn: () =>
      apiFetch<{ data: ClassItem[] }>(
        `/schedule?dateFrom=${toISO(selectedDate)}&dateTo=${toISO(nextDate)}`,
      ),
    staleTime: 60_000,
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

  const classes = (data?.data ?? []).filter(
    (c) => dir === 'Все' || c.direction?.name === dir,
  );

  return (
    <div className="min-h-screen pb-28 font-instrument" style={{ background: C.bg }}>

      {/* ── Header sticky ───────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10" style={{ background: C.white, boxShadow: '0 1px 0 #EDE4D8' }}>

        {/* Навигация по неделям */}
        <div className="flex items-center justify-between px-5 pt-10 pb-2">
          <button
            onClick={() => { haptic(); setWeekOffset(w => w - 1); }}
            className="w-9 h-9 flex items-center justify-center rounded-full text-lg font-bold transition-all active:scale-95"
            style={{ background: C.petal, color: C.terra }}
          >
            ‹
          </button>

          <div className="text-center flex-1 px-2">
            <p className="font-syne font-bold text-[15px] leading-tight" style={{ color: C.bark }}>
              {headerTitle}
            </p>
            {isToday && (
              <p className="text-[11px]" style={{ color: C.dust }}>Сегодня</p>
            )}
          </div>

          <button
            onClick={() => { haptic(); setWeekOffset(w => w + 1); }}
            className="w-9 h-9 flex items-center justify-center rounded-full text-lg font-bold transition-all active:scale-95"
            style={{ background: C.petal, color: C.terra }}
          >
            ›
          </button>
        </div>

        {/* Полоска 7 дней */}
        <div className="flex px-3 pb-3 gap-1">
          {weekDays.map((day, i) => {
            const active  = i === dayInWeek;
            const isToday2 = toISO(day) === toISO(todayBase);
            const past    = day < todayBase && !isToday2;

            return (
              <button
                key={i}
                onClick={() => { haptic(); setDayInWeek(i); }}
                className="flex-1 flex flex-col items-center py-2 rounded-2xl transition-all active:scale-95"
                style={{
                  background: active ? C.terra : isToday2 ? C.petal : 'transparent',
                  opacity: past ? 0.38 : 1,
                }}
              >
                <span
                  className="font-syne font-bold text-base leading-tight"
                  style={{ color: active ? '#fff' : isToday2 ? C.terra : C.bark }}
                >
                  {day.getDate()}
                </span>
                <span
                  className="text-[10px] uppercase mt-0.5"
                  style={{ color: active ? 'rgba(255,255,255,0.75)' : isToday2 ? C.terra : C.dust }}
                >
                  {DAY_NAMES[day.getDay()]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Фильтр направлений */}
        <div className="flex gap-2 overflow-x-auto px-4 pb-3">
          {DIRS.map((d) => (
            <button
              key={d}
              onClick={() => { haptic(); setDir(d); }}
              className="flex-shrink-0 text-xs font-medium px-4 py-2 rounded-full border whitespace-nowrap transition-all"
              style={{
                background:   dir === d ? C.terra : C.white,
                borderColor:  dir === d ? C.terra : C.border,
                color:        dir === d ? '#fff' : C.stone,
              }}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* ── Список занятий ───────────────────────────────────────────────── */}
      <div className="px-4 py-3 space-y-3">

        {isLoading && (
          <div className="text-center py-16">
            <div className="text-4xl mb-3 animate-pulse">🌿</div>
            <p className="text-sm" style={{ color: C.dust }}>Загружаем расписание...</p>
          </div>
        )}

        {!isLoading && classes.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🌿</div>
            <p className="font-semibold text-sm mb-1" style={{ color: C.bark }}>Занятий нет</p>
            <p className="text-xs" style={{ color: C.dust }}>
              {dir !== 'Все'
                ? `По направлению «${dir}» занятий не запланировано`
                : 'На этот день занятий не запланировано'}
            </p>
          </div>
        )}

        {classes.map((c) => {
          const startTime  = toTime(c.startsAt);
          const endTime    = toEndTime(c.startsAt, c.durationMin);
          const booked     = c._count?.bookings ?? 0;
          const available  = c.maxSpots - booked;
          const status     = spotsStatus(available, c.maxSpots);
          const isPast     = new Date(c.startsAt) < new Date();
          const unavailable = c.status !== 'scheduled' || isPast;

          const trainerName = c.trainer?.user
            ? `${c.trainer.user.firstName}${c.trainer.user.lastName ? ' ' + c.trainer.user.lastName : ''}`
            : null;

          const statusColor = status === 'full' ? C.red : status === 'few' ? C.amber : C.green;
          const statusLabel =
            status === 'full'  ? 'Нет свободных мест' :
            status === 'few'   ? `Осталось ${available} ${available === 1 ? 'место' : 'места'}` :
            `Есть свободные места`;

          return (
            <div
              key={c.id}
              className="rounded-2xl overflow-hidden"
              style={{ background: C.white, boxShadow: '0 2px 12px rgba(28,24,16,0.06)' }}
            >
              <div className="flex">
                {/* Цветная полоска-индикатор */}
                <div className="w-[3px] flex-shrink-0" style={{ background: statusColor }} />

                <div className="flex-1 p-4">
                  <div className="flex items-start gap-3">
                    {/* Время */}
                    <div className="flex-shrink-0 text-right" style={{ minWidth: 42 }}>
                      <p className="font-syne font-bold text-sm" style={{ color: C.bark }}>{startTime}</p>
                      <p className="text-[11px] mt-0.5" style={{ color: C.dust }}>{endTime}</p>
                    </div>

                    {/* Основная info */}
                    <div className="flex-1 min-w-0">
                      {/* Направление */}
                      {c.direction && (
                        <span
                          className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full mb-1.5"
                          style={{ background: C.petal, color: C.stone }}
                        >
                          {c.direction.name}
                        </span>
                      )}

                      {/* Название */}
                      <p className="font-syne font-bold text-[14px] leading-snug mb-1.5" style={{ color: C.bark }}>
                        {c.title}
                      </p>

                      {/* Места */}
                      <div className="flex items-center gap-1.5 mb-2">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: statusColor }} />
                        <p className="text-xs" style={{ color: status === 'full' ? C.red : C.stone }}>
                          {statusLabel}
                        </p>
                      </div>

                      {/* Тренер */}
                      {trainerName && (
                        <div className="flex items-center gap-1.5">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                            style={{ background: C.petal, color: C.terra }}
                          >
                            {trainerName[0]}
                          </div>
                          <span className="text-xs" style={{ color: C.stone }}>{trainerName}</span>
                        </div>
                      )}
                    </div>

                    {/* Кнопка */}
                    <div className="flex-shrink-0 self-center">
                      <button
                        onClick={() => {
                          if (unavailable || status === 'full') return;
                          haptic('medium');
                          bookMutation.mutate(c.id);
                        }}
                        disabled={unavailable || status === 'full' || bookMutation.isPending}
                        className="text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-all active:scale-95 disabled:opacity-50"
                        style={{
                          background: unavailable || status === 'full' ? C.petal : C.terra,
                          color:      unavailable || status === 'full' ? C.dust  : '#fff',
                          minWidth: 76,
                          textAlign: 'center',
                        }}
                      >
                        {bookMutation.isPending ? '...' :
                          isPast       ? 'Прошло'   :
                          status === 'full' ? 'Нет мест' :
                          'Записаться'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
