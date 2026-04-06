'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../api/client';
import { haptic, hapticSuccess } from '../../utils/telegram';
import {
  Star,
  Clock,
  X,
  Calendar,
  ChevronRight,
  MapPin,
  User as UserIcon,
  Check,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react';

/* ────────────────────── Types ────────────────────── */

interface Booking {
  id: string;
  status: string;
  isTrial: boolean;
  class: {
    id: string;
    title: string;
    startsAt: string;
    durationMin: number;
    trainer?: { user?: { firstName: string } };
    direction?: { name: string };
  };
}

interface Review {
  classId: string;
  rating: number;
  text?: string;
}

/* ────────────────────── Palette ────────────────────── */

const C = {
  bg: '#FAF5EF',
  white: '#FFFFFF',
  bark: '#1C1810',
  stone: '#8B7355',
  dust: '#B8A898',
  terra: '#774936',
  border: '#EDE4D8',
  petal: '#F2E9DF',
  green: '#4CAF50',
  amber: '#F59E0B',
  red: '#EF4444',
  purple: '#662E9B',
  purpleLight: '#f3ecfb',
};

/* ────────────────────── Status maps ────────────────────── */

const statusLabel: Record<string, string> = {
  confirmed: 'Подтверждена',
  attended: 'Посещено',
  cancelled: 'Отменена',
  pending: 'Ожидание',
  no_show: 'Пропущено',
};

const statusStyle: Record<string, { bg: string; color: string }> = {
  confirmed: { bg: C.petal, color: C.terra },
  attended: { bg: '#EDF4EA', color: '#5E7A4E' },
  cancelled: { bg: '#FBF0EE', color: '#A05040' },
  pending: { bg: C.bg, color: C.stone },
  no_show: { bg: '#FBF0EE', color: C.red },
};

/* ────────────────────── Helpers ────────────────────── */

function formatDate(iso: string) {
  const d = new Date(iso);
  const time = d.toLocaleString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Tashkent',
  });
  const day = d.toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    timeZone: 'Asia/Tashkent',
  });
  return { time, day };
}

/* ────────────────────── Rating Modal ────────────────────── */

interface RatingModalProps {
  classId: string;
  classTitle: string;
  onClose: () => void;
  onSubmitted: () => void;
}

function RatingModal({ classId, classTitle, onClose, onSubmitted }: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);

  const mutation = useMutation({
    mutationFn: () =>
      apiFetch('/reviews', {
        method: 'POST',
        body: JSON.stringify({ classId, rating, text: text.trim() || undefined }),
      }),
    onSuccess: () => {
      hapticSuccess();
      onSubmitted();
    },
  });

  const activeStar = hoveredStar || rating;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(28, 24, 16, 0.5)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-lg rounded-t-3xl px-6 pt-6 pb-10 animate-slideUp"
        style={{ background: C.white }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-syne font-bold text-lg" style={{ color: C.bark }}>
            Оценить занятие
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: C.petal }}
          >
            <X size={16} color={C.stone} />
          </button>
        </div>

        {/* Class title */}
        <p className="text-sm mb-5" style={{ color: C.stone }}>
          {classTitle}
        </p>

        {/* Stars */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              onClick={() => {
                haptic('light');
                setRating(s);
              }}
              onMouseEnter={() => setHoveredStar(s)}
              onMouseLeave={() => setHoveredStar(0)}
              className="transition-transform active:scale-125"
              style={{ transform: activeStar >= s ? 'scale(1.1)' : 'scale(1)' }}
            >
              <Star
                size={32}
                fill={activeStar >= s ? C.amber : 'none'}
                color={activeStar >= s ? C.amber : C.border}
                strokeWidth={1.5}
              />
            </button>
          ))}
        </div>

        {/* Rating label */}
        {rating > 0 && (
          <p className="text-center text-xs mb-5 font-medium" style={{ color: C.stone }}>
            {rating === 1 && 'Плохо'}
            {rating === 2 && 'Ниже среднего'}
            {rating === 3 && 'Нормально'}
            {rating === 4 && 'Хорошо'}
            {rating === 5 && 'Отлично!'}
          </p>
        )}

        {/* Comment */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Оставьте комментарий..."
          rows={3}
          className="w-full rounded-2xl px-4 py-3 text-sm resize-none outline-none font-instrument"
          style={{
            background: C.bg,
            color: C.bark,
            border: `1px solid ${C.border}`,
          }}
        />

        {/* Submit */}
        <button
          onClick={() => mutation.mutate()}
          disabled={rating === 0 || mutation.isPending}
          className="w-full mt-4 py-3.5 rounded-2xl text-sm font-semibold transition-opacity disabled:opacity-40"
          style={{ background: C.terra, color: C.white }}
        >
          {mutation.isPending ? 'Отправка...' : 'Отправить'}
        </button>

        {mutation.isError && (
          <p className="text-xs text-center mt-2" style={{ color: C.red }}>
            Ошибка. Попробуйте ещё раз.
          </p>
        )}
      </div>

      {/* Slide-up animation */}
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

/* ────────────────────── Main Page ────────────────────── */

export default function MyBookingsPage() {
  const [tab, setTab] = useState<'upcoming' | 'history'>('upcoming');
  const [ratingTarget, setRatingTarget] = useState<{
    classId: string;
    classTitle: string;
  } | null>(null);

  const qc = useQueryClient();

  /* ── Bookings query ── */
  const { data, isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => apiFetch<{ data: Booking[] }>('/bookings'),
  });

  /* ── My reviews query ── */
  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', 'my'],
    queryFn: () => apiFetch<{ data: Review[] }>('/reviews/my'),
  });

  const reviewedMap = new Map<string, number>();
  (reviewsData?.data || []).forEach((r) => reviewedMap.set(r.classId, r.rating));

  /* ── Cancel mutation ── */
  const cancelMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/bookings/${id}/cancel`, { method: 'PATCH' }),
    onSuccess: () => {
      hapticSuccess();
      qc.invalidateQueries({ queryKey: ['bookings'] });
    },
  });

  /* ── Rating submitted handler ── */
  const handleReviewSubmitted = useCallback(() => {
    qc.invalidateQueries({ queryKey: ['reviews', 'my'] });
    qc.invalidateQueries({ queryKey: ['bookings'] });
    setRatingTarget(null);
  }, [qc]);

  /* ── Filter bookings ── */
  const now = new Date();
  const all = data?.data || [];

  const upcoming = all.filter(
    (b) =>
      b.status !== 'cancelled' &&
      b.status !== 'attended' &&
      new Date(b.class.startsAt) > now,
  );

  const history = all.filter(
    (b) =>
      b.status === 'attended' ||
      b.status === 'cancelled' ||
      new Date(b.class.startsAt) <= now,
  );

  const shown = tab === 'upcoming' ? upcoming : history;

  return (
    <div className="min-h-screen pb-28 font-instrument" style={{ background: C.bg }}>
      {/* ── Header ── */}
      <div
        className="px-5 pt-10 pb-4"
        style={{ background: C.white, boxShadow: '0 1px 0 #EDE4D8' }}
      >
        <h1 className="font-syne font-bold text-2xl mb-4" style={{ color: C.bark }}>
          Мои записи
        </h1>

        {/* Tabs */}
        <div className="flex gap-2 p-1 rounded-2xl" style={{ background: C.petal }}>
          {(['upcoming', 'history'] as const).map((t) => (
            <button
              key={t}
              onClick={() => {
                haptic();
                setTab(t);
              }}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: tab === t ? C.white : 'transparent',
                color: tab === t ? C.terra : C.stone,
                boxShadow:
                  tab === t ? '0 1px 4px rgba(28,24,16,0.08)' : 'none',
              }}
            >
              {t === 'upcoming' ? 'Предстоящие' : 'История'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Card list ── */}
      <div className="px-5 py-4 space-y-3">
        {isLoading && (
          <div className="text-center py-12" style={{ color: C.dust }}>
            Загрузка...
          </div>
        )}

        {!isLoading && shown.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">
              {tab === 'upcoming' ? (
                <Calendar size={40} color={C.dust} className="mx-auto" />
              ) : (
                <Clock size={40} color={C.dust} className="mx-auto" />
              )}
            </div>
            <p className="text-sm mt-4" style={{ color: C.dust }}>
              {tab === 'upcoming' ? 'Нет предстоящих записей' : 'История пуста'}
            </p>
          </div>
        )}

        {shown.map((b) => {
          const { time, day } = formatDate(b.class.startsAt);
          const canCancel =
            b.status === 'confirmed' && new Date(b.class.startsAt) > now;
          const st = statusStyle[b.status] || { bg: C.petal, color: C.stone };
          const isAttended = b.status === 'attended';
          const isReviewed = reviewedMap.has(b.class.id);
          const reviewRating = reviewedMap.get(b.class.id);

          return (
            <div
              key={b.id}
              className="rounded-2xl p-4"
              style={{
                background: C.white,
                boxShadow: '0 2px 12px rgba(28,24,16,0.06)',
              }}
            >
              {/* Top row: time + status badge */}
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5">
                  <Clock size={13} color={C.stone} />
                  <span className="text-xs font-medium" style={{ color: C.stone }}>
                    {time}, {day}
                  </span>
                </div>
                <span
                  className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: st.bg, color: st.color }}
                >
                  {statusLabel[b.status] || b.status}
                </span>
              </div>

              {/* Title */}
              <p
                className="font-syne font-bold text-[15px] leading-tight mb-1.5"
                style={{ color: C.bark }}
              >
                {b.class.title}
              </p>

              {/* Direction badge */}
              {b.class.direction?.name && (
                <span
                  className="inline-block text-[10px] font-medium px-2.5 py-0.5 rounded-full mr-2 mb-1.5"
                  style={{ background: C.purpleLight, color: C.purple }}
                >
                  {b.class.direction.name}
                </span>
              )}

              {/* Trial badge */}
              {b.isTrial && (
                <span
                  className="inline-block text-[10px] font-medium px-2.5 py-0.5 rounded-full mb-1.5"
                  style={{ background: C.petal, color: C.terra }}
                >
                  Пробное занятие
                </span>
              )}

              {/* Trainer */}
              {b.class.trainer?.user && (
                <div className="flex items-center gap-1.5 mt-1">
                  <UserIcon size={12} color={C.dust} />
                  <span className="text-xs" style={{ color: C.dust }}>
                    {b.class.trainer.user.firstName}
                  </span>
                </div>
              )}

              {/* Duration */}
              <div className="flex items-center gap-1.5 mt-1">
                <Clock size={12} color={C.dust} />
                <span className="text-xs" style={{ color: C.dust }}>
                  {b.class.durationMin} мин
                </span>
              </div>

              {/* ── Actions ── */}
              <div className="flex items-center gap-2 mt-3">
                {/* Cancel button for upcoming */}
                {canCancel && (
                  <button
                    onClick={() => {
                      haptic('medium');
                      cancelMutation.mutate(b.id);
                    }}
                    disabled={cancelMutation.isPending}
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl transition-opacity"
                    style={{ background: '#FBF0EE', color: '#A05040' }}
                  >
                    <X size={13} />
                    {cancelMutation.isPending ? 'Отмена...' : 'Отменить'}
                  </button>
                )}

                {/* Rate button for attended + not reviewed */}
                {isAttended && !isReviewed && (
                  <button
                    onClick={() => {
                      haptic();
                      setRatingTarget({
                        classId: b.class.id,
                        classTitle: b.class.title,
                      });
                    }}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-opacity"
                    style={{ background: C.petal, color: C.terra }}
                  >
                    <Star size={13} fill={C.amber} color={C.amber} />
                    Оценить
                  </button>
                )}

                {/* Reviewed badge */}
                {isAttended && isReviewed && (
                  <span
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl"
                    style={{ background: '#EDF4EA', color: '#5E7A4E' }}
                  >
                    <Star size={13} fill={C.amber} color={C.amber} />
                    Оценено {reviewRating?.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Rating Modal ── */}
      {ratingTarget && (
        <RatingModal
          classId={ratingTarget.classId}
          classTitle={ratingTarget.classTitle}
          onClose={() => setRatingTarget(null)}
          onSubmitted={handleReviewSubmitted}
        />
      )}
    </div>
  );
}
