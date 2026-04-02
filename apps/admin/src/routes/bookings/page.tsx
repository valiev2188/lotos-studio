import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/client';
import Header from '../../components/layout/Header';

interface Booking {
  id: string;
  status: string;
  isTrial: boolean;
  createdAt: string;
  user: { firstName: string; lastName?: string; phone?: string };
  class: { title: string; startsAt: string; trainer?: { user?: { firstName: string } } };
}

const statusColors: Record<string, string> = {
  confirmed: 'bg-purple/20 text-purple-light',
  attended: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
  pending: 'bg-yellow-500/20 text-yellow-400',
};
const statusLabels: Record<string, string> = {
  confirmed: 'Подтверждена', attended: 'Посещено', cancelled: 'Отменена', pending: 'Ожидание',
};

export default function BookingsPage() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-bookings', statusFilter],
    queryFn: () =>
      apiFetch<{ data: Booking[] }>(
        `/admin/bookings${statusFilter ? `?status=${statusFilter}` : ''}`,
      ),
  });

  const attendMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/admin/bookings/${id}/attend`, { method: 'PATCH' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-bookings'] }),
  });

  const bookings = data?.data || [];

  return (
    <div>
      <Header title="Записи" />

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {['', 'confirmed', 'attended', 'cancelled'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`text-xs px-3 py-1.5 rounded-lg font-instrument font-medium transition-colors ${
              statusFilter === s
                ? 'bg-purple text-cream'
                : 'bg-dark-100 text-cream/50 hover:text-cream'
            }`}
          >
            {s === '' ? 'Все' : statusLabels[s]}
          </button>
        ))}
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-dark-50">
              <th className="text-left px-5 py-3 text-cream/40 font-instrument font-medium">Клиент</th>
              <th className="text-left px-5 py-3 text-cream/40 font-instrument font-medium">Занятие</th>
              <th className="text-left px-5 py-3 text-cream/40 font-instrument font-medium">Время</th>
              <th className="text-left px-5 py-3 text-cream/40 font-instrument font-medium">Статус</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} className="text-center py-12 text-cream/30">Загрузка...</td>
              </tr>
            )}
            {bookings.map((b) => {
              const time = new Date(b.class.startsAt).toLocaleString('ru-RU', {
                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                timeZone: 'Asia/Tashkent',
              });
              return (
                <tr key={b.id} className="border-b border-dark-50 last:border-0">
                  <td className="px-5 py-3">
                    <div className="text-cream">
                      {b.user.firstName} {b.user.lastName || ''}
                    </div>
                    {b.user.phone && <div className="text-cream/30 text-xs">{b.user.phone}</div>}
                    {b.isTrial && (
                      <span className="badge bg-brown/20 text-brown-light text-[10px] mt-0.5">Пробное</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <div className="text-cream">{b.class.title}</div>
                    {b.class.trainer?.user && (
                      <div className="text-cream/30 text-xs">{b.class.trainer.user.firstName}</div>
                    )}
                  </td>
                  <td className="px-5 py-3 text-cream/60 text-xs">{time}</td>
                  <td className="px-5 py-3">
                    <span className={`badge ${statusColors[b.status] || 'bg-cream/10 text-cream/40'}`}>
                      {statusLabels[b.status] || b.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {b.status === 'confirmed' && (
                      <button
                        onClick={() => attendMutation.mutate(b.id)}
                        disabled={attendMutation.isPending}
                        className="btn-secondary text-xs py-1"
                      >
                        Отметить посещение
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {!isLoading && bookings.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-12 text-cream/30">Записи не найдены</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
