import { create } from 'zustand';
import { setTokens, clearTokens, apiFetch } from '../api/client';
import { getInitData } from '../utils/telegram';

interface UserState {
  user: Record<string, any> | null;
  isNewUser: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => void;
  setUser: (user: Record<string, any>) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isNewUser: false,
  isLoading: false,
  isAuthenticated: !!localStorage.getItem('access_token'),

  login: async () => {
    set({ isLoading: true });
    try {
      const initData = getInitData() || 'dev_bypass';
      const data = await apiFetch<{
        accessToken: string;
        refreshToken: string;
        user: Record<string, any>;
        isNewUser: boolean;
      }>('/auth/telegram', {
        method: 'POST',
        body: JSON.stringify({ initData }),
      });
      setTokens(data.accessToken, data.refreshToken);
      set({ user: data.user, isNewUser: data.isNewUser, isAuthenticated: true });
    } catch (e) {
      console.error('Auth failed', e);
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    clearTokens();
    set({ user: null, isAuthenticated: false });
  },

  setUser: (user) => set({ user, isNewUser: false }),
}));
