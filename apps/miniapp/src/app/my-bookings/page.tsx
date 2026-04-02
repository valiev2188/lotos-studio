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

export default function MyBookingsPage() {
  const [tab, setTab] = useState<'upcoming' | 'history'>('upcoming');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['bookings', tab],
    queryFn: () => apiFetch<{ data: Booking[] }>('/bookings'),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/bookings/${id}/cancel`, { method: 'PATCH' }),
    onSuccess: () => { hapticSuccess(); qc.invalidateQueries({ queryKey: ['bookings'] }); },
  });

  const now = new Date();
  const all = data?.data || [];
  const upcoming = all.filter((b) => b.status !== 'cancelled' && b.status !== 'attended' && new Date(b.class.startsAt) > now);
  const history = all.filter((b) => b.status === 'attended' || b.status === 'cancelled' || new Date(b.class.startsAt) <= now);
  const shown = tab === 'upcoming' ? upcoming : history;

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-dark px-4 pt-8 pb-4">
        <h1 className="font-syne text-2xl font-bold text-cream mb-4">Мои записи</h1>
        <div className="flex bg-cream/10 rounded-xl p-1 gap-1">
          {(['upcoming', 'history'] as const).map((t) => (
            <button
              key={t}
              onClick={() => { haptic(); setTab(t); }}
              className={`flex-1 py-2 rounded-lg text-sm font-instrument font-semibold transition-colors ${
                tab === t ? 'bg-brown text-cream' : 'text-cream/50'
              }`}
            >
              {t === 'upcoming' ? 'Предстоящие' : 'История'}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        {isLoading && <div className="text-center py-12 text-dark/40">Загрузка...</div>}
        {!isLoading && shown.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">{tab === 'upcoming' ? '📅' : '🌿'}</div>
            <div className="text-dark/50 font-instrument">
              {tab === 'upcoming' ? 'Нет предстоящих записей' : 'История пуста'}
            </div>
          </div>
        )}
        {shown.map((b) => {
          const time = new Date(b.class.startsAt).toLocaleString('ru-RU', {
            weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
            timeZone: 'Asia/Tashkent',
          });
          const canCancel = b.status === 'confirmed' && new Date(b.class.startsAt) > now;
          const statusColors: Record<string, string> = {
            confirmed: 'bg-purple/20 text-purple-light',
            attended: 'bg-green-500/20 text-green-400',
            cancelled: 'bg-red-500/20 text-red-400',
          };

          return (
            <div key={b.id} className="bg-dark rounded-2xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="text-cream font-instrument font-semibold">{b.class.title}</div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusColors[b.status] || 'bg-cream/10 text-cream/40'}`}>
                  {{confirmed: 'Подтверждена', attended: 'Посещено', cancelled: 'Отменена', pending: 'Ожидание'}[b.status] || b.status}
                </span>
              </div>
              <div className="text-cream/50 text-xs">{time}</div>
              {b.class.trainer?.user && (
                <div className="text-cream/40 text-xs mt-0.5">{b.class.trainer.user.firstName}</div>
              )}
              {b.isTrial && (
                <div className="mt-2 text-[10px] bg-brown/20 text-brown-light px-2 py-0.5 rounded-full inline-block">
                  Пробное занятие
                </div>
              )}
              {canCancel && (
                <button
                  onClick={() => { haptic('medium'); cancelMutation.mutate(b.id); }}
                  disabled={cancelMutation.isPending}
                  className="mt-3 text-red-400 text-xs font-instrument font-medium"
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
