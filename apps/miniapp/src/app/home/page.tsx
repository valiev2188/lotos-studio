import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../stores/useUserStore';
import { apiFetch } from '../../api/client';
import { haptic } from '../../utils/telegram';
import {
  Trophy, Flame, TrendingUp, CalendarDays, Bookmark, Users, BookOpen,
  ChevronRight, Clock, User,
} from 'lucide-react';

const C = {
  bg: '#FAF5EF', white: '#FFFFFF', bark: '#1C1810',
  stone: '#8B7355', dust: '#B8A898', terra: '#774936', border: '#EDE4D8',
  petal: '#F2E9DF', green: '#4CAF50', amber: '#F59E0B', red: '#EF4444',
  purple: '#662E9B', purpleLight: '#f3ecfb',
};

interface ClassItem {
  id: string;
  title: string;
  startsAt: string;
  durationMin: number;
  trainer?: { user?: { firstName: string } };
  maxSpots: number;
  _count?: { bookings: number };
}

interface UserStats {
  totalClasses: number;
  currentStreak: number;
  thisMonth: number;
}

interface Subscription {
  id: string;
  plan: { name: string; classesTotal: number };
  usedClasses: number;
  totalClasses: number;
  expiresAt: string;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'Доброе утро';
  if (h >= 12 && h < 18) return 'Добрый день';
  return 'Добрый вечер';
}

const QUICK_ACTIONS = [
  { label: 'Расписание',  Icon: CalendarDays, path: '/schedule' },
  { label: 'Мои записи',  Icon: Bookmark,     path: '/my-bookings' },
  { label: 'Тренеры',     Icon: Users,         path: '/trainers' },
  { label: 'Упражнения',  Icon: BookOpen,      path: '/exercises' },
] as const;

export default function HomePage() {
  const { user } = useUserStore();
  const navigate = useNavigate();
  const today = new Date().toISOString().slice(0, 10);
  const weekLater = new Date(Date.now() + 7 * 86400_000).toISOString().slice(0, 10);

  const { data: stats } = useQuery({
    queryKey: ['user-stats'],
    queryFn: () => apiFetch<UserStats>('/users/me/stats'),
  });

  const { data: subscriptions } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => apiFetch<Subscription[]>('/subscriptions'),
  });

  const { data: scheduleData } = useQuery({
    queryKey: ['schedule-home'],
    queryFn: () => apiFetch<{ data: ClassItem[] }>(`/schedule?dateFrom=${today}&dateTo=${weekLater}`),
  });

  const activeSub = Array.isArray(subscriptions) ? subscriptions[0] : null;
  const classes = (scheduleData?.data || []).slice(0, 3);

  return (
    <div className="min-h-screen pb-28 font-instrument" style={{ background: C.bg }}>
      {/* Welcome section */}
      <div className="px-5 pt-10 pb-2">
        <p className="text-sm mb-0.5" style={{ color: C.stone }}>
          {getGreeting()}
        </p>
        <h1 className="font-syne font-bold text-2xl" style={{ color: C.bark }}>
          {user?.firstName ? `Привет, ${user.firstName}!` : 'Добро пожаловать!'}
        </h1>
      </div>

      {/* Stats row */}
      <div className="px-5 py-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Занятий',  value: stats?.totalClasses ?? 0,  Icon: Trophy },
            { label: 'Streak',   value: stats?.currentStreak ?? 0, Icon: Flame },
            { label: 'В месяце', value: stats?.thisMonth ?? 0,     Icon: TrendingUp },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl p-4 text-center"
              style={{ background: C.white, boxShadow: '0 2px 12px rgba(28,24,16,0.06)' }}
            >
              <div className="flex justify-center mb-2">
                <s.Icon size={18} color={C.terra} strokeWidth={1.8} />
              </div>
              <div className="font-syne font-bold text-xl" style={{ color: C.bark }}>
                {s.value}
              </div>
              <div className="text-[11px] mt-0.5" style={{ color: C.dust }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Active subscription card */}
      <div className="px-5 mb-4">
        {activeSub ? (
          <div
            className="rounded-2xl p-5"
            style={{ background: C.white, boxShadow: '0 2px 12px rgba(28,24,16,0.06)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-syne font-bold text-sm" style={{ color: C.bark }}>
                {activeSub.plan.name}
              </h3>
              <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: C.petal, color: C.terra }}>
                Активен
              </span>
            </div>
            <div className="mb-2">
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: C.stone }}>
                  {activeSub.usedClasses} / {activeSub.totalClasses} занятий
                </span>
                <span style={{ color: C.dust }}>
                  {Math.round((activeSub.usedClasses / activeSub.totalClasses) * 100)}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full" style={{ background: C.border }}>
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min((activeSub.usedClasses / activeSub.totalClasses) * 100, 100)}%`,
                    background: C.terra,
                  }}
                />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <Clock size={12} color={C.dust} strokeWidth={1.8} />
              <span className="text-xs" style={{ color: C.dust }}>
                до {new Date(activeSub.expiresAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
              </span>
            </div>
          </div>
        ) : (
          <div
            className="rounded-2xl p-5 text-center"
            style={{ background: C.white, boxShadow: '0 2px 12px rgba(28,24,16,0.06)' }}
          >
            <p className="text-sm mb-3" style={{ color: C.dust }}>Нет абонемента</p>
            <button
              onClick={() => { haptic('medium'); navigate('/subscriptions'); }}
              className="font-semibold text-sm px-6 py-2.5 rounded-full transition-all active:scale-95"
              style={{ background: C.terra, color: '#fff' }}
            >
              Купить абонемент
            </button>
          </div>
        )}
      </div>

      {/* Promo banner */}
      <div
        className="mx-5 mb-6 rounded-3xl p-5 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #774936 0%, #5C3628 100%)' }}
      >
        <p
          className="text-[11px] tracking-widest uppercase mb-1 font-medium"
          style={{ color: 'rgba(250,245,239,0.6)' }}
        >
          Специальное предложение
        </p>
        <h2
          className="font-syne font-bold text-lg leading-tight mb-3"
          style={{ color: '#FAF5EF' }}
        >
          Первое занятие — бесплатно
        </h2>
        <button
          onClick={() => { haptic('medium'); navigate('/schedule'); }}
          className="flex items-center gap-1.5 text-sm font-semibold px-5 py-2.5 rounded-full active:scale-95 transition-all"
          style={{ background: '#FAF5EF', color: C.terra }}
        >
          Записаться
          <ChevronRight size={16} strokeWidth={2} />
        </button>
        <div
          className="absolute -right-3 -bottom-3 text-6xl opacity-10 select-none"
          style={{ fontSize: 80 }}
        >
          🪷
        </div>
      </div>

      {/* Quick actions */}
      <div className="px-5 mb-6">
        <h2 className="font-syne font-bold text-base mb-3" style={{ color: C.bark }}>
          Быстрые действия
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {QUICK_ACTIONS.map((a) => (
            <button
              key={a.label}
              onClick={() => { haptic(); navigate(a.path); }}
              className="flex items-center gap-3 p-4 rounded-2xl text-left active:scale-95 transition-all"
              style={{ background: C.white, boxShadow: '0 2px 12px rgba(28,24,16,0.06)' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: C.petal }}
              >
                <a.Icon size={20} color={C.terra} strokeWidth={1.8} />
              </div>
              <span className="font-medium text-sm" style={{ color: C.bark }}>{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Upcoming classes */}
      <div className="px-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-syne font-bold text-base" style={{ color: C.bark }}>
            Ближайшие занятия
          </h2>
          <button
            onClick={() => navigate('/schedule')}
            className="flex items-center gap-0.5 text-sm font-medium"
            style={{ color: C.terra }}
          >
            Все
            <ChevronRight size={16} strokeWidth={2} />
          </button>
        </div>

        {classes.length === 0 && (
          <div className="text-center py-12" style={{ color: C.dust }}>
            <CalendarDays size={36} className="mx-auto mb-3 opacity-40" color={C.dust} strokeWidth={1.5} />
            <p className="text-sm">Занятия скоро появятся</p>
          </div>
        )}

        <div className="space-y-3">
          {classes.map((c) => {
            const dt = new Date(c.startsAt);
            const time = dt.toLocaleString('ru-RU', {
              weekday: 'short', day: 'numeric', month: 'short',
              hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tashkent',
            });
            return (
              <div
                key={c.id}
                className="flex items-center justify-between p-4 rounded-2xl"
                style={{ background: C.white, boxShadow: '0 2px 12px rgba(28,24,16,0.06)' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: C.petal }}
                  >
                    <Clock size={18} color={C.terra} strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: C.bark }}>{c.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: C.stone }}>{time}</p>
                    {c.trainer?.user && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <User size={10} color={C.dust} strokeWidth={2} />
                        <p className="text-xs" style={{ color: C.dust }}>
                          {c.trainer.user.firstName}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => { haptic('medium'); navigate('/schedule'); }}
                  className="text-xs font-semibold px-4 py-2 rounded-full active:scale-95 transition-all flex-shrink-0"
                  style={{ background: C.terra, color: '#fff' }}
                >
                  Записаться
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
