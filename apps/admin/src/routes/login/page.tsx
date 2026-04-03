import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import { apiFetch } from '../../api/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAdmin } = useAuthStore();
  const navigate = useNavigate();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiFetch<{
        accessToken: string;
        user: { id: string; email: string; firstName: string; lastName?: string; role: string };
      }>(
        '/auth/admin/login',
        { method: 'POST', body: JSON.stringify({ email, password }) },
      );
      setAdmin(res.user, res.accessToken);
      navigate('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🪷</div>
          <h1 className="font-syne font-bold text-2xl text-cream">Студия Лотос</h1>
          <p className="text-cream/40 text-sm mt-1">Панель управления</p>
        </div>

        <form onSubmit={handleLogin} className="bg-dark-100 rounded-2xl p-6 space-y-4">
          <div>
            <label className="text-cream/60 text-xs font-instrument mb-1.5 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@lotos-studio.uz"
              className="input"
              required
            />
          </div>
          <div>
            <label className="text-cream/60 text-xs font-instrument mb-1.5 block">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input"
              required
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center bg-red-500/10 rounded-xl py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-base"
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  );
}
