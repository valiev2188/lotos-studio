import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../api/client';

interface TrainerItem {
  id: string;
  bio: string;
  experienceYears: number;
  specializations: string[];
  user?: { firstName: string; lastName?: string };
}

export default function TrainersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['trainers'],
    queryFn: () => apiFetch<{ data: TrainerItem[] }>('/trainers'),
  });

  const trainers = data?.data || [];
  const icons = ['🧘', '💪', '🏋️'];

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-dark px-4 pt-8 pb-6">
        <h1 className="font-syne text-2xl font-bold text-cream">Тренеры</h1>
      </div>

      <div className="px-4 py-4 space-y-4">
        {isLoading && <div className="text-center py-12 text-dark/40">Загрузка...</div>}
        {trainers.map((t, i) => (
          <div key={t.id} className="bg-dark rounded-2xl p-5">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 rounded-full bg-brown/20 flex items-center justify-center text-2xl">
                {icons[i % icons.length]}
              </div>
              <div>
                <div className="text-cream font-syne font-bold">
                  {t.user?.firstName} {t.user?.lastName}
                </div>
                <div className="text-purple-light text-xs mt-0.5">{t.specializations.join(' · ')}</div>
              </div>
            </div>
            {t.bio && <p className="text-cream/50 text-sm leading-relaxed">{t.bio}</p>}
            <div className="mt-3 text-cream/30 text-xs">Опыт: {t.experienceYears} лет</div>
          </div>
        ))}
      </div>
    </div>
  );
}
