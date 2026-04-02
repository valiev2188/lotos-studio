import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  role: string;
}

interface AuthState {
  admin: AdminUser | null;
  isAuthenticated: boolean;
  setAdmin: (admin: AdminUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      admin: null,
      isAuthenticated: false,
      setAdmin: (admin) => set({ admin, isAuthenticated: true }),
      logout: () => {
        fetch('/api/auth/admin/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
        set({ admin: null, isAuthenticated: false });
      },
    }),
    { name: 'lotos-admin-auth' },
  ),
);
