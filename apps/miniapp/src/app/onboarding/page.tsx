import { useState } from 'react';
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

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [goal, setGoal] = useState('');
  const { user } = useUserStore();

  async function finish() {
    hapticSuccess();
    await apiFetch('/users/me', {
      method: 'PUT',
      body: JSON.stringify({
        firstName: name || undefined,
        phone: phone || undefined,
        goal: goal || undefined,
      }),
    });
    window.location.reload();
  }

  return (
    <div className="min-h-screen flex flex-col font-instrument" style={{ background: C.bg }}>
      {/* Progress bar */}
      <div className="flex gap-2 px-5 pt-12 pb-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className="flex-1 h-1 rounded-full transition-all"
            style={{ background: s <= step ? C.terra : C.border }}
          />
        ))}
      </div>

      <div className="flex-1 px-6 py-6">
        {/* Step 1: Name */}
        {step === 1 && (
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
              className="w-full rounded-2xl px-5 py-4 text-lg outline-none transition-all"
              style={{
                background: C.white,
                border: `1.5px solid ${C.border}`,
                color: C.bark,
              }}
            />
          </div>
        )}

        {/* Step 2: Phone */}
        {step === 2 && (
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
              className="w-full rounded-2xl px-5 py-4 text-lg outline-none transition-all"
              style={{
                background: C.white,
                border: `1.5px solid ${C.border}`,
                color: C.bark,
              }}
            />
          </div>
        )}

        {/* Step 3: Goal */}
        {step === 3 && (
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
                      <div
                        className="font-syne font-bold"
                        style={{ color: selected ? C.terra : C.bark }}
                      >
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
          onClick={() => {
            haptic('medium');
            if (step < 3) setStep(step + 1);
            else finish();
          }}
          className="w-full font-syne font-bold py-4 rounded-full text-lg transition-all active:scale-[0.98]"
          style={{ background: C.terra, color: '#fff' }}
        >
          {step < 3 ? 'Далее →' : 'Начать! 🪷'}
        </button>
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            className="w-full mt-3 text-sm text-center"
            style={{ color: C.dust }}
          >
            Назад
          </button>
        )}
      </div>
    </div>
  );
}
