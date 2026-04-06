import { useState, useMemo } from 'react';
import { useUserStore } from '../../stores/useUserStore';
import { haptic, hapticSuccess } from '../../utils/telegram';
import { apiFetch } from '../../api/client';
import { User, Cake, Phone, Award, Activity, Dumbbell, Heart, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

const C = {
  bg: '#FAF5EF', white: '#FFFFFF', bark: '#1C1810',
  stone: '#8B7355', dust: '#B8A898', terra: '#774936', border: '#EDE4D8',
  petal: '#F2E9DF', green: '#4CAF50', amber: '#F59E0B', red: '#EF4444',
  purple: '#662E9B', purpleLight: '#f3ecfb',
};

const GOALS = [
  { value: 'yoga',    label: 'Йога',       Icon: Activity,  desc: 'Хатха, виньяса, медитация' },
  { value: 'pilates', label: 'Пилатес',     Icon: Dumbbell,  desc: 'Кор, осанка, гибкость' },
  { value: 'stretch', label: 'Стретчинг',   Icon: Heart,     desc: 'Растяжка и гибкость' },
  { value: 'any',     label: 'Всё подряд',  Icon: Sparkles,  desc: 'Хочу попробовать разное' },
];

type Step = 'name' | 'birthYear' | 'phone' | 'goal';

export default function OnboardingPage() {
  const { user } = useUserStore();

  const steps: Step[] = useMemo(
    () => (user?.phone ? ['name', 'birthYear', 'goal'] : ['name', 'birthYear', 'phone', 'goal']),
    [user?.phone],
  );

  const [stepIndex, setStepIndex] = useState(0);
  const [name, setName] = useState(user?.firstName ?? '');
  const [birthYear, setBirthYear] = useState('');
  const [phone, setPhone] = useState('');
  const [goal, setGoal] = useState('');

  const currentStep = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;
  const totalSteps = steps.length;

  async function finish() {
    hapticSuccess();
    const updated = await apiFetch<Record<string, any>>('/users/me', {
      method: 'PUT',
      body: JSON.stringify({
        firstName: name || undefined,
        birthYear: birthYear ? Number(birthYear) : undefined,
        phone: !user?.phone && phone ? phone : undefined,
        goal: goal || undefined,
      }),
    });
    useUserStore.getState().setUser(updated);
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
    if (stepIndex > 0) {
      haptic('light');
      setStepIndex(stepIndex - 1);
    }
  }

  function isNextDisabled(): boolean {
    if (currentStep === 'name') return !name.trim();
    if (currentStep === 'birthYear') {
      const y = Number(birthYear);
      return !birthYear || y < 1940 || y > 2015;
    }
    if (currentStep === 'phone') return !phone.trim();
    if (currentStep === 'goal') return !goal;
    return false;
  }

  const stepConfig: Record<Step, { Icon: typeof User; title: string; subtitle: string }> = {
    name: {
      Icon: User,
      title: 'Добро пожаловать в Лотос!',
      subtitle: 'Как вас зовут?',
    },
    birthYear: {
      Icon: Cake,
      title: 'Год рождения',
      subtitle: 'Чтобы подобрать подходящие занятия',
    },
    phone: {
      Icon: Phone,
      title: 'Номер телефона',
      subtitle: 'Для подтверждения записей',
    },
    goal: {
      Icon: Award,
      title: 'Ваша цель?',
      subtitle: 'Подберём занятия специально для вас',
    },
  };

  const { Icon: StepIcon, title, subtitle } = stepConfig[currentStep];

  return (
    <div className="min-h-screen flex flex-col font-instrument" style={{ background: C.bg }}>
      {/* Progress bar */}
      <div className="flex gap-2 px-5 pt-12 pb-2">
        {steps.map((_, i) => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full transition-all duration-300"
            style={{ background: i <= stepIndex ? C.terra : C.border }}
          />
        ))}
      </div>

      <div className="flex-1 px-6 py-6">
        {/* Step header */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
          style={{ background: C.petal }}
        >
          <StepIcon size={28} color={C.terra} strokeWidth={1.8} />
        </div>
        <h2 className="font-syne text-2xl font-bold mb-1" style={{ color: C.bark }}>
          {title}
        </h2>
        <p className="mb-8 text-sm" style={{ color: C.dust }}>{subtitle}</p>

        {/* Step: Name */}
        {currentStep === 'name' && (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ваше имя"
            autoFocus
            className="w-full rounded-2xl px-5 py-4 text-lg outline-none transition-all focus:ring-2"
            style={{
              background: C.white,
              border: `1.5px solid ${C.border}`,
              color: C.bark,
              // @ts-ignore
              '--tw-ring-color': C.terra,
            }}
          />
        )}

        {/* Step: Birth Year */}
        {currentStep === 'birthYear' && (
          <input
            type="number"
            value={birthYear}
            onChange={(e) => setBirthYear(e.target.value)}
            placeholder="1995"
            min={1940}
            max={2015}
            autoFocus
            className="w-full rounded-2xl px-5 py-4 text-lg outline-none transition-all focus:ring-2"
            style={{
              background: C.white,
              border: `1.5px solid ${C.border}`,
              color: C.bark,
            }}
          />
        )}

        {/* Step: Phone */}
        {currentStep === 'phone' && (
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+998 90 000 00 00"
            autoFocus
            className="w-full rounded-2xl px-5 py-4 text-lg outline-none transition-all focus:ring-2"
            style={{
              background: C.white,
              border: `1.5px solid ${C.border}`,
              color: C.bark,
            }}
          />
        )}

        {/* Step: Goal */}
        {currentStep === 'goal' && (
          <div className="space-y-3">
            {GOALS.map((g) => {
              const selected = goal === g.value;
              const GoalIcon = g.Icon;
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
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: selected ? C.terra : C.petal }}
                  >
                    <GoalIcon
                      size={20}
                      color={selected ? C.white : C.terra}
                      strokeWidth={1.8}
                    />
                  </div>
                  <div>
                    <div className="font-syne font-bold text-[15px]" style={{ color: selected ? C.terra : C.bark }}>
                      {g.label}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: C.dust }}>{g.desc}</div>
                  </div>
                  {selected && (
                    <div className="ml-auto">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ background: C.terra }}
                      >
                        <ChevronRight size={14} color={C.white} strokeWidth={2.5} />
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="px-6 pb-10">
        <button
          onClick={handleNext}
          disabled={isNextDisabled()}
          className="w-full font-syne font-bold py-4 rounded-full text-lg transition-all active:scale-[0.98] disabled:opacity-40"
          style={{ background: C.terra, color: '#fff' }}
        >
          {isLast ? 'Начать!' : 'Далее'}
        </button>
        {stepIndex > 0 && (
          <button
            onClick={handleBack}
            className="w-full mt-3 flex items-center justify-center gap-1 text-sm"
            style={{ color: C.stone }}
          >
            <ChevronLeft size={16} strokeWidth={2} />
            Назад
          </button>
        )}
        <p className="text-center text-xs mt-4" style={{ color: C.dust }}>
          Шаг {stepIndex + 1} из {totalSteps}
        </p>
      </div>
    </div>
  );
}
