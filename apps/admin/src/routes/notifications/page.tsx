import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiFetch } from '../../api/client';
import Header from '../../components/layout/Header';

const SEGMENTS = [
  { value: 'all', label: 'Все клиенты' },
  { value: 'active_subscribers', label: 'Активные абонементы' },
  { value: 'no_subscription', label: 'Без абонемента' },
  { value: 'not_visited_30d', label: 'Не приходили 30+ дней' },
];

export default function NotificationsPage() {
  const [segment, setSegment] = useState('all');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const broadcastMutation = useMutation({
    mutationFn: () =>
      apiFetch('/admin/notifications/broadcast', {
        method: 'POST',
        body: JSON.stringify({ segment, message }),
      }),
    onSuccess: () => {
      setSent(true);
      setMessage('');
      setTimeout(() => setSent(false), 4000);
    },
  });

  return (
    <div>
      <Header title="Рассылки" />

      <div className="max-w-lg">
        <div className="card">
          <div className="font-syne font-bold text-cream mb-4">Новая рассылка</div>

          <div className="mb-4">
            <label className="text-cream/50 text-xs mb-2 block">Сегмент получателей</label>
            <div className="space-y-2">
              {SEGMENTS.map((s) => (
                <label key={s.value} className="flex items-center gap-3 cursor-pointer group">
                  <div
                    className={`w-4 h-4 rounded-full border-2 transition-colors ${
                      segment === s.value
                        ? 'border-purple bg-purple'
                        : 'border-dark-50 group-hover:border-purple/50'
                    }`}
                    onClick={() => setSegment(s.value)}
                  />
                  <span
                    className={`text-sm font-instrument ${segment === s.value ? 'text-cream' : 'text-cream/60'}`}
                    onClick={() => setSegment(s.value)}
                  >
                    {s.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="text-cream/50 text-xs mb-1.5 block">Текст сообщения</label>
            <textarea
              className="input min-h-[120px] resize-none"
              placeholder="Введите текст уведомления..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <div className="text-cream/20 text-xs mt-1 text-right">{message.length} символов</div>
          </div>

          {sent && (
            <div className="mb-4 bg-green-500/10 text-green-400 text-sm text-center py-2.5 rounded-xl">
              Рассылка отправлена успешно
            </div>
          )}

          <button
            onClick={() => broadcastMutation.mutate()}
            disabled={!message.trim() || broadcastMutation.isPending}
            className="btn-primary w-full py-3"
          >
            {broadcastMutation.isPending ? 'Отправка...' : 'Отправить рассылку'}
          </button>
        </div>

        <div className="card mt-4">
          <div className="font-syne font-bold text-cream mb-2">Как работают рассылки</div>
          <ul className="text-cream/40 text-sm space-y-1.5">
            <li>• Сообщения доставляются через Telegram бота</li>
            <li>• Только клиентам, запустившим бота (@lotos_bot)</li>
            <li>• Сегмент "Все клиенты" — все зарегистрированные пользователи</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
