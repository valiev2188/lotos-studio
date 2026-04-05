import { useState, useMemo } from 'react';
import { useUserStore } from '../../stores/useUserStore';
import { haptic, hapticSuccess } from '../../utils/telegram';
import { apiFetch } from '../../api/client';

const C = {
  bg: '#FAF5EF', white: '#FFFFFF', bark: '#1C1810',
  stone: '#8B7355', dust: '#B8A898', terra: '#774936', border: '#EDE4D8',
  petal: '#F2E9DF',
};

const GOALS = [
  { value: 'yoga',    label: 'Йога',         icon: '🧘', desc: 'Хатха, виньяса, медитация' },
  { value: 'pilates', label: 'Пилатес',       icon: '💪', desc: 'Кор, осанка, гибкость' },
  { value: 'stretch', label: 'Стретчинг',     icon: '🤸', desc: 'Растяжка и гибкость' },
  { value: 'any',     label: 'Всё подряд',    icon: '🌸', desc: 'Хочу попробовать разное' },
];

// Шаги онбординга: телефон пропускается если уже заполнен (собран ботом)
type Step = 'name' | 'phone' | 'goal';

export default function OnboardingPage() {
  const { user } = useUserStore();

  // Если телефон уже есть (собран Telegram-ботом) — пропускаем шаг
  const steps: Step[] = useMemo(
    () => (user?.phone ? ['name', 'goal'] : ['name', 'phone', 'goal']),
    [user?.phone],
  );

  const [stepIndex, setStepIndex] = useState(0);
  const [name, setName]   = useState(user?.firstName ?? '');
  const [phone, setPhone] = useState('');
  const [goal, setGoal]   = useState('');

  const currentStep = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;
  const totalSteps = steps.length;

  async function finish() {
    hapticSuccess();
    const updated = await apiFetch<{ user: Record<string, any> }>('/users/me', {
      method: 'PUT',
      body: JSON.stringify({
        firstName: name || undefined,
        // Отправляем телефон только если он не был собран ботом
        phone: !user?.phone && phone ? phone : undefined,
        goal: goal || undefined,
      }),
    });
    // Обновляем стор напрямую — без перезагрузки страницы
    useUserStore.getState().setUser(updated.user ?? { ...user, firstName: name, goal, phone: phone || user?.phone });
  }

  function handleNext() {
    haptic('medium');
    if (!isLast) {
      setStepIndex(stepIndex + 1);
    } else {
      finish();
    }
  }

  function handleBack() {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  }

  return (
    <div className="min-h-screen flex flex-col font-instrument" style={{ background: C.bg }}>
      {/* Progress bar */}
      <div className="flex gap-2 px-5 pt-12 pb-2">
        {steps.map((_, i) => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full transition-all"
            style={{ background: i <= stepIndex ? C.terra : C.border }}
          />
        ))}
      </div>

      <div className="flex-1 px-6 py-6">

        {/* Step: Name */}
        {currentStep === 'name' && (
          <div>
            <div className="text-5xl mb-6">👋</div>
            <h2 className="font-syne text-3xl font-bold mb-2" style={{ color: C.bark }}>
              Как вас зовут?
            </h2>
            <p className="mb-8 text-sm" style={{ color: C.dust }}>Тренер будет знать ваше имя</p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ваше имя"
              autoFocus
              className="w-full rounded-2xl px-5 py-4 text-lg outline-none transition-all"
              style={{ background: C.white, border: `1.5px solid ${C.border}`, color: C.bark }}
            />
          </div>
        )}

        {/* Step: Phone (только если не собран ботом) */}
        {currentStep === 'phone' && (
          <div>
            <div className="text-5xl mb-6">📱</div>
            <h2 className="font-syne text-3xl font-bold mb-2" style={{ color: C.bark }}>
              Номер телефона
            </h2>
            <p className="mb-8 text-sm" style={{ color: C.dust }}>Для подтверждения записей</p>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+998 90 000 00 00"
              autoFocus
              className="w-full rounded-2xl px-5 py-4 text-lg outline-none transition-all"
              style={{ background: C.white, border: `1.5px solid ${C.border}`, color: C.bark }}
            />
          </div>
        )}

        {/* Step: Goal */}
        {currentStep === 'goal' && (
          <div>
            <div className="text-5xl mb-6">🌸</div>
            <h2 className="font-syne text-3xl font-bold mb-2" style={{ color: C.bark }}>
              Ваша цель?
            </h2>
            <p className="mb-8 text-sm" style={{ color: C.dust }}>
              Подберём занятия специально для вас
            </p>
            <div className="space-y-3">
              {GOALS.map((g) => {
                const selected = goal === g.value;
                return (
                  <button
                    key={g.value}
                    onClick={() => { haptic(); setGoal(g.value); }}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all active:scale-[0.98]"
                    style={{
                      background: selected ? C.petal : C.white,
                      border: `1.5px solid ${selected ? C.terra : C.border}`,
                    }}
                  >
                    <span className="text-2xl">{g.icon}</span>
                    <div>
                      <div className="font-syne font-bold" style={{ color: selected ? C.terra : C.bark }}>
                        {g.label}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: C.dust }}>{g.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="px-6 pb-10">
        <button
          onClick={handleNext}
          disabled={
            (currentStep === 'name' && !name.trim()) ||
            (currentStep === 'phone' && !phone.trim()) ||
            (currentStep === 'goal' && !goal)
          }
          className="w-full font-syne font-bold py-4 rounded-full text-lg transition-all active:scale-[0.98] disabled:opacity-50"
          style={{ background: C.terra, color: '#fff' }}
        >
          {isLast ? 'Начать! 🪷' : 'Далее →'}
        </button>
        {stepIndex > 0 && (
          <button
            onClick={handleBack}
            className="w-full mt-3 text-sm text-center"
            style={{ color: C.dust }}
          >
            Назад
          </button>
        )}
        {/* Шаги */}
        <p className="text-center text-xs mt-4" style={{ color: C.dust }}>
          Шаг {stepIndex + 1} из {totalSteps}
        </p>
      </div>
    </div>
  );
}
