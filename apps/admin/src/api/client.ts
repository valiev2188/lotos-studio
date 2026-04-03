const RAILWAY_API = import.meta.env.VITE_API_URL || '';
const BASE = RAILWAY_API ? `${RAILWAY_API}/v1` : '/api';

function getToken(): string | null {
  try {
    const raw = localStorage.getItem('lotos-admin-auth');
    return raw ? (JSON.parse(raw) as { state?: { token?: string } }).state?.token ?? null : null;
  } catch {
    return null;
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || `HTTP ${res.status}`);
  }

  return data as T;
}
