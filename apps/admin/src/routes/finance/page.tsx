import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../api/client';
import Header from '../../components/layout/Header';

interface RevenueData {
  totalRevenue: number;
  revenueByPlan: { planName: string; count: number; revenue: number }[];
  recentSubscriptions: {
    id: string;
    paidAmount: number;
    paymentMethod: string;
    createdAt: string;
    user: { firstName: string; lastName?: string };
    plan: { name: string };
  }[];
}

function formatUZS(amount: number) {
  return new Intl.NumberFormat('ru-UZ', {
    style: 'currency',
    currency: 'UZS',
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function FinancePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-revenue'],
    queryFn: () => apiFetch<{ data: RevenueData }>('/admin/analytics/revenue'),
  });

  const rev = data?.data;

  return (
    <div>
      <Header title="Финансы" />

      {isLoading && <div className="text-cream/40 text-center py-12">Загрузка...</div>}

      {rev && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="card col-span-3 md:col-span-1">
              <div className="text-cream/40 text-xs mb-1">Общая выручка (всё время)</div>
              <div className="font-syne font-bold text-3xl text-cream">
                {formatUZS(rev.totalRevenue)}
              </div>
            </div>
          </div>

          {/* Revenue by plan */}
          <div className="card mb-6">
            <div className="font-syne font-bold text-cream mb-4">По тарифам</div>
            <div className="space-y-3">
              {rev.revenueByPlan.map((p) => (
                <div key={p.planName} className="flex items-center justify-between">
                  <div>
                    <div className="text-cream font-instrument">{p.planName}</div>
                    <div className="text-cream/30 text-xs">{p.count} продаж</div>
                  </div>
                  <div className="text-cream font-syne font-bold">{formatUZS(p.revenue)}</div>
                </div>
              ))}
              {rev.revenueByPlan.length === 0 && (
                <div className="text-cream/30 text-sm text-center py-4">Нет данных</div>
              )}
            </div>
          </div>

          {/* Recent subscriptions */}
          <div className="card p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-dark-50">
              <span className="font-syne font-bold text-cream">Последние покупки</span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-50">
                  <th className="text-left px-5 py-3 text-cream/40 font-instrument font-medium">Клиент</th>
                  <th className="text-left px-5 py-3 text-cream/40 font-instrument font-medium">Тариф</th>
                  <th className="text-left px-5 py-3 text-cream/40 font-instrument font-medium">Сумма</th>
                  <th className="text-left px-5 py-3 text-cream/40 font-instrument font-medium">Дата</th>
                </tr>
              </thead>
              <tbody>
                {rev.recentSubscriptions.map((s) => (
                  <tr key={s.id} className="border-b border-dark-50 last:border-0">
                    <td className="px-5 py-3 text-cream">
                      {s.user.firstName} {s.user.lastName || ''}
                    </td>
                    <td className="px-5 py-3 text-cream/60">{s.plan.name}</td>
                    <td className="px-5 py-3 text-cream font-instrument font-semibold">
                      {formatUZS(s.paidAmount)}
                    </td>
                    <td className="px-5 py-3 text-cream/40 text-xs">
                      {new Date(s.createdAt).toLocaleDateString('ru-RU')}
                    </td>
                  </tr>
                ))}
                {rev.recentSubscriptions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-cream/30">
                      Нет покупок
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
