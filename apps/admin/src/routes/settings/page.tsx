import { useState } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import Header from '../../components/layout/Header';

export default function SettingsPage() {
  const { admin } = useAuthStore();
  const [tab, setTab] = useState<'studio' | 'account'>('studio');

  return (
    <div>
      <Header title="Настройки" />

      <div className="flex gap-2 mb-6">
        {(['studio', 'account'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-sm px-4 py-2 rounded-xl font-instrument font-medium transition-colors ${
              tab === t ? 'bg-purple text-cream' : 'bg-dark-100 text-cream/50 hover:text-cream'
            }`}
          >
            {t === 'studio' ? 'Студия' : 'Аккаунт'}
          </button>
        ))}
      </div>

      {tab === 'studio' && (
        <div className="max-w-lg space-y-4">
          <div className="card">
            <div className="font-syne font-bold text-cream mb-4">Информация о студии</div>
            <div className="space-y-3">
              <div>
                <label className="text-cream/50 text-xs mb-1 block">Название</label>
                <input defaultValue="Студия Лотос" className="input" />
              </div>
              <div>
                <label className="text-cream/50 text-xs mb-1 block">Адрес</label>
                <input defaultValue="Ташкент, Узбекистан" className="input" />
              </div>
              <div>
                <label className="text-cream/50 text-xs mb-1 block">Телефон</label>
                <input defaultValue="+998 90 000 00 00" className="input" />
              </div>
            </div>
            <button className="btn-primary mt-4">Сохранить</button>
          </div>

          <div className="card">
            <div className="font-syne font-bold text-cream mb-2">Telegram бот</div>
            <div className="text-cream/40 text-sm">@lotos_bot</div>
            <div className="text-cream/30 text-xs mt-1">Бот используется для уведомлений и Mini App</div>
          </div>
        </div>
      )}

      {tab === 'account' && (
        <div className="max-w-lg space-y-4">
          <div className="card">
            <div className="font-syne font-bold text-cream mb-4">Аккаунт администратора</div>
            <div className="space-y-3">
              <div>
                <label className="text-cream/50 text-xs mb-1 block">Имя</label>
                <input defaultValue={admin?.firstName} className="input" />
              </div>
              <div>
                <label className="text-cream/50 text-xs mb-1 block">Email</label>
                <input defaultValue={admin?.email} className="input" disabled />
              </div>
              <div>
                <label className="text-cream/50 text-xs mb-1 block">Роль</label>
                <div className="input opacity-50">{admin?.role}</div>
              </div>
            </div>
            <button className="btn-primary mt-4">Сохранить</button>
          </div>

          <div className="card">
            <div className="font-syne font-bold text-cream mb-4">Изменить пароль</div>
            <div className="space-y-3">
              <input type="password" placeholder="Текущий пароль" className="input" />
              <input type="password" placeholder="Новый пароль" className="input" />
              <input type="password" placeholder="Повторите новый пароль" className="input" />
            </div>
            <button className="btn-secondary mt-4">Изменить пароль</button>
          </div>
        </div>
      )}
    </div>
  );
}
