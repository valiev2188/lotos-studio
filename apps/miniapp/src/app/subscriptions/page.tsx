import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../api/client';
import { haptic, hapticSuccess } from '../../utils/telegram';
import { Ticket, Check, Star, Clock, ChevronRight, CreditCard, Loader2 } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  description: string;
  classesCount: number;
  price: number;
  validityDays: number;
  isActive: boolean;
  sortOrder: number;
}

interface Sub {
  id: string;
  status: string;
  totalClasses: number;
  usedClasses: number;
  remainingClasses: number;
  expiresAt: string;
  plan: { name: string };
}

const C = {
  bg: '#FAF5EF', white: '#FFFFFF', bark: '#1C1810',
  stone: '#8B7355', dust: '#B8A898', terra: '#774936', border: '#EDE4D8',
  petal: '#F2E9DF', green: '#4CAF50', amber: '#F59E0B', red: '#EF4444',
  purple: '#662E9B', purpleLight: '#f3ecfb',
};

export default function SubscriptionsPage() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  // ── Fetch plans (no auth required) ─────────────────────────
  const { data: plansData, isLoading: plansLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: () => apiFetch<{ data: Plan[] }>('/admin/plans'),
    staleTime: 300_000,
  });

  // ── Fetch active subscription ──────────────────────────────
  const { data: subsData, isLoading: subsLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => apiFetch<{ data: Sub[] }>('/subscriptions'),
    staleTime: 120_000,
  });

  const plans = useMemo(() => {
    const list = plansData?.data ?? [];
    return list.filter(p => p.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
  }, [plansData]);

  const activeSub = useMemo(() => {
    const subs = subsData?.data ?? [];
    return subs.find(
      s => s.status === 'active' && new Date(s.expiresAt) > new Date() && s.remainingClasses > 0,
    ) ?? null;
  }, [subsData]);

  // The "popular" plan is the middle one, or second if 3+
  const popularIndex = plans.length >= 3 ? 1 : plans.length === 2 ? 1 : 0;

  function openPayment(plan: Plan) {
    haptic('medium');
    setSelectedPlan(plan);
  }

  function closePayment() {
    haptic();
    setSelectedPlan(null);
  }

  function contactAdmin() {
    hapticSuccess();
    window.open('https://t.me/vvveins', '_blank');
  }

  const isLoading = plansLoading || subsLoading;

  return (
    <div className="min-h-screen pb-28 font-instrument" style={{ background: C.bg }}>

      {/* ── Header ────────────────────────────────────────────── */}
      <div
        className="px-5 pt-10 pb-5"
        style={{ background: C.white, boxShadow: '0 1px 0 #EDE4D8' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: C.purpleLight }}
          >
            <Ticket size={20} color={C.purple} />
          </div>
          <div>
            <h1 className="font-syne font-bold text-2xl" style={{ color: C.bark }}>
              Абонементы
            </h1>
            <p className="text-sm mt-0.5" style={{ color: C.dust }}>
              Выберите подходящий план
            </p>
          </div>
        </div>
      </div>

      {/* ── Loading state ─────────────────────────────────────── */}
      {isLoading && (
        <div className="flex flex-col items-center py-16">
          <Loader2 size={32} color={C.terra} className="animate-spin mb-3" />
          <p className="text-sm" style={{ color: C.dust }}>Загружаем...</p>
        </div>
      )}

      {!isLoading && (
        <>
          {/* ── Active subscription ─────────────────────────────── */}
          {activeSub && (
            <div className="px-5 pt-5">
              <div
                className="rounded-2xl p-5"
                style={{ background: C.white, boxShadow: '0 2px 12px rgba(28,24,16,0.06)' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Ticket size={16} color={C.purple} />
                    <h3 className="font-syne font-bold text-sm" style={{ color: C.bark }}>
                      {activeSub.plan.name}
                    </h3>
                  </div>
                  <span
                    className="text-[11px] px-2.5 py-1 rounded-full font-semibold"
                    style={{ background: '#E8F5E9', color: C.green }}
                  >
                    Активен
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mb-2">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span style={{ color: C.stone }}>
                      Использовано {activeSub.usedClasses} из {activeSub.totalClasses}
                    </span>
                    <span className="font-semibold" style={{ color: C.terra }}>
                      {activeSub.remainingClasses} осталось
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full" style={{ background: C.border }}>
                    <div
                      className="h-2.5 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min((activeSub.usedClasses / activeSub.totalClasses) * 100, 100)}%`,
                        background: `linear-gradient(90deg, ${C.terra}, ${C.purple})`,
                      }}
                    />
                  </div>
                </div>

                {/* Expiry */}
                <div className="flex items-center gap-1.5 mt-3">
                  <Clock size={13} color={C.dust} strokeWidth={1.8} />
                  <span className="text-xs" style={{ color: C.dust }}>
                    Действует до{' '}
                    {new Date(activeSub.expiresAt).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── Plans list ──────────────────────────────────────── */}
          <div className="px-5 pt-5 pb-4">
            <h2 className="font-syne font-bold text-base mb-4" style={{ color: C.bark }}>
              {activeSub ? 'Продлить или сменить план' : 'Выберите абонемент'}
            </h2>

            <div className="space-y-4">
              {plans.map((plan, i) => {
                const isPopular = i === popularIndex && plans.length > 1;

                return (
                  <div
                    key={plan.id}
                    className="rounded-2xl overflow-hidden relative"
                    style={{
                      background: C.white,
                      boxShadow: isPopular
                        ? `0 4px 20px rgba(102,46,155,0.15)`
                        : '0 2px 12px rgba(28,24,16,0.06)',
                      border: isPopular ? `2px solid ${C.purple}` : `1px solid ${C.border}`,
                    }}
                  >
                    {/* Popular badge */}
                    {isPopular && (
                      <div
                        className="flex items-center justify-center gap-1.5 py-2"
                        style={{ background: C.purple }}
                      >
                        <Star size={13} color="#fff" fill="#fff" />
                        <span className="text-xs font-semibold text-white">
                          Популярный выбор
                        </span>
                      </div>
                    )}

                    <div className="p-5">
                      {/* Plan name & description */}
                      <h3
                        className="font-syne font-bold text-lg mb-1"
                        style={{ color: C.bark }}
                      >
                        {plan.name}
                      </h3>
                      {plan.description && (
                        <p className="text-xs mb-4 leading-relaxed" style={{ color: C.stone }}>
                          {plan.description}
                        </p>
                      )}

                      {/* Details row */}
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                          style={{ background: C.petal }}
                        >
                          <Check size={13} color={C.terra} strokeWidth={2.5} />
                          <span className="text-xs font-medium" style={{ color: C.terra }}>
                            {plan.classesCount} занятий
                          </span>
                        </div>
                        <div
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                          style={{ background: C.petal }}
                        >
                          <Clock size={13} color={C.stone} strokeWidth={1.8} />
                          <span className="text-xs font-medium" style={{ color: C.stone }}>
                            {plan.validityDays} дней
                          </span>
                        </div>
                      </div>

                      {/* Price + button */}
                      <div className="flex items-center justify-between">
                        <div>
                          <span
                            className="font-syne font-bold text-2xl"
                            style={{ color: C.bark }}
                          >
                            {plan.price.toLocaleString()}
                          </span>
                          <span className="text-sm ml-1" style={{ color: C.dust }}>
                            сум
                          </span>
                        </div>
                        <button
                          onClick={() => openPayment(plan)}
                          className="flex items-center gap-1.5 px-5 py-3 rounded-full font-semibold text-sm transition-all active:scale-95"
                          style={{
                            background: isPopular ? C.purple : C.terra,
                            color: '#fff',
                          }}
                        >
                          Оформить
                          <ChevronRight size={16} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {plans.length === 0 && !plansLoading && (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">🧘</div>
                  <p className="text-sm" style={{ color: C.dust }}>
                    Планы абонементов скоро появятся
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Bottom note: free trial ─────────────────────────── */}
          <div className="px-5 pb-6">
            <div
              className="rounded-2xl p-5 text-center"
              style={{ background: C.purpleLight, border: `1px solid ${C.purple}15` }}
            >
              <p className="font-syne font-bold text-sm mb-1" style={{ color: C.purple }}>
                Первое пробное занятие — бесплатно!
              </p>
              <p className="text-xs mb-4" style={{ color: C.stone }}>
                Попробуйте наши занятия без оплаты
              </p>
              <button
                onClick={() => {
                  haptic('medium');
                  navigate('/schedule');
                }}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold transition-all active:scale-95"
                style={{ background: C.purple, color: '#fff' }}
              >
                Перейти к расписанию
                <ChevronRight size={16} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Payment bottom sheet ──────────────────────────────── */}
      {selectedPlan && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          onClick={closePayment}
        >
          {/* Overlay */}
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.4)' }}
          />

          {/* Sheet */}
          <div
            className="relative w-full max-w-lg rounded-t-3xl"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: C.white,
              animation: 'slideUp 0.3s ease-out',
            }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full" style={{ background: C.border }} />
            </div>

            <div className="px-6 pb-8 pt-2">
              {/* Plan header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-syne font-bold text-xl" style={{ color: C.bark }}>
                    {selectedPlan.name}
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color: C.dust }}>
                    {selectedPlan.classesCount} занятий / {selectedPlan.validityDays} дней
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-syne font-bold text-xl" style={{ color: C.terra }}>
                    {selectedPlan.price.toLocaleString()}
                  </span>
                  <span className="text-xs ml-1" style={{ color: C.dust }}>сум</span>
                </div>
              </div>

              {/* Instruction */}
              <p className="text-sm leading-relaxed mb-4" style={{ color: C.stone }}>
                Для оформления абонемента переведите{' '}
                <span className="font-semibold" style={{ color: C.bark }}>
                  {selectedPlan.price.toLocaleString()} сум
                </span>{' '}
                по реквизитам:
              </p>

              {/* Payment details card */}
              <div
                className="rounded-2xl p-4 mb-4"
                style={{ background: C.petal, border: `1px solid ${C.border}` }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <CreditCard size={18} color={C.terra} />
                  <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.stone }}>
                    Реквизиты для оплаты
                  </span>
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-start gap-2">
                    <span className="text-base leading-none mt-0.5">💳</span>
                    <div>
                      <p className="text-[11px] mb-0.5" style={{ color: C.dust }}>Карта</p>
                      <p
                        className="text-base font-mono font-semibold tracking-wider"
                        style={{ color: C.bark }}
                      >
                        8600 1234 5678 9012
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-base leading-none mt-0.5">👤</span>
                    <div>
                      <p className="text-[11px] mb-0.5" style={{ color: C.dust }}>Получатель</p>
                      <p className="text-sm font-semibold" style={{ color: C.bark }}>
                        Валиев И.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Note */}
              <p className="text-xs text-center mb-5 leading-relaxed" style={{ color: C.dust }}>
                После оплаты напишите администратору в Telegram для подтверждения
              </p>

              {/* Action buttons */}
              <div className="space-y-2.5">
                <button
                  onClick={contactAdmin}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full font-semibold text-sm transition-all active:scale-95"
                  style={{ background: C.terra, color: '#fff' }}
                >
                  Написать администратору
                  <ChevronRight size={16} strokeWidth={2.5} />
                </button>

                <button
                  onClick={closePayment}
                  className="w-full py-3.5 rounded-full font-semibold text-sm transition-all active:scale-95"
                  style={{ background: C.petal, color: C.stone }}
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Keyframe animations ───────────────────────────────── */}
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
