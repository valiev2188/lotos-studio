declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        initDataUnsafe: {
          user?: { id: number; first_name: string; last_name?: string; username?: string };
          start_param?: string;
        };
        ready(): void;
        expand(): void;
        close(): void;
        BackButton: { show(): void; hide(): void; onClick(cb: () => void): void; offClick(cb: () => void): void; isVisible: boolean };
        HapticFeedback: {
          impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
          notificationOccurred(type: 'error' | 'success' | 'warning'): void;
        };
        themeParams: { bg_color?: string; text_color?: string; button_color?: string };
        colorScheme: 'light' | 'dark';
        isExpanded: boolean;
      };
    };
  }
}

export const twa = window.Telegram?.WebApp;

export function initTelegram() {
  if (!twa) return;
  twa.ready();
  twa.expand();
}

export function haptic(style: 'light' | 'medium' | 'heavy' = 'light') {
  twa?.HapticFeedback.impactOccurred(style);
}

export function hapticSuccess() {
  twa?.HapticFeedback.notificationOccurred('success');
}

export function getInitData(): string {
  return twa?.initData || '';
}

export function getTelegramUser() {
  return twa?.initDataUnsafe?.user || null;
}

export function getStartParam(): string {
  return twa?.initDataUnsafe?.start_param || '';
}

export const isTelegram = !!window.Telegram?.WebApp;
