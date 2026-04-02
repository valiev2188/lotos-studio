import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/client';
import { haptic, hapticSuccess } from '../../utils/telegram';

interface Booking {
  id: string;
  status: string;
  isTrial: boolean;
  class: {
    title: string;
    startsAt: string;
    durationMin: number;
    trainer?: { user?: { firstName: string } };
    direction?: { name: string };
  };
}

const C = {
  bg: '#FAF5EF', white: '#FFFFFF', bark: '#1C1810',
  stone: '#8B7355', dust: '#B8A898', terra: '#774936', border: '#EDE4D8',
};

const statusLabel: Record<string, string> = {
  confirmed: 'Подтверждена', attended: 'Посещено',
  cancelled: 'Отменена', pending: 'Ожидание',
};
const statusStyle: Record<string, { bg: string; color: string }> = {
  confirmed: { bg: '#F2E9DF', color: '#774936' },
  attended:  { bg: '#EDF4EA', color: '#5E7A4E' },
  cancelled: { bg: '#FBF0EE', color: '#A05040' },
  pending:   { bg: '#FAF5EF', color: '#8B7355' },
};

export default function MyBookingsPage() {
  const [tab, setTab] = useState<'upcoming' | 'history'>('upcoming');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => apiFetch<{ data: Booking[] }>('/bookings'),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/bookings/${id}/cancel`, { method: 'PATCH' }),
    onSuccess: () => { hapticSuccess(); qc.invalidateQueries({ queryKey: ['bookings'] }); },
  });

  const now = new Date();
  const all = data?.data || [];
  const upcoming = all.filter(
    (b) => b.status !== 'cancelled' && b.status !== 'attended' && new Date(b.class.startsAt) > now,
  );
  const history = all.filter(
    (b) => b.status === 'attended' || b.status === 'cancelled' || new Date(b.class.startsAt) <= now,
  );
  const shown = tab === 'upcoming' ? upcoming : history;

  return (
    <div className="min-h-screen pb-28 font-instrument" style={{ background: C.bg }}>
      {/* Header */}
      <div className="px-5 pt-10 pb-4" style={{ background: C.white, boxShadow: '0 1px 0 #EDE4D8' }}>
        <h1 className="font-syne font-bold text-2xl mb-4" style={{ color: C.bark }}>Мои записи</h1>

        {/* Tabs */}
        <div className="flex gap-2 p-1 rounded-2xl" style={{ background: '#F2E9DF' }}>
          {(['upcoming', 'history'] as const).map((t) => (
            <button
              key={t}
              onClick={() => { haptic(); setTab(t); }}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: tab === t ? '#fff' : 'transparent',
                color: tab === t ? C.terra : C.stone,
                boxShadow: tab === t ? '0 1px 4px rgba(28,24,16,0.08)' : 'none',
              }}
            >
              {t === 'upcoming' ? 'Предстоящие' : 'История'}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 py-4 space-y-3">
        {isLoading && (
          <div className="text-center py-12" style={{ color: C.dust }}>Загрузка...</div>
        )}
        {!isLoading && shown.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">{tab === 'upcoming' ? '🌸' : '🌿'}</div>
            <p className="text-sm" style={{ color: C.dust }}>
              {tab === 'upcoming' ? 'Нет предстоящих записей' : 'История пуста'}
            </p>
          </div>
        )}
        {shown.map((b) => {
          const time = new Date(b.class.startsAt).toLocaleString('ru-RU', {
            weekday: 'short', day: 'numeric', month: 'short',
            hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tashkent',
          });
          const canCancel = b.status === 'confirmed' && new Date(b.class.startsAt) > now;
          const st = statusStyle[b.status] || { bg: '#F2E9DF', color: C.stone };

          return (
            <div key={b.id} className="rounded-2xl p-4"
                 style={{ background: C.white, boxShadow: '0 2px 12px rgba(28,24,16,0.06)' }}>
              <div className="flex items-start justify-between mb-2">
                <p className="font-semibold text-sm" style={{ color: C.bark }}>{b.class.title}</p>
                <span className="text-[10px] font-medium px-2.5 py-1 rounded-full ml-2 flex-shrink-0"
                      style={{ background: st.bg, color: st.color }}>
                  {statusLabel[b.status] || b.status}
                </span>
              </div>
              <p className="text-xs" style={{ color: C.stone }}>{time}</p>
              {b.class.trainer?.user && (
                <p className="text-xs mt-0.5" style={{ color: C.dust }}>
                  {b.class.trainer.user.firstName}
                </p>
              )}
              {b.isTrial && (
                <span className="inline-block mt-2 text-[10px] font-medium px-3 py-1 rounded-full"
                      style={{ background: '#F2E9DF', color: C.terra }}>
                  Пробное занятие
                </span>
              )}
              {canCancel && (
                <button
                  onClick={() => { haptic('medium'); cancelMutation.mutate(b.id); }}
                  disabled={cancelMutation.isPending}
                  className="mt-3 text-xs font-medium"
                  style={{ color: '#A05040' }}
                >
                  {cancelMutation.isPending ? 'Отмена...' : 'Отменить запись'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
