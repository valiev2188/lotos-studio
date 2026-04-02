import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../api/client';

interface TrainerItem {
  id: string;
  bio: string;
  experienceYears: number;
  specializations: string[];
  user?: { firstName: string; lastName?: string };
}

const C = {
  bg: '#FAF5EF', white: '#FFFFFF', bark: '#1C1810',
  stone: '#8B7355', dust: '#B8A898', terra: '#774936', border: '#EDE4D8',
  petal: '#F2E9DF',
};

const ICONS = ['🧘', '💪', '🏋️'];

export default function TrainersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['trainers'],
    queryFn: () => apiFetch<{ data: TrainerItem[] }>('/trainers'),
  });

  const trainers = data?.data || [];

  return (
    <div className="min-h-screen pb-28 font-instrument" style={{ background: C.bg }}>
      {/* Header */}
      <div className="px-5 pt-10 pb-5" style={{ background: C.white, boxShadow: '0 1px 0 #EDE4D8' }}>
        <h1 className="font-syne font-bold text-2xl" style={{ color: C.bark }}>Тренеры</h1>
        <p className="text-sm mt-1" style={{ color: C.dust }}>Наши сертифицированные специалисты</p>
      </div>

      <div className="px-5 py-4 space-y-4">
        {isLoading && (
          <div className="text-center py-12" style={{ color: C.dust }}>Загрузка...</div>
        )}
        {!isLoading && trainers.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🌸</div>
            <p className="text-sm" style={{ color: C.dust }}>Информация о тренерах скоро появится</p>
          </div>
        )}
        {trainers.map((t, i) => (
          <div
            key={t.id}
            className="rounded-2xl p-5"
            style={{ background: C.white, boxShadow: '0 2px 12px rgba(28,24,16,0.06)' }}
          >
            <div className="flex items-center gap-4 mb-3">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: C.petal }}
              >
                {ICONS[i % ICONS.length]}
              </div>
              <div>
                <div className="font-syne font-bold" style={{ color: C.bark }}>
                  {t.user?.firstName} {t.user?.lastName}
                </div>
                {t.specializations.length > 0 && (
                  <div className="text-xs mt-0.5" style={{ color: C.terra }}>
                    {t.specializations.join(' · ')}
                  </div>
                )}
              </div>
            </div>

            {t.bio && (
              <p className="text-sm leading-relaxed mb-3" style={{ color: C.stone }}>
                {t.bio}
              </p>
            )}

            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-medium px-3 py-1 rounded-full"
                style={{ background: C.petal, color: C.stone }}
              >
                Опыт: {t.experienceYears} лет
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
