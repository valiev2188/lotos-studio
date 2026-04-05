import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/client';
import Header from '../../components/layout/Header';

interface ClassItem {
  id: string;
  title: string;
  startsAt: string;
  durationMin: number;
  maxSpots: number;
  level: string;
  status: string;
  direction?: { name: string; color?: string };
  trainer?: { user?: { firstName: string; lastName?: string } };
  _count?: { bookings: number };
}

const MONTH_RU = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
const DOW = ['пн','вт','ср','чт','пт','сб','вс'];
const statusLabels: Record<string, string> = { scheduled: 'Запланировано', cancelled: 'Отменено', done: 'Завершено' };

function toISO(d: Date) { return d.toISOString().slice(0, 10); }

function getMonthGrid(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  let startDay = first.getDay() - 1;
  if (startDay < 0) startDay = 6;
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
  const qc = useQueryClient();

  const [viewMonth, setViewMonth] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', startsAt: '', durationMin: 60, maxSpots: 12, level: 'all' });

  const grid = useMemo(() => getMonthGrid(viewMonth.year, viewMonth.month), [viewMonth.year, viewMonth.month]);

  // Весь месяц
  const monthStart = `${viewMonth.year}-${String(viewMonth.month + 1).padStart(2, '0')}-01`;
  const monthEnd = toISO(new Date(viewMonth.year, viewMonth.month + 1, 1));

  const { data: monthData } = useQuery({
    queryKey: ['admin-schedule-month', monthStart],
    queryFn: () => apiFetch<{ data: ClassItem[] }>(`/schedule?dateFrom=${monthStart}&dateTo=${monthEnd}`),
    staleTime: 60_000,
  });

  // Группируем по дням
  const classesByDay = useMemo(() => {
    const map: Record<string, ClassItem[]> = {};
    (monthData?.data ?? []).forEach(c => {
      const day = c.startsAt.slice(0, 10);
      if (!map[day]) map[day] = [];
      map[day].push(c);
    });
    return map;
  }, [monthData]);

  // Занятия на выбранный день
  const dayClasses = classesByDay[selectedDate] ?? [];

  const createMutation = useMutation({
    mutationFn: (body: typeof form) =>
      apiFetch('/admin/classes', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-schedule-month'] });
      setShowForm(false);
      setForm({ title: '', startsAt: '', durationMin: 60, maxSpots: 12, level: 'all' });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/admin/classes/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-schedule-month'] }),
  });

  function prevMonth() {
    setViewMonth(v => v.month === 0 ? { year: v.year - 1, month: 11 } : { ...v, month: v.month - 1 });
  }
  function nextMonth() {
    setViewMonth(v => v.month === 11 ? { year: v.year + 1, month: 0 } : { ...v, month: v.month + 1 });
  }

  return (
    <div>
      <Header
        title="Расписание"
        actions={
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            + Добавить занятие
          </button>
        }
      />

      {/* Форма создания */}
      {showForm && (
        <div className="card mb-6">
          <div className="font-syne font-bold text-cream mb-4">Новое занятие</div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-cream/50 text-xs mb-1 block">Название</label>
              <input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Йога для начинающих" />
            </div>
            <div>
              <label className="text-cream/50 text-xs mb-1 block">Начало</label>
              <input type="datetime-local" className="input" value={form.startsAt} onChange={e => setForm({ ...form, startsAt: e.target.value })} />
            </div>
            <div>
              <label className="text-cream/50 text-xs mb-1 block">Длительность (мин)</label>
              <input type="number" className="input" value={form.durationMin} onChange={e => setForm({ ...form, durationMin: +e.target.value })} />
            </div>
            <div>
              <label className="text-cream/50 text-xs mb-1 block">Макс. мест</label>
              <input type="number" className="input" value={form.maxSpots} onChange={e => setForm({ ...form, maxSpots: +e.target.value })} />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending} className="btn-primary">
              {createMutation.isPending ? 'Создание...' : 'Создать'}
            </button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Отмена</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Календарь ──────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 card">
          {/* Навигация месяца */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-lg text-cream/40 hover:text-cream hover:bg-dark-50 transition-all">‹</button>
            <p className="font-syne font-bold text-cream">{MONTH_RU[viewMonth.month]} {viewMonth.year}</p>
            <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg text-cream/40 hover:text-cream hover:bg-dark-50 transition-all">›</button>
          </div>

          {/* Дни недели */}
          <div className="grid grid-cols-7 mb-1">
            {DOW.map(d => (
              <div key={d} className="text-center text-[11px] text-cream/30 uppercase font-medium py-1">{d}</div>
            ))}
          </div>

          {/* Сетка */}
          <div className="grid grid-cols-7 gap-1">
            {grid.map((day, i) => {
              const iso = toISO(day);
              const isCurrent = day.getMonth() === viewMonth.month;
              const isSelected = iso === selectedDate;
              const isToday = iso === todayStr;
              const count = (classesByDay[iso] ?? []).length;

              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(iso)}
                  className={`relative flex flex-col items-center py-2 rounded-lg transition-all ${
                    isSelected ? 'bg-purple ring-1 ring-purple' : isToday ? 'bg-dark-50' : 'hover:bg-dark-50'
                  }`}
                  style={{ opacity: isCurrent ? 1 : 0.2 }}
                >
                  <span className={`text-sm font-medium ${isSelected ? 'text-white' : isToday ? 'text-purple-light' : 'text-cream/70'}`}>
                    {day.getDate()}
                  </span>
                  {count > 0 && isCurrent && (
                    <div className="flex gap-0.5 mt-0.5">
                      {count <= 3 ? Array.from({ length: count }).map((_, j) => (
                        <div key={j} className="w-1 h-1 rounded-full" style={{ background: isSelected ? 'rgba(255,255,255,0.7)' : '#662E9B' }} />
                      )) : (
                        <span className="text-[9px] font-bold" style={{ color: isSelected ? 'rgba(255,255,255,0.8)' : '#662E9B' }}>{count}</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Занятия на выбранный день ──────────────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="card">
            <p className="font-syne font-bold text-cream text-sm mb-4">
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', weekday: 'long' })}
            </p>

            {dayClasses.length === 0 && (
              <p className="text-cream/30 text-sm text-center py-8">Нет занятий</p>
            )}

            <div className="space-y-3">
              {dayClasses.map(c => {
                const dt = new Date(c.startsAt);
                const time = dt.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tashkent' });
                const booked = c._count?.bookings ?? 0;
                const available = c.maxSpots - booked;
                const full = available <= 0;

                return (
                  <div key={c.id} className="p-3 rounded-xl bg-dark-50 border border-dark-100/50">
                    <div className="flex items-start justify-between mb-1">
                      <span className="text-cream font-semibold text-sm">{c.title}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        c.status === 'scheduled' ? 'bg-purple/20 text-purple-light' :
                        c.status === 'cancelled' ? 'bg-red-500/20 text-red-400' : 'bg-cream/10 text-cream/40'
                      }`}>
                        {statusLabels[c.status] ?? c.status}
                      </span>
                    </div>

                    <div className="text-cream/40 text-xs mb-1">
                      {time} · {c.durationMin} мин
                      {c.direction && <span> · {c.direction.name}</span>}
                    </div>

                    {c.trainer?.user && (
                      <div className="text-cream/30 text-xs mb-2">
                        {c.trainer.user.firstName} {c.trainer.user.lastName ?? ''}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ background: full ? '#EF4444' : available <= 3 ? '#F59E0B' : '#4CAF50' }} />
                        <span className="text-xs text-cream/50">
                          {booked}/{c.maxSpots} мест занято
                        </span>
                      </div>

                      {c.status === 'scheduled' && (
                        <button
                          onClick={() => cancelMutation.mutate(c.id)}
                          disabled={cancelMutation.isPending}
                          className="text-[11px] text-red-400 hover:text-red-300 transition-colors"
                        >
                          Отменить
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
