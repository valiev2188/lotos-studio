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
  token: string | null;
  isAuthenticated: boolean;
  setAdmin: (admin: AdminUser, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      admin: null,
      token: null,
      isAuthenticated: false,
      setAdmin: (admin, token) => set({ admin, token, isAuthenticated: true }),
      logout: () => set({ admin: null, token: null, isAuthenticated: false }),
    }),
    { name: 'lotos-admin-auth' },
  ),
);
