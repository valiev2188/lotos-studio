import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../api/client';
import { haptic } from '../../utils/telegram';

interface Exercise {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  description?: string;
  trainer?: { user?: { firstName: string } };
}

const C = {
  bg: '#FAF5EF', white: '#FFFFFF', bark: '#1C1810',
  stone: '#8B7355', dust: '#B8A898', terra: '#774936', border: '#EDE4D8',
  petal: '#F2E9DF',
};

const diffLabel: Record<string, string> = { easy: 'Лёгкий', medium: 'Средний', hard: 'Сложный' };
const diffStyle: Record<string, { bg: string; color: string }> = {
  easy:   { bg: '#EDF4EA', color: '#5E7A4E' },
  medium: { bg: '#FEF8EC', color: '#A07830' },
  hard:   { bg: '#FBF0EE', color: '#A05040' },
};

const CATS = ['Все', 'Йога', 'Пилатес', 'Стретчинг', 'Фитнес'];

export default function ExercisesPage() {
  const [cat, setCat] = useState('Все');

  const { data, isLoading } = useQuery({
    queryKey: ['exercises'],
    queryFn: () => apiFetch<{ data: Exercise[] }>('/exercises'),
  });

  const exercises = (data?.data || []).filter(
    (e) => cat === 'Все' || e.category === cat,
  );

  return (
    <div className="min-h-screen pb-28 font-instrument" style={{ background: C.bg }}>
      {/* Header */}
      <div className="px-5 pt-10 pb-4" style={{ background: C.white, boxShadow: '0 1px 0 #EDE4D8' }}>
        <h1 className="font-syne font-bold text-2xl mb-1" style={{ color: C.bark }}>Упражнения</h1>
        <p className="text-sm mb-3" style={{ color: C.dust }}>Материалы от наших тренеров</p>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATS.map((c) => (
            <button
              key={c}
              onClick={() => { haptic(); setCat(c); }}
              className="flex-shrink-0 text-xs font-medium px-4 py-2 rounded-full border whitespace-nowrap transition-all"
              style={{
                background: cat === c ? C.terra : C.white,
                borderColor: cat === c ? C.terra : C.border,
                color: cat === c ? '#fff' : C.stone,
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 py-4 space-y-3">
        {isLoading && (
          <div className="text-center py-12" style={{ color: C.dust }}>Загрузка...</div>
        )}
        {!isLoading && exercises.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🌿</div>
            <p className="text-sm" style={{ color: C.dust }}>Упражнения скоро появятся</p>
          </div>
        )}
        {exercises.map((e) => {
          const ds = diffStyle[e.difficulty] || { bg: C.petal, color: C.stone };
          return (
            <div
              key={e.id}
              className="rounded-2xl p-4"
              style={{ background: C.white, boxShadow: '0 2px 12px rgba(28,24,16,0.06)' }}
            >
              <div className="flex items-start justify-between mb-2">
                <p className="font-semibold text-sm flex-1 pr-2" style={{ color: C.bark }}>
                  {e.title}
                </p>
                <span
                  className="text-[10px] font-medium px-2.5 py-1 rounded-full flex-shrink-0"
                  style={{ background: ds.bg, color: ds.color }}
                >
                  {diffLabel[e.difficulty] || e.difficulty}
                </span>
              </div>

              {e.description && (
                <p className="text-xs leading-relaxed mb-2" style={{ color: C.stone }}>
                  {e.description}
                </p>
              )}

              <div className="flex items-center gap-2 mt-1">
                <span
                  className="text-[10px] font-medium px-2.5 py-1 rounded-full"
                  style={{ background: C.petal, color: C.stone }}
                >
                  {e.category}
                </span>
                {e.trainer?.user && (
                  <span className="text-[10px]" style={{ color: C.dust }}>
                    {e.trainer.user.firstName}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
