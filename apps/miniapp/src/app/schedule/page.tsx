import { useState, useMemo } from 'react';
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
  trainer?: { user?: { firstName: string; lastName?: string } };
  _count?: { bookings: number };
}

const C = {
  bg: '#FAF5EF', white: '#FFFFFF', bark: '#1C1810',
  stone: '#8B7355', dust: '#B8A898', terra: '#774936',
  border: '#EDE4D8', petal: '#F2E9DF',
  green: '#4CAF50', amber: '#F59E0B', red: '#EF4444',
  purple: '#662E9B', purpleLight: '#f3ecfb',
};

const MONTH_RU = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
const DOW = ['пн','вт','ср','чт','пт','сб','вс'];
const DIRS = ['Все','Йога','Пилатес','Стретчинг','Фитнес','Медитация','Барре'];

function toISO(d: Date) { return d.toISOString().slice(0, 10); }

function toTime(iso: string) {
  return new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tashkent' });
}

function toEndTime(iso: string, dur: number) {
  const d = new Date(iso); d.setMinutes(d.getMinutes() + dur);
  return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tashkent' });
}

/** Генерирует сетку месяца (6 недель = 42 ячейки) */
function getMonthGrid(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  // Понедельник = 0 в нашей сетке
  let startDay = first.getDay() - 1;
  if (startDay < 0) startDay = 6; // воскресенье → 6

  const grid: Date[] = [];
  const start = new Date(first);
  start.setDate(1 - startDay);

  for (let i = 0; i < 42; i++) {
    grid.push(new Date(start));
    start.setDate(start.getDate() + 1);
  }
  return grid;
}

export default function SchedulePage() {
  const now = new Date();
  const todayStr = toISO(now);

  const [viewMonth, setViewMonth] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [dir, setDir] = useState('Все');
  const qc = useQueryClient();

  const grid = useMemo(() => getMonthGrid(viewMonth.year, viewMonth.month), [viewMonth.year, viewMonth.month]);

  // Загружаем весь месяц для точек
  const monthStart = `${viewMonth.year}-${String(viewMonth.month + 1).padStart(2, '0')}-01`;
  const monthEndDate = new Date(viewMonth.year, viewMonth.month + 1, 1);
  const monthEnd = toISO(monthEndDate);

  const { data: monthData } = useQuery({
    queryKey: ['schedule-month', monthStart],
    queryFn: () => apiFetch<{ data: ClassItem[] }>(`/schedule?dateFrom=${monthStart}&dateTo=${monthEnd}`),
    staleTime: 120_000,
  });

  // Дни с занятиями (для точек)
  const daysWithClasses = useMemo(() => {
    const set = new Set<string>();
    (monthData?.data ?? []).forEach(c => set.add(c.startsAt.slice(0, 10)));
    return set;
  }, [monthData]);

  // Загружаем занятия на выбранный день
  const nextDay = toISO(new Date(new Date(selectedDate).getTime() + 86400000));
  const { data: dayData, isLoading } = useQuery({
    queryKey: ['schedule-day', selectedDate],
    queryFn: () => apiFetch<{ data: ClassItem[] }>(`/schedule?dateFrom=${selectedDate}&dateTo=${nextDay}`),
    staleTime: 60_000,
  });

  const bookMutation = useMutation({
    mutationFn: (classId: string) =>
      apiFetch('/bookings', { method: 'POST', body: JSON.stringify({ classId }) }),
    onSuccess: () => {
      hapticSuccess();
      qc.invalidateQueries({ queryKey: ['schedule-day'] });
      qc.invalidateQueries({ queryKey: ['schedule-month'] });
      qc.invalidateQueries({ queryKey: ['bookings'] });
    },
  });

  const classes = (dayData?.data ?? []).filter(c => dir === 'Все' || c.direction?.name === dir);

  function prevMonth() {
    haptic();
    setViewMonth(v => v.month === 0 ? { year: v.year - 1, month: 11 } : { ...v, month: v.month - 1 });
  }
  function nextMonth() {
    haptic();
    setViewMonth(v => v.month === 11 ? { year: v.year + 1, month: 0 } : { ...v, month: v.month + 1 });
  }

  return (
    <div className="min-h-screen pb-28 font-instrument" style={{ background: C.bg }}>

      {/* ── Sticky header: Календарь + фильтры ───────────────────────────── */}
      <div className="sticky top-0 z-10" style={{ background: C.white }}>

        {/* Месяц навигация */}
        <div className="flex items-center justify-between px-5 pt-10 pb-2">
          <button onClick={prevMonth} className="w-9 h-9 flex items-center justify-center rounded-full text-lg font-bold active:scale-95" style={{ background: C.petal, color: C.terra }}>‹</button>
          <p className="font-syne font-bold text-base" style={{ color: C.bark }}>
            {MONTH_RU[viewMonth.month]} {viewMonth.year}
          </p>
          <button onClick={nextMonth} className="w-9 h-9 flex items-center justify-center rounded-full text-lg font-bold active:scale-95" style={{ background: C.petal, color: C.terra }}>›</button>
        </div>

        {/* Дни недели */}
        <div className="grid grid-cols-7 px-3 pb-1">
          {DOW.map(d => (
            <div key={d} className="text-center text-[10px] uppercase font-medium" style={{ color: C.dust }}>{d}</div>
          ))}
        </div>

        {/* Сетка чисел */}
        <div className="grid grid-cols-7 px-3 pb-2 gap-y-0.5">
          {grid.map((day, i) => {
            const iso = toISO(day);
            const isCurrentMonth = day.getMonth() === viewMonth.month;
            const isSelected = iso === selectedDate;
            const isToday = iso === todayStr;
            const hasClasses = daysWithClasses.has(iso);

            return (
              <button
                key={i}
                onClick={() => { haptic(); setSelectedDate(iso); }}
                className="flex flex-col items-center justify-center py-1.5 rounded-xl transition-all active:scale-95"
                style={{
                  background: isSelected ? C.terra : isToday ? C.petal : 'transparent',
                  opacity: isCurrentMonth ? 1 : 0.25,
                }}
              >
                <span className="text-sm font-semibold leading-tight" style={{
                  color: isSelected ? '#fff' : isToday ? C.terra : C.bark,
                }}>
                  {day.getDate()}
                </span>
                {/* Точка — есть занятия */}
                {hasClasses && isCurrentMonth && (
                  <div className="w-1 h-1 rounded-full mt-0.5" style={{
                    background: isSelected ? 'rgba(255,255,255,0.7)' : C.purple,
                  }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Фильтр направлений */}
        <div className="flex gap-2 overflow-x-auto px-4 pb-3" style={{ borderBottom: `1px solid ${C.border}` }}>
          {DIRS.map(d => (
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
      </div>

      {/* ── Список занятий на выбранную дату ─────────────────────────────── */}
      <div className="px-4 py-3 space-y-3">

        {isLoading && (
          <div className="text-center py-12">
            <div className="text-3xl mb-2 animate-pulse">🌿</div>
            <p className="text-sm" style={{ color: C.dust }}>Загружаем...</p>
          </div>
        )}

        {!isLoading && classes.length === 0 && (
          <div className="text-center py-12">
            <div className="text-3xl mb-2">🌿</div>
            <p className="font-semibold text-sm mb-1" style={{ color: C.bark }}>Нет занятий</p>
            <p className="text-xs" style={{ color: C.dust }}>
              {dir !== 'Все' ? `По направлению «${dir}» занятий нет` : 'На эту дату занятий нет'}
            </p>
          </div>
        )}

        {classes.map(c => {
          const start = toTime(c.startsAt);
          const end = toEndTime(c.startsAt, c.durationMin);
          const booked = c._count?.bookings ?? 0;
          const available = c.maxSpots - booked;
          const full = available <= 0;
          const few = !full && (available <= 3);
          const past = new Date(c.startsAt) < new Date();
          const disabled = c.status !== 'scheduled' || past || full;
          const statusColor = full ? C.red : few ? C.amber : C.green;
          const trainerName = c.trainer?.user ? `${c.trainer.user.firstName}${c.trainer.user.lastName ? ' ' + c.trainer.user.lastName : ''}` : null;

          return (
            <div key={c.id} className="rounded-2xl overflow-hidden" style={{ background: C.white, boxShadow: '0 2px 12px rgba(28,24,16,0.06)' }}>
              <div className="flex">
                <div className="w-[3px] flex-shrink-0" style={{ background: statusColor }} />
                <div className="flex-1 p-4">
                  <div className="flex items-start gap-3">
                    {/* Время */}
                    <div className="flex-shrink-0 text-right" style={{ minWidth: 42 }}>
                      <p className="font-syne font-bold text-sm" style={{ color: C.bark }}>{start}</p>
                      <p className="text-[11px] mt-0.5" style={{ color: C.dust }}>{end}</p>
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      {c.direction && (
                        <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full mb-1.5" style={{ background: C.petal, color: C.stone }}>
                          {c.direction.name}
                        </span>
                      )}
                      <p className="font-syne font-bold text-[14px] leading-snug mb-1.5" style={{ color: C.bark }}>{c.title}</p>
                      <div className="flex items-center gap-1.5 mb-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: statusColor }} />
                        <p className="text-xs" style={{ color: full ? C.red : C.stone }}>
                          {full ? 'Нет свободных мест' : few ? `Осталось ${available} мест` : `Есть места (${available} из ${c.maxSpots})`}
                        </p>
                      </div>
                      {trainerName && (
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: C.petal, color: C.terra }}>
                            {trainerName[0]}
                          </div>
                          <span className="text-xs" style={{ color: C.stone }}>{trainerName}</span>
                        </div>
                      )}
                    </div>
                    {/* Кнопка */}
                    <button
                      onClick={() => { if (!disabled) { haptic('medium'); bookMutation.mutate(c.id); } }}
                      disabled={disabled || bookMutation.isPending}
                      className="flex-shrink-0 self-center text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-all active:scale-95 disabled:opacity-50"
                      style={{
                        background: disabled ? C.petal : C.terra,
                        color: disabled ? C.dust : '#fff',
                        minWidth: 76, textAlign: 'center',
                      }}
                    >
                      {bookMutation.isPending ? '...' : past ? 'Прошло' : full ? 'Нет мест' : 'Записаться'}
                    </button>
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
