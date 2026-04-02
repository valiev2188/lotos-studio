import { useState } from 'react';
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
  direction?: { name: string; color: string };
  trainer?: { user?: { firstName: string; lastName?: string } };
  _count?: { bookings: number };
}

const statusColors: Record<string, string> = {
  scheduled: 'bg-purple/20 text-purple-light',
  active: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
  completed: 'bg-cream/10 text-cream/40',
};
const statusLabels: Record<string, string> = {
  scheduled: 'Запланировано',
  active: 'Идёт',
  cancelled: 'Отменено',
  completed: 'Завершено',
};

export default function SchedulePage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    startsAt: '',
    durationMin: 60,
    maxSpots: 12,
    level: 'beginner',
  });

  const today = new Date().toISOString().slice(0, 10);
  const weekLater = new Date(Date.now() + 7 * 86400_000).toISOString().slice(0, 10);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-schedule'],
    queryFn: () => apiFetch<{ data: ClassItem[] }>(`/schedule?dateFrom=${today}&dateTo=${weekLater}`),
  });

  const createMutation = useMutation({
    mutationFn: (body: typeof form) =>
      apiFetch('/admin/classes', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-schedule'] }); setShowForm(false); },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/admin/classes/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-schedule'] }),
  });

  const classes = data?.data || [];

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

      {/* Create form */}
      {showForm && (
        <div className="card mb-6">
          <div className="font-syne font-bold text-cream mb-4">Новое занятие</div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-cream/50 text-xs mb-1 block">Название</label>
              <input
                className="input"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Йога для начинающих"
              />
            </div>
            <div>
              <label className="text-cream/50 text-xs mb-1 block">Начало</label>
              <input
                type="datetime-local"
                className="input"
                value={form.startsAt}
                onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
              />
            </div>
            <div>
              <label className="text-cream/50 text-xs mb-1 block">Длительность (мин)</label>
              <input
                type="number"
                className="input"
                value={form.durationMin}
                onChange={(e) => setForm({ ...form, durationMin: +e.target.value })}
              />
            </div>
            <div>
              <label className="text-cream/50 text-xs mb-1 block">Макс. мест</label>
              <input
                type="number"
                className="input"
                value={form.maxSpots}
                onChange={(e) => setForm({ ...form, maxSpots: +e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => createMutation.mutate(form)}
              disabled={createMutation.isPending}
              className="btn-primary"
            >
              {createMutation.isPending ? 'Создание...' : 'Создать'}
            </button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Отмена</button>
          </div>
        </div>
      )}

      {/* Classes list */}
      {isLoading && <div className="text-cream/40 text-center py-12">Загрузка...</div>}
      <div className="space-y-2">
        {classes.map((c) => {
          const dt = new Date(c.startsAt);
          const time = dt.toLocaleString('ru-RU', {
            weekday: 'short', day: 'numeric', month: 'short',
            hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tashkent',
          });
          const booked = c._count?.bookings || 0;

          return (
            <div key={c.id} className="card flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-cream font-instrument font-semibold">{c.title}</span>
                  <span className={`badge ${statusColors[c.status] || 'bg-cream/10 text-cream/40'}`}>
                    {statusLabels[c.status] || c.status}
                  </span>
                  {c.direction && (
                    <span className="badge bg-dark-50 text-cream/50">{c.direction.name}</span>
                  )}
                </div>
                <div className="text-cream/40 text-xs">{time} · {c.durationMin} мин</div>
                {c.trainer?.user && (
                  <div className="text-cream/30 text-xs mt-0.5">
                    {c.trainer.user.firstName} {c.trainer.user.lastName}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="font-syne font-bold text-cream">{booked}/{c.maxSpots}</div>
                <div className="text-cream/30 text-xs">мест занято</div>
              </div>
              {c.status === 'scheduled' && (
                <button
                  onClick={() => cancelMutation.mutate(c.id)}
                  disabled={cancelMutation.isPending}
                  className="btn-danger text-xs"
                >
                  Отменить
                </button>
              )}
            </div>
          );
        })}
        {!isLoading && classes.length === 0 && (
          <div className="text-center py-16 text-cream/30">Нет занятий на ближайшую неделю</div>
        )}
      </div>
    </div>
  );
}
