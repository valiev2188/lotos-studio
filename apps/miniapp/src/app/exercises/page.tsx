import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../api/client';

interface Exercise {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  description?: string;
  trainer?: { user?: { firstName: string } };
}

const diffLabels: Record<string, string> = { easy: 'Лёгкий', medium: 'Средний', hard: 'Сложный' };
const diffColors: Record<string, string> = {
  easy: 'bg-green-500/20 text-green-400',
  medium: 'bg-yellow-500/20 text-yellow-400',
  hard: 'bg-red-500/20 text-red-400',
};

export default function ExercisesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['exercises'],
    queryFn: () => apiFetch<{ data: Exercise[] }>('/exercises'),
  });

  const exercises = data?.data || [];

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-dark px-4 pt-8 pb-6">
        <h1 className="font-syne text-2xl font-bold text-cream">Упражнения</h1>
        <p className="text-cream/50 text-sm mt-1">Материалы от наших тренеров</p>
      </div>

      <div className="px-4 py-4 space-y-3">
        {isLoading && <div className="text-center py-12 text-dark/40">Загрузка...</div>}
        {!isLoading && exercises.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🤸</div>
            <div className="text-dark/50 font-instrument">Упражнения скоро появятся</div>
          </div>
        )}
        {exercises.map((e) => (
          <div key={e.id} className="bg-dark rounded-2xl p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="text-cream font-instrument font-semibold">{e.title}</div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${diffColors[e.difficulty]}`}>
                {diffLabels[e.difficulty]}
              </span>
            </div>
            {e.description && <p className="text-cream/50 text-sm leading-relaxed">{e.description}</p>}
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[10px] bg-cream/10 text-cream/50 px-2 py-0.5 rounded-full">{e.category}</span>
              {e.trainer?.user && (
                <span className="text-[10px] text-cream/30">{e.trainer.user.firstName}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
