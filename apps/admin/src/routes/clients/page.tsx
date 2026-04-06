import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/client';
import Header from '../../components/layout/Header';

/* ─── Types ─── */

interface Client {
  id: string;
  firstName: string;
  lastName?: string;
  phone?: string;
  username?: string;
  goal?: string;
  createdAt: string;
  _count?: { bookings: number; subscriptions: number };
}

interface Plan {
  id: string;
  name: string;
  classesCount: number;
  price: number;
  validityDays: number;
  isActive: boolean;
}

interface Subscription {
  id: string;
  plan: { name: string; classesCount: number };
  classesUsed: number;
  classesTotal: number;
  paidAmount: number;
  paymentMethod: string;
  expiresAt: string;
  createdAt: string;
  isActive: boolean;
}

interface Booking {
  id: string;
  date: string;
  status: string;
  classEvent: {
    title: string;
    startTime: string;
    trainer?: { firstName: string };
  };
}

interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  classEvent?: { title: string };
}

interface UserDetail {
  id: string;
  firstName: string;
  lastName?: string;
  phone?: string;
  username?: string;
  goal?: string;
  createdAt: string;
  stats: {
    totalAttended: number;
    totalCancelled: number;
    avgRating: number;
    totalSpent: number;
  };
  subscriptions: Subscription[];
  bookings: Booking[];
  reviews: Review[];
}

/* ─── Helpers ─── */

const goalLabels: Record<string, string> = {
  yoga: 'Йога',
  pilates: 'Пилатес',
  stretch: 'Стретчинг',
  any: 'Всё подряд',
};

const paymentLabels: Record<string, string> = {
  cash: 'Наличные',
  payme: 'Payme',
  click: 'Click',
};

const statusLabels: Record<string, string> = {
  confirmed: 'Подтв.',
  attended: 'Посещён',
  cancelled: 'Отменён',
  no_show: 'Неявка',
};

function formatUZS(amount: number) {
  return new Intl.NumberFormat('ru-UZ', {
    style: 'currency',
    currency: 'UZS',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU');
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/* ─── Subscription Form ─── */

function GiveSubscriptionForm({
  userId,
  onSuccess,
}: {
  userId: string;
  onSuccess: () => void;
}) {
  const queryClient = useQueryClient();

  const [planId, setPlanId] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [successMsg, setSuccessMsg] = useState('');

  const { data: plansData, isLoading: plansLoading } = useQuery({
    queryKey: ['admin-plans'],
    queryFn: () => apiFetch<{ data: Plan[] }>('/admin/plans'),
  });

  const plans = (plansData?.data || []).filter((p) => p.isActive);

  // Auto-fill price when plan changes
  useEffect(() => {
    if (planId) {
      const plan = plans.find((p) => p.id === planId);
      if (plan) setPaidAmount(String(plan.price));
    }
  }, [planId, plans]);

  const mutation = useMutation({
    mutationFn: () =>
      apiFetch('/admin/subscriptions', {
        method: 'POST',
        body: JSON.stringify({
          userId,
          planId,
          paidAmount: Number(paidAmount),
          paymentMethod,
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-user-detail', userId] });
      queryClient.invalidateQueries({ queryKey: ['admin-user-subs', userId] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setSuccessMsg('Абонемент выдан!');
      setPlanId('');
      setPaidAmount('');
      setPaymentMethod('cash');
      onSuccess();
      setTimeout(() => setSuccessMsg(''), 3000);
    },
  });

  return (
    <div className="space-y-3">
      {/* Plan select */}
      <div>
        <label className="block text-cream/40 text-xs mb-1 font-instrument">Тариф</label>
        <select
          className="input"
          value={planId}
          onChange={(e) => setPlanId(e.target.value)}
          disabled={plansLoading}
        >
          <option value="">Выберите тариф...</option>
          {plans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} — {p.classesCount} занятий, {formatUZS(p.price)}
            </option>
          ))}
        </select>
      </div>

      {/* Paid amount */}
      <div>
        <label className="block text-cream/40 text-xs mb-1 font-instrument">Сумма оплаты</label>
        <input
          className="input"
          type="number"
          placeholder="0"
          value={paidAmount}
          onChange={(e) => setPaidAmount(e.target.value)}
        />
      </div>

      {/* Payment method */}
      <div>
        <label className="block text-cream/40 text-xs mb-1 font-instrument">Способ оплаты</label>
        <select
          className="input"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <option value="cash">Наличные</option>
          <option value="payme">Payme</option>
          <option value="click">Click</option>
        </select>
      </div>

      {/* Submit */}
      <button
        className="btn-primary w-full"
        disabled={!planId || !paidAmount || mutation.isPending}
        onClick={() => mutation.mutate()}
      >
        {mutation.isPending ? 'Оформление...' : 'Выдать абонемент'}
      </button>

      {mutation.isError && (
        <div className="text-red-400 text-xs font-instrument">
          {(mutation.error as Error)?.message || 'Ошибка'}
        </div>
      )}

      {successMsg && (
        <div className="text-green-400 text-xs font-instrument">{successMsg}</div>
      )}
    </div>
  );
}

/* ─── Client Detail Panel ─── */

function ClientDetail({ userId }: { userId: string }) {
  const [showSubForm, setShowSubForm] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-user-detail', userId],
    queryFn: () => apiFetch<{ data: UserDetail }>(`/admin/users/${userId}`),
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="card h-full flex items-center justify-center">
        <div className="text-cream/30 font-instrument text-sm">Загрузка клиента...</div>
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="card h-full flex items-center justify-center">
        <div className="text-red-400/60 font-instrument text-sm">Не удалось загрузить</div>
      </div>
    );
  }

  const u = data.data;
  const activeSubscriptions = u.subscriptions?.filter((s) => s.isActive) || [];
  const recentBookings = (u.bookings || []).slice(0, 10);
  const reviews = u.reviews || [];

  return (
    <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-8rem)] pr-1">
      {/* Client info */}
      <div className="card">
        <h2 className="font-syne font-bold text-lg text-cream mb-3">
          {u.firstName} {u.lastName || ''}
        </h2>
        <div className="space-y-1.5 text-sm font-instrument">
          {u.phone && (
            <div className="flex justify-between">
              <span className="text-cream/40">Телефон</span>
              <span className="text-cream">{u.phone}</span>
            </div>
          )}
          {u.username && (
            <div className="flex justify-between">
              <span className="text-cream/40">Username</span>
              <span className="text-cream">@{u.username}</span>
            </div>
          )}
          {u.goal && (
            <div className="flex justify-between">
              <span className="text-cream/40">Цель</span>
              <span className="badge bg-purple/20 text-purple-light">
                {goalLabels[u.goal] || u.goal}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-cream/40">Регистрация</span>
            <span className="text-cream/60">{formatDate(u.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="card text-center">
          <div className="font-syne font-bold text-xl text-cream">{u.stats.totalAttended}</div>
          <div className="text-cream/40 text-[10px] font-instrument">Посещений</div>
        </div>
        <div className="card text-center">
          <div className="font-syne font-bold text-xl text-cream">{u.stats.totalCancelled}</div>
          <div className="text-cream/40 text-[10px] font-instrument">Отмен</div>
        </div>
        <div className="card text-center">
          <div className="font-syne font-bold text-xl text-cream">
            {u.stats.avgRating ? u.stats.avgRating.toFixed(1) : '—'}
          </div>
          <div className="text-cream/40 text-[10px] font-instrument">Ср. оценка</div>
        </div>
        <div className="card text-center">
          <div className="font-syne font-bold text-xl text-cream">
            {formatUZS(u.stats.totalSpent)}
          </div>
          <div className="text-cream/40 text-[10px] font-instrument">Потрачено</div>
        </div>
      </div>

      {/* Active subscriptions */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-syne font-bold text-sm text-cream">Абонементы</h3>
          <span className="text-cream/30 text-xs font-instrument">
            {activeSubscriptions.length} акт.
          </span>
        </div>

        {activeSubscriptions.length === 0 && (
          <div className="text-cream/20 text-xs font-instrument text-center py-3">
            Нет активных абонементов
          </div>
        )}

        <div className="space-y-3">
          {activeSubscriptions.map((sub) => {
            const pct = sub.classesTotal > 0
              ? Math.min((sub.classesUsed / sub.classesTotal) * 100, 100)
              : 0;
            const remaining = sub.classesTotal - sub.classesUsed;
            const daysLeft = Math.max(
              0,
              Math.ceil((new Date(sub.expiresAt).getTime() - Date.now()) / 86400000),
            );

            return (
              <div key={sub.id} className="bg-dark-200 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-cream text-sm font-instrument font-medium">
                    {sub.plan.name}
                  </span>
                  <span className="badge bg-green-500/20 text-green-400">
                    {remaining} ост.
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-dark-50 rounded-full h-1.5 mb-1.5">
                  <div
                    className="bg-purple h-1.5 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-cream/30 font-instrument">
                  <span>
                    {sub.classesUsed}/{sub.classesTotal} занятий
                  </span>
                  <span>
                    {daysLeft > 0 ? `${daysLeft} дн. до истечения` : 'Истёк'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Give subscription */}
        <div className="mt-3 pt-3 border-t border-dark-50">
          {!showSubForm ? (
            <button
              className="btn-primary w-full text-sm"
              onClick={() => setShowSubForm(true)}
            >
              + Выдать абонемент
            </button>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-syne font-bold text-xs text-cream">Новый абонемент</span>
                <button
                  className="text-cream/30 text-xs hover:text-cream transition-colors"
                  onClick={() => setShowSubForm(false)}
                >
                  Отмена
                </button>
              </div>
              <GiveSubscriptionForm
                userId={userId}
                onSuccess={() => setShowSubForm(false)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Booking history */}
      <div className="card">
        <h3 className="font-syne font-bold text-sm text-cream mb-3">
          История записей
        </h3>
        {recentBookings.length === 0 && (
          <div className="text-cream/20 text-xs font-instrument text-center py-3">
            Нет записей
          </div>
        )}
        <div className="space-y-2">
          {recentBookings.map((b) => {
            const statusColor =
              b.status === 'attended'
                ? 'bg-green-500/20 text-green-400'
                : b.status === 'cancelled' || b.status === 'no_show'
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-cream/10 text-cream/50';

            return (
              <div
                key={b.id}
                className="flex items-center justify-between bg-dark-200 rounded-lg px-3 py-2"
              >
                <div>
                  <div className="text-cream text-xs font-instrument font-medium">
                    {b.classEvent.title}
                  </div>
                  <div className="text-cream/30 text-[10px] font-instrument">
                    {formatDateTime(b.date)}
                    {b.classEvent.trainer && ` — ${b.classEvent.trainer.firstName}`}
                  </div>
                </div>
                <span className={`badge ${statusColor}`}>
                  {statusLabels[b.status] || b.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews */}
      {reviews.length > 0 && (
        <div className="card">
          <h3 className="font-syne font-bold text-sm text-cream mb-3">Отзывы</h3>
          <div className="space-y-2">
            {reviews.map((r) => (
              <div key={r.id} className="bg-dark-200 rounded-lg px-3 py-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-cream text-xs font-instrument font-medium">
                    {r.classEvent?.title || 'Занятие'}
                  </span>
                  <span className="text-cream/50 text-[10px] font-instrument">
                    {'*'.repeat(r.rating)}{'*'.repeat(0)}
                    {' '}{r.rating}/5
                  </span>
                </div>
                {r.comment && (
                  <div className="text-cream/50 text-xs font-instrument">{r.comment}</div>
                )}
                <div className="text-cream/20 text-[10px] font-instrument mt-1">
                  {formatDate(r.createdAt)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ─── */

export default function ClientsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search, page],
    queryFn: () =>
      apiFetch<{ data: Client[]; total: number; hasMore: boolean }>(
        `/admin/users?search=${encodeURIComponent(search)}&page=${page}&limit=20`,
      ),
  });

  const clients = data?.data || [];
  const total = data?.total || 0;
  const hasMore = data?.hasMore ?? false;

  return (
    <div>
      <Header title={`Клиенты (${total})`} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left panel: Client list */}
        <div className="lg:col-span-2">
          {/* Search */}
          <div className="mb-4">
            <input
              className="input max-w-sm"
              placeholder="Поиск по имени, телефону, username..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {/* Table */}
          <div className="card p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-50">
                  <th className="text-left px-5 py-3 text-cream/40 font-instrument font-medium">
                    Клиент
                  </th>
                  <th className="text-left px-5 py-3 text-cream/40 font-instrument font-medium hidden md:table-cell">
                    Телефон
                  </th>
                  <th className="text-left px-5 py-3 text-cream/40 font-instrument font-medium hidden md:table-cell">
                    Цель
                  </th>
                  <th className="text-left px-5 py-3 text-cream/40 font-instrument font-medium">
                    Записи
                  </th>
                  <th className="text-left px-5 py-3 text-cream/40 font-instrument font-medium hidden lg:table-cell">
                    Регистрация
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-cream/30 font-instrument">
                      Загрузка...
                    </td>
                  </tr>
                )}
                {clients.map((c) => {
                  const isActive = selectedUserId === c.id;
                  return (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedUserId(c.id)}
                      className={`border-b border-dark-50 last:border-0 table-row-hover ${
                        isActive ? 'bg-purple/10 hover:bg-purple/10' : ''
                      }`}
                    >
                      <td className="px-5 py-3">
                        <div className="text-cream font-medium font-instrument">
                          {c.firstName} {c.lastName || ''}
                        </div>
                        {c.username && (
                          <div className="text-cream/30 text-xs font-instrument">@{c.username}</div>
                        )}
                      </td>
                      <td className="px-5 py-3 text-cream/60 font-instrument hidden md:table-cell">
                        {c.phone || '—'}
                      </td>
                      <td className="px-5 py-3 hidden md:table-cell">
                        {c.goal ? (
                          <span className="badge bg-purple/20 text-purple-light">
                            {goalLabels[c.goal] || c.goal}
                          </span>
                        ) : (
                          <span className="text-cream/20">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-cream/60 font-instrument">
                        {c._count?.bookings || 0}
                      </td>
                      <td className="px-5 py-3 text-cream/40 text-xs font-instrument hidden lg:table-cell">
                        {formatDate(c.createdAt)}
                      </td>
                    </tr>
                  );
                })}
                {!isLoading && clients.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-cream/30 font-instrument">
                      Клиенты не найдены
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <span className="text-cream/30 text-xs font-instrument">
              Страница {page}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="btn-secondary text-xs disabled:opacity-30"
              >
                Назад
              </button>
              <button
                disabled={!hasMore}
                onClick={() => setPage(page + 1)}
                className="btn-secondary text-xs disabled:opacity-30"
              >
                Далее
              </button>
            </div>
          </div>
        </div>

        {/* Right panel: Client detail */}
        <div className="lg:col-span-1">
          {selectedUserId ? (
            <ClientDetail userId={selectedUserId} />
          ) : (
            <div className="card h-64 flex items-center justify-center">
              <div className="text-center">
                <div className="text-cream/20 text-sm font-instrument mb-1">
                  Выберите клиента
                </div>
                <div className="text-cream/10 text-xs font-instrument">
                  Нажмите на строку в таблице
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
