import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../api/client';
import Header from '../../components/layout/Header';

interface Trainer {
  id: string;
  bio: string;
  experienceYears: number;
  specializations: string[];
  isActive: boolean;
  user?: { firstName: string; lastName?: string };
  _count?: { classes: number; exercises: number };
}

export default function TrainersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-trainers'],
    queryFn: () => apiFetch<{ data: Trainer[] }>('/trainers'),
  });

  const trainers = data?.data || [];

  return (
    <div>
      <Header title="Тренеры" />

      {isLoading && <div className="text-cream/40 text-center py-12">Загрузка...</div>}

      <div className="grid grid-cols-2 gap-4">
        {trainers.map((t) => (
          <div key={t.id} className="card">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-brown/20 flex items-center justify-center text-2xl">
                💪
              </div>
              <div>
                <div className="text-cream font-syne font-bold">
                  {t.user?.firstName} {t.user?.lastName}
                </div>
                <div className="text-cream/40 text-xs mt-0.5">{t.experienceYears} лет опыта</div>
                <span
                  className={`badge text-[10px] mt-1 ${
                    t.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {t.isActive ? 'Активен' : 'Неактивен'}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {t.specializations.map((s) => (
                <span key={s} className="badge bg-purple/20 text-purple-light text-[10px]">{s}</span>
              ))}
            </div>

            {t.bio && <p className="text-cream/50 text-xs leading-relaxed">{t.bio}</p>}

            <div className="flex gap-4 mt-3 pt-3 border-t border-dark-50">
              <div className="text-center">
                <div className="text-cream font-syne font-bold">{t._count?.classes || 0}</div>
                <div className="text-cream/30 text-xs">Занятий</div>
              </div>
              <div className="text-center">
                <div className="text-cream font-syne font-bold">{t._count?.exercises || 0}</div>
                <div className="text-cream/30 text-xs">Упражнений</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!isLoading && trainers.length === 0 && (
        <div className="text-center py-16 text-cream/30">Тренеры не найдены</div>
      )}
    </div>
  );
}
