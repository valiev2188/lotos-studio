import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../api/client';
import { haptic, hapticSuccess } from '../../utils/telegram';
import { Loader2, Check, X, ChevronLeft, ChevronRight, AlertCircle, Ticket } from 'lucide-react';

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

interface Sub {
  id: string;
  status: string;
  totalClasses: number;
  usedClasses: number;
  remainingClasses: number;
  expiresAt: string;
  plan: { name: string };
}

interface BookingItem {
  id: string;
  classId: string;
  status: string;
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

// ─── Success Alert ───────────────────────────────────────────────────────────
function SuccessAlert({ show, onClose, className }: { show: boolean; onClose: () => void; className?: string }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <div
        className={`relative bg-white rounded-3xl p-8 text-center max-w-sm w-full shadow-xl ${className ?? ''}`}
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'fadeIn 0.2s ease-out' }}
      >
        <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: '#E8F5E9' }}>
          <Check size={32} color={C.green} strokeWidth={3} />
        </div>
        <h3 className="font-syne font-bold text-xl mb-2" style={{ color: C.bark }}>Вы записаны!</h3>
        <p className="text-sm mb-6" style={{ color: C.stone }}>
          Занятие добавлено в ваши записи. Мы напомним вам за час до начала.
        </p>
        <button
          onClick={onClose}
          className="w-full py-3 rounded-full font-semibold text-sm transition-all active:scale-95"
          style={{ background: C.terra, color: '#fff' }}
        >
          Отлично!
        </button>
      </div>
    </div>
  );
}

// ─── No Subscription Alert ───────────────────────────────────────────────────
function NoSubAlert({ show, onClose, onBuy }: { show: boolean; onClose: () => void; onBuy: () => void }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <div
        className="relative bg-white rounded-3xl p-8 text-center max-w-sm w-full shadow-xl"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'fadeIn 0.2s ease-out' }}
      >
        <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: '#FFF3E0' }}>
          <Ticket size={32} color={C.amber} />
        </div>
        <h3 className="font-syne font-bold text-xl mb-2" style={{ color: C.bark }}>Нужен абонемент</h3>
        <p className="text-sm mb-6" style={{ color: C.stone }}>
          Для записи на занятие необходим активный абонемент. Приобретите абонемент или запишитесь на пробное занятие.
        </p>
        <div className="space-y-2">
          <button
            onClick={onBuy}
            className="w-full py-3 rounded-full font-semibold text-sm transition-all active:scale-95"
            style={{ background: C.terra, color: '#fff' }}
          >
            Купить абонемент
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-full font-semibold text-sm transition-all active:scale-95"
            style={{ background: C.petal, color: C.stone }}
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Error Alert ─────────────────────────────────────────────────────────────
function ErrorAlert({ show, message, onClose }: { show: boolean; message: string; onClose: () => void }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <div
        className="relative bg-white rounded-3xl p-8 text-center max-w-sm w-full shadow-xl"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'fadeIn 0.2s ease-out' }}
      >
        <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: '#FFEBEE' }}>
          <AlertCircle size={32} color={C.red} />
        </div>
        <h3 className="font-syne font-bold text-xl mb-2" style={{ color: C.bark }}>Ошибка</h3>
        <p className="text-sm mb-6" style={{ color: C.stone }}>{message}</p>
        <button
          onClick={onClose}
          className="w-full py-3 rounded-full font-semibold text-sm transition-all active:scale-95"
          style={{ background: C.petal, color: C.bark }}
        >
          Понятно
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function SchedulePage() {
  const now = new Date();
  const todayStr = toISO(now);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [viewMonth, setViewMonth] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [dir, setDir] = useState('Все');
  const [bookingClassId, setBookingClassId] = useState<string | null>(null); // which class is being booked
  const [showSuccess, setShowSuccess] = useState(false);
  const [showNoSub, setShowNoSub] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const grid = useMemo(() => getMonthGrid(viewMonth.year, viewMonth.month), [viewMonth.year, viewMonth.month]);

  // ── Data queries ───────────────────────────────────────────
  const monthStart = `${viewMonth.year}-${String(viewMonth.month + 1).padStart(2, '0')}-01`;
  const monthEnd = toISO(new Date(viewMonth.year, viewMonth.month + 1, 1));

  const { data: monthData } = useQuery({
    queryKey: ['schedule-month', monthStart],
    queryFn: () => apiFetch<{ data: ClassItem[] }>(`/schedule?dateFrom=${monthStart}&dateTo=${monthEnd}`),
    staleTime: 120_000,
  });

  const daysWithClasses = useMemo(() => {
    const set = new Set<string>();
    (monthData?.data ?? []).forEach(c => set.add(c.startsAt.slice(0, 10)));
    return set;
  }, [monthData]);

  const nextDay = toISO(new Date(new Date(selectedDate).getTime() + 86400000));
  const { data: dayData, isLoading } = useQuery({
    queryKey: ['schedule-day', selectedDate],
    queryFn: () => apiFetch<{ data: ClassItem[] }>(`/schedule?dateFrom=${selectedDate}&dateTo=${nextDay}`),
    staleTime: 60_000,
  });

  // Активный абонемент
  const { data: subsData } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => apiFetch<{ data: Sub[] }>('/subscriptions'),
    staleTime: 120_000,
  });

  const activeSub = useMemo(() => {
    const subs = subsData?.data ?? [];
    return subs.find(s => s.status === 'active' && new Date(s.expiresAt) > new Date() && s.remainingClasses > 0) ?? null;
  }, [subsData]);

  // Мои существующие записи (чтобы показать "Вы записаны")
  const { data: myBookingsData } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => apiFetch<{ data: BookingItem[] }>('/bookings'),
    staleTime: 60_000,
  });

  const bookedClassIds = useMemo(() => {
    const set = new Set<string>();
    (myBookingsData?.data ?? []).forEach(b => {
      if (b.status !== 'cancelled') set.add(b.classId);
    });
    return set;
  }, [myBookingsData]);

  // ── Book mutation ──────────────────────────────────────────
  const bookMutation = useMutation({
    mutationFn: ({ classId, subscriptionId, isTrial }: { classId: string; subscriptionId?: string; isTrial?: boolean }) =>
      apiFetch('/bookings', {
        method: 'POST',
        body: JSON.stringify({ classId, subscriptionId, isTrial: isTrial ?? false }),
      }),
    onSuccess: () => {
      hapticSuccess();
      setBookingClassId(null);
      setShowSuccess(true);
      qc.invalidateQueries({ queryKey: ['schedule-day'] });
      qc.invalidateQueries({ queryKey: ['schedule-month'] });
      qc.invalidateQueries({ queryKey: ['bookings'] });
      qc.invalidateQueries({ queryKey: ['subscriptions'] });
    },
    onError: (err: Error) => {
      setBookingClassId(null);
      const msg = err.message || 'Не удалось записаться';
      if (msg.includes('Already booked')) {
        setErrorMsg('Вы уже записаны на это занятие');
      } else if (msg.includes('No available spots')) {
        setErrorMsg('Все места заняты');
      } else if (msg.includes('Invalid or exhausted subscription')) {
        setErrorMsg('Абонемент закончился. Необходимо приобрести новый.');
      } else {
        setErrorMsg(msg);
      }
    },
  });

  const handleBook = useCallback((classId: string) => {
    haptic('medium');

    // Проверяем есть ли абонемент
    if (!activeSub) {
      setShowNoSub(true);
      return;
    }

    setBookingClassId(classId);
    bookMutation.mutate({ classId, subscriptionId: activeSub.id });
  }, [activeSub, bookMutation]);

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

      {/* ── Alerts ─────────────────────────────────────────── */}
      <SuccessAlert show={showSuccess} onClose={() => setShowSuccess(false)} />
      <NoSubAlert show={showNoSub} onClose={() => setShowNoSub(false)} onBuy={() => { setShowNoSub(false); navigate('/profile'); }} />
      <ErrorAlert show={!!errorMsg} message={errorMsg} onClose={() => setErrorMsg('')} />

      {/* ── Абонемент баннер ───────────────────────────────── */}
      {activeSub && (
        <div className="mx-4 mt-2 mb-0 px-4 py-2.5 rounded-2xl flex items-center justify-between"
             style={{ background: C.purpleLight, border: `1px solid ${C.purple}20` }}>
          <div className="flex items-center gap-2">
            <Ticket size={16} color={C.purple} />
            <span className="text-xs font-medium" style={{ color: C.purple }}>
              {activeSub.plan.name}
            </span>
          </div>
          <span className="text-xs font-bold" style={{ color: C.purple }}>
            {activeSub.remainingClasses} из {activeSub.totalClasses} занятий
          </span>
        </div>
      )}

      {!activeSub && (
        <button
          onClick={() => navigate('/profile')}
          className="mx-4 mt-2 mb-0 px-4 py-2.5 rounded-2xl flex items-center justify-between w-[calc(100%-2rem)] active:scale-[0.98] transition-all"
          style={{ background: '#FFF3E0', border: `1px solid ${C.amber}30` }}
        >
          <div className="flex items-center gap-2">
            <AlertCircle size={16} color={C.amber} />
            <span className="text-xs font-medium" style={{ color: '#E65100' }}>
              Нет активного абонемента
            </span>
          </div>
          <span className="text-xs font-semibold" style={{ color: C.terra }}>
            Купить →
          </span>
        </button>
      )}

      {/* ── Sticky header: Календарь + фильтры ─────────────── */}
      <div className="sticky top-0 z-10 mt-2" style={{ background: C.white }}>

        {/* Месяц навигация */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <button onClick={prevMonth} className="w-9 h-9 flex items-center justify-center rounded-full active:scale-95" style={{ background: C.petal }}>
            <ChevronLeft size={18} color={C.terra} />
          </button>
          <p className="font-syne font-bold text-base" style={{ color: C.bark }}>
            {MONTH_RU[viewMonth.month]} {viewMonth.year}
          </p>
          <button onClick={nextMonth} className="w-9 h-9 flex items-center justify-center rounded-full active:scale-95" style={{ background: C.petal }}>
            <ChevronRight size={18} color={C.terra} />
          </button>
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

      {/* ── Список занятий ─────────────────────────────────── */}
      <div className="px-4 py-3 space-y-3">

        {isLoading && (
          <div className="flex flex-col items-center py-12">
            <Loader2 size={32} color={C.terra} className="animate-spin mb-3" />
            <p className="text-sm" style={{ color: C.dust }}>Загружаем...</p>
          </div>
        )}

        {!isLoading && classes.length === 0 && (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: C.petal }}>
              <X size={20} color={C.dust} />
            </div>
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
          const few = !full && available <= 3;
          const past = new Date(c.startsAt) < new Date();
          const alreadyBooked = bookedClassIds.has(c.id);
          const isBookingThis = bookingClassId === c.id && bookMutation.isPending;
          const canBook = c.status === 'scheduled' && !past && !full && !alreadyBooked;
          const statusColor = full ? C.red : few ? C.amber : C.green;
          const trainerName = c.trainer?.user ? `${c.trainer.user.firstName}${c.trainer.user.lastName ? ' ' + c.trainer.user.lastName : ''}` : null;

          // Определяем текст и стиль кнопки
          let btnText = 'Записаться';
          let btnBg = C.terra;
          let btnColor = '#fff';
          let btnDisabled = false;

          if (isBookingThis) {
            btnText = '';
            btnBg = C.terra;
          } else if (alreadyBooked) {
            btnText = 'Записаны';
            btnBg = '#E8F5E9';
            btnColor = C.green;
            btnDisabled = true;
          } else if (past) {
            btnText = 'Прошло';
            btnBg = C.petal;
            btnColor = C.dust;
            btnDisabled = true;
          } else if (full) {
            btnText = 'Нет мест';
            btnBg = C.petal;
            btnColor = C.dust;
            btnDisabled = true;
          } else if (!activeSub) {
            btnText = 'Записаться';
            btnBg = C.terra;
          }

          return (
            <div key={c.id} className="rounded-2xl overflow-hidden" style={{ background: C.white, boxShadow: '0 2px 12px rgba(28,24,16,0.06)' }}>
              <div className="flex">
                <div className="w-[3px] flex-shrink-0" style={{ background: alreadyBooked ? C.green : statusColor }} />
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
                        <div className="w-2 h-2 rounded-full" style={{ background: alreadyBooked ? C.green : statusColor }} />
                        <p className="text-xs" style={{ color: alreadyBooked ? C.green : full ? C.red : C.stone }}>
                          {alreadyBooked
                            ? `Вы записаны (${booked}/${c.maxSpots})`
                            : full ? 'Нет свободных мест'
                            : few ? `Осталось ${available} мест`
                            : `Есть места (${available} из ${c.maxSpots})`
                          }
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
                      onClick={() => canBook ? handleBook(c.id) : undefined}
                      disabled={btnDisabled || isBookingThis}
                      className="flex-shrink-0 self-center text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-all active:scale-95 disabled:active:scale-100"
                      style={{
                        background: btnBg,
                        color: btnColor,
                        minWidth: 86,
                        textAlign: 'center',
                        opacity: btnDisabled ? 0.7 : 1,
                      }}
                    >
                      {isBookingThis ? (
                        <Loader2 size={16} className="animate-spin mx-auto" color="#fff" />
                      ) : (
                        <>
                          {alreadyBooked && <Check size={12} className="inline mr-1" style={{ marginTop: -1 }} />}
                          {btnText}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Animation keyframes */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
