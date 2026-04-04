import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../api/client';
import Header from '../../components/layout/Header';

interface Overview {
  totalBookings: number;
  totalAttended: number;
  attendanceRate: number;
  revenue: number;
  newClients: number;
  activeSubscriptions: number;
  occupancyRate: number;
}

function KpiCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="card">
      <div className="text-cream/40 text-xs font-instrument mb-1">{label}</div>
      <div className="font-syne font-bold text-2xl text-cream">{value}</div>
      {sub && <div className="text-cream/30 text-xs mt-1">{sub}</div>}
    </div>
  );
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-overview'],
    queryFn: () => apiFetch<Overview>('/admin/analytics/overview'),
    refetchInterval: 60_000,
    retry: 1,
  });

  return (
    <div>
      <Header title="Dashboard" />

      {isLoading && (
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card animate-pulse h-24 bg-dark-100" />
          ))}
        </div>
      )}

      {data && (
        <div className="grid grid-cols-3 gap-4">
          <KpiCard label="Записей (30 дней)" value={data.totalBookings} />
          <KpiCard
            label="Выручка за месяц"
            value={new Intl.NumberFormat('ru-UZ', {
              style: 'currency',
              currency: 'UZS',
              maximumFractionDigits: 0,
            }).format(data.revenue)}
          />
          <KpiCard label="Новых клиентов" value={data.newClients} sub="за 30 дней" />
          <KpiCard label="Посещаемость" value={`${data.attendanceRate}%`} sub="за последние 30 дней" />
          <KpiCard label="Посетило занятий" value={data.totalAttended} />
          <KpiCard label="Активных абонементов" value={data.activeSubscriptions} />
        </div>
      )}

      {/* Quick links */}
      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="card">
          <div className="font-syne font-bold text-cream mb-3">Ближайшие занятия</div>
          <p className="text-cream/40 text-sm">Перейдите в Расписание для подробностей</p>
        </div>
        <div className="card">
          <div className="font-syne font-bold text-cream mb-3">Последние записи</div>
          <p className="text-cream/40 text-sm">Перейдите в Записи для подробностей</p>
        </div>
      </div>
    </div>
  );
}
