const BASE = '/api';

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
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
