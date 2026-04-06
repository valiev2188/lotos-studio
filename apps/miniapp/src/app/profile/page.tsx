import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../stores/useUserStore';
import { apiFetch } from '../../api/client';
import { haptic } from '../../utils/telegram';
import {
  Trophy, Flame, Heart, ChevronRight, LogOut, Clock, Bell, Settings,
} from 'lucide-react';

const C = {
  bg: '#FAF5EF', white: '#FFFFFF', bark: '#1C1810',
  stone: '#8B7355', dust: '#B8A898', terra: '#774936', border: '#EDE4D8',
  petal: '#F2E9DF', green: '#4CAF50', amber: '#F59E0B', red: '#EF4444',
  purple: '#662E9B', purpleLight: '#f3ecfb',
};

interface UserStats {
  totalClasses: number;
  currentStreak: number;
  thisMonth: number;
  favoriteDirections?: string[];
}

interface Subscription {
  id: string;
  plan: { name: string; classesTotal: number };
  usedClasses: number;
  totalClasses: number;
  expiresAt: string;
}

const MONTH_TARGET = 12;

export default function ProfilePage() {
  const { user, logout } = useUserStore();
  const navigate = useNavigate();
  const name = user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : 'Пользователь';
  const initial = (user?.firstName ?? 'П')[0].toUpperCase();

  const currentYear = new Date().getFullYear();
  const age = user?.birthYear ? currentYear - Number(user.birthYear) : null;

  const { data: stats } = useQuery({
    queryKey: ['user-stats'],
    queryFn: () => apiFetch<UserStats>('/users/me/stats'),
  });

  const { data: subscriptions } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => apiFetch<Subscription[]>('/subscriptions'),
  });

  const activeSub = Array.isArray(subscriptions) ? subscriptions[0] : null;
  const monthProgress = stats ? Math.min((stats.thisMonth / MONTH_TARGET) * 100, 100) : 0;

  return (
    <div className="min-h-screen pb-28 font-instrument" style={{ background: C.bg }}>
      {/* Header */}
      <div
        className="px-5 pt-10 pb-6"
        style={{ background: C.white, boxShadow: '0 1px 0 #EDE4D8' }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-syne font-bold flex-shrink-0"
            style={{ background: C.terra, color: '#fff' }}
          >
            {initial}
          </div>
          <div>
            <h1 className="font-syne font-bold text-xl" style={{ color: C.bark }}>{name}</h1>
            {user?.phone && (
              <p className="text-sm mt-0.5" style={{ color: C.dust }}>{user.phone as string}</p>
            )}
            {age && (
              <p className="text-xs mt-0.5" style={{ color: C.stone }}>
                {user.birthYear} г.р. ({age} {age % 10 === 1 && age % 100 !== 11 ? 'год' : (age % 10 >= 2 && age % 10 <= 4 && (age % 100 < 10 || age % 100 >= 20)) ? 'года' : 'лет'})
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Month progress */}
      <div className="px-5 pt-5 pb-2">
        <div
          className="rounded-2xl p-5"
          style={{ background: C.white, boxShadow: '0 2px 12px rgba(28,24,16,0.06)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-syne font-bold text-sm" style={{ color: C.bark }}>
              Ваш прогресс этого месяца
            </h3>
            <span className="text-xs font-medium" style={{ color: C.terra }}>
              {stats?.thisMonth ?? 0} / {MONTH_TARGET}
            </span>
          </div>
          <div className="w-full h-3 rounded-full" style={{ background: C.border }}>
            <div
              className="h-3 rounded-full transition-all duration-500"
              style={{
                width: `${monthProgress}%`,
                background: monthProgress >= 100
                  ? C.green
                  : `linear-gradient(90deg, ${C.terra}, ${C.purple})`,
              }}
            />
          </div>
          <p className="text-xs mt-2" style={{ color: C.dust }}>
            {monthProgress >= 100
              ? 'Цель достигнута! Отличная работа'
              : `Ещё ${MONTH_TARGET - (stats?.thisMonth ?? 0)} до цели`}
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="px-5 py-4">
        <div className="grid grid-cols-3 gap-3">
          <div
            className="rounded-2xl p-4 text-center"
            style={{ background: C.white, boxShadow: '0 2px 12px rgba(28,24,16,0.06)' }}
          >
            <div className="flex justify-center mb-2">
              <Trophy size={18} color={C.terra} strokeWidth={1.8} />
            </div>
            <div className="font-syne font-bold text-xl" style={{ color: C.bark }}>
              {stats?.totalClasses ?? 0}
            </div>
            <div className="text-[11px] mt-0.5" style={{ color: C.dust }}>Всего занятий</div>
          </div>

          <div
            className="rounded-2xl p-4 text-center"
            style={{ background: C.white, boxShadow: '0 2px 12px rgba(28,24,16,0.06)' }}
          >
            <div className="flex justify-center mb-2">
              <Flame size={18} color={C.amber} strokeWidth={1.8} />
            </div>
            <div className="font-syne font-bold text-xl" style={{ color: C.bark }}>
              {stats?.currentStreak ?? 0}
            </div>
            <div className="text-[11px] mt-0.5" style={{ color: C.dust }}>Streak</div>
          </div>

          <div
            className="rounded-2xl p-4 text-center"
            style={{ background: C.white, boxShadow: '0 2px 12px rgba(28,24,16,0.06)' }}
          >
            <div className="flex justify-center mb-2">
              <Heart size={18} color={C.red} strokeWidth={1.8} />
            </div>
            <div className="font-syne font-bold text-sm leading-tight" style={{ color: C.bark }}>
              {stats?.favoriteDirections?.[0] ?? '—'}
            </div>
            <div className="text-[11px] mt-0.5" style={{ color: C.dust }}>Любимое</div>
          </div>
        </div>
      </div>

      {/* Active subscription */}
      <div className="px-5 pb-4">
        <h2 className="font-syne font-bold text-base mb-3" style={{ color: C.bark }}>Абонемент</h2>
        {activeSub ? (
          <div
            className="rounded-2xl p-5"
            style={{ background: C.white, boxShadow: '0 2px 12px rgba(28,24,16,0.06)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-syne font-bold text-sm" style={{ color: C.bark }}>
                {activeSub.plan.name}
              </h3>
              <span
                className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{ background: C.petal, color: C.terra }}
              >
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
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-1">
                <Clock size={12} color={C.dust} strokeWidth={1.8} />
                <span className="text-xs" style={{ color: C.dust }}>
                  до {new Date(activeSub.expiresAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                </span>
              </div>
              <span className="text-xs font-medium" style={{ color: C.stone }}>
                {Math.max(0, Math.ceil((new Date(activeSub.expiresAt).getTime() - Date.now()) / 86400_000))} дн. осталось
              </span>
            </div>
          </div>
        ) : (
          <div
            className="rounded-2xl p-5 text-center"
            style={{ background: C.white, boxShadow: '0 2px 12px rgba(28,24,16,0.06)' }}
          >
            <p className="text-sm py-2" style={{ color: C.dust }}>
              У вас нет активного абонемента
            </p>
            <button
              onClick={() => { haptic('medium'); navigate('/subscriptions'); }}
              className="w-full font-semibold py-3 rounded-full text-sm mt-2 transition-all active:scale-95"
              style={{ background: C.terra, color: '#fff' }}
            >
              Купить абонемент
            </button>
          </div>
        )}
      </div>

      {/* Settings */}
      <div className="px-5 pb-8">
        <h2 className="font-syne font-bold text-base mb-3" style={{ color: C.bark }}>Настройки</h2>
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: C.white, boxShadow: '0 2px 12px rgba(28,24,16,0.06)' }}
        >
          {[
            { label: 'Язык', value: 'Русский', Icon: Settings },
            { label: 'Уведомления', value: 'Включены', Icon: Bell },
          ].map((item, i) => (
            <button
              key={item.label}
              onClick={() => haptic()}
              className="w-full flex items-center justify-between px-4 py-4 text-left"
              style={{ borderTop: i > 0 ? `1px solid ${C.border}` : 'none' }}
            >
              <div className="flex items-center gap-3">
                <item.Icon size={18} color={C.stone} strokeWidth={1.8} />
                <span className="text-sm" style={{ color: C.bark }}>{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: C.dust }}>{item.value}</span>
                <ChevronRight size={16} color={C.dust} strokeWidth={1.8} />
              </div>
            </button>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={() => { haptic('medium'); logout(); navigate('/'); }}
          className="w-full mt-4 flex items-center justify-center gap-2 font-semibold py-4 rounded-2xl text-sm transition-all active:scale-95"
          style={{ background: '#FBF0EE', color: C.red }}
        >
          <LogOut size={18} strokeWidth={1.8} />
          Выйти
        </button>
      </div>
    </div>
  );
}
