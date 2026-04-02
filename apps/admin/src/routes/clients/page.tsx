import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../api/client';
import Header from '../../components/layout/Header';

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

const goalLabels: Record<string, string> = {
  yoga: 'Йога', pilates: 'Пилатес', stretch: 'Стретчинг', any: 'Всё подряд',
};

export default function ClientsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search, page],
    queryFn: () =>
      apiFetch<{ data: Client[]; total: number; pages: number }>(
        `/admin/users?search=${encodeURIComponent(search)}&page=${page}&limit=20`,
      ),
  });

  const clients = data?.data || [];
  const total = data?.total || 0;
  const pages = data?.pages || 1;

  return (
    <div>
      <Header title={`Клиенты (${total})`} />

      <div className="mb-4">
        <input
          className="input max-w-sm"
          placeholder="Поиск по имени, телефону, username..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-dark-50">
              <th className="text-left px-5 py-3 text-cream/40 font-instrument font-medium">Клиент</th>
              <th className="text-left px-5 py-3 text-cream/40 font-instrument font-medium">Телефон</th>
              <th className="text-left px-5 py-3 text-cream/40 font-instrument font-medium">Цель</th>
              <th className="text-left px-5 py-3 text-cream/40 font-instrument font-medium">Записи</th>
              <th className="text-left px-5 py-3 text-cream/40 font-instrument font-medium">Дата регистрации</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} className="text-center py-12 text-cream/30">Загрузка...</td>
              </tr>
            )}
            {clients.map((c) => (
              <tr key={c.id} className="border-b border-dark-50 last:border-0 table-row-hover">
                <td className="px-5 py-3">
                  <div className="text-cream font-medium">
                    {c.firstName} {c.lastName || ''}
                  </div>
                  {c.username && <div className="text-cream/30 text-xs">@{c.username}</div>}
                </td>
                <td className="px-5 py-3 text-cream/60">{c.phone || '—'}</td>
                <td className="px-5 py-3">
                  {c.goal ? (
                    <span className="badge bg-purple/20 text-purple-light">{goalLabels[c.goal] || c.goal}</span>
                  ) : (
                    <span className="text-cream/20">—</span>
                  )}
                </td>
                <td className="px-5 py-3 text-cream/60">{c._count?.bookings || 0}</td>
                <td className="px-5 py-3 text-cream/40 text-xs">
                  {new Date(c.createdAt).toLocaleDateString('ru-RU')}
                </td>
              </tr>
            ))}
            {!isLoading && clients.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-12 text-cream/30">Клиенты не найдены</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="btn-secondary disabled:opacity-30"
          >
            ←
          </button>
          <span className="text-cream/50 text-sm">{page} / {pages}</span>
          <button
            disabled={page === pages}
            onClick={() => setPage(page + 1)}
            className="btn-secondary disabled:opacity-30"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
