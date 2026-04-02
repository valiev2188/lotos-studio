import { useState } from 'react';
import { useUserStore } from '../../stores/useUserStore';
import { haptic, hapticSuccess } from '../../utils/telegram';
import { apiFetch } from '../../api/client';

const GOALS = [
  { value: 'yoga', label: 'Йога', icon: '🧘', desc: 'Хатха, виньяса, медитация' },
  { value: 'pilates', label: 'Пилатес', icon: '💪', desc: 'Кор, осанка, гибкость' },
  { value: 'stretch', label: 'Стретчинг', icon: '🤸', desc: 'Растяжка и гибкость' },
  { value: 'any', label: 'Всё подряд', icon: '⭐', desc: 'Хочу попробовать разное' },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [goal, setGoal] = useState('');
  const { user } = useUserStore();

  const userId = user?.id as string;

  async function finish() {
    hapticSuccess();
    await apiFetch('/users/me', {
      method: 'PUT',
      body: JSON.stringify({ firstName: name || undefined, phone: phone || undefined, goal: goal || undefined }),
    });
    window.location.reload();
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Progress */}
      <div className="flex gap-2 p-4 pt-8">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`flex-1 h-1 rounded-full transition-colors ${s <= step ? 'bg-dark' : 'bg-dark/20'}`}
          />
        ))}
      </div>

      <div className="flex-1 px-6 py-4">
        {/* Step 1: Name */}
        {step === 1 && (
          <div>
            <div className="text-5xl mb-6">👋</div>
            <h2 className="font-syne text-3xl font-bold text-dark mb-2">Как вас зовут?</h2>
            <p className="text-dark/50 mb-8">Тренер будет знать ваше имя</p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ваше имя"
              className="w-full bg-dark text-cream placeholder-cream/30 rounded-2xl px-5 py-4 text-lg font-instrument outline-none focus:ring-2 focus:ring-brown"
            />
          </div>
        )}

        {/* Step 2: Phone */}
        {step === 2 && (
          <div>
            <div className="text-5xl mb-6">📱</div>
            <h2 className="font-syne text-3xl font-bold text-dark mb-2">Номер телефона</h2>
            <p className="text-dark/50 mb-8">Для подтверждения записей</p>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+998 90 000 00 00"
              className="w-full bg-dark text-cream placeholder-cream/30 rounded-2xl px-5 py-4 text-lg font-instrument outline-none focus:ring-2 focus:ring-brown"
            />
          </div>
        )}

        {/* Step 3: Goal */}
        {step === 3 && (
          <div>
            <div className="text-5xl mb-6">🎯</div>
            <h2 className="font-syne text-3xl font-bold text-dark mb-2">Ваша цель?</h2>
            <p className="text-dark/50 mb-8">Подберём занятия специально для вас</p>
            <div className="space-y-3">
              {GOALS.map((g) => (
                <button
                  key={g.value}
                  onClick={() => { haptic(); setGoal(g.value); }}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                    goal === g.value ? 'bg-dark border-dark' : 'bg-dark/5 border-dark/10'
                  }`}
                >
                  <span className="text-2xl">{g.icon}</span>
                  <div className="text-left">
                    <div className={`font-syne font-bold ${goal === g.value ? 'text-cream' : 'text-dark'}`}>{g.label}</div>
                    <div className={`text-xs ${goal === g.value ? 'text-cream/50' : 'text-dark/40'}`}>{g.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Button */}
      <div className="px-6 pb-8 safe-bottom">
        <button
          onClick={() => {
            haptic('medium');
            if (step < 3) setStep(step + 1);
            else finish();
          }}
          className="w-full bg-dark text-cream font-syne font-bold py-4 rounded-2xl text-lg"
        >
          {step < 3 ? 'Далее →' : 'Начать! 🪷'}
        </button>
        {step > 1 && (
          <button onClick={() => setStep(step - 1)} className="w-full mt-3 text-dark/40 text-sm text-center">
            Назад
          </button>
        )}
      </div>
    </div>
  );
}
