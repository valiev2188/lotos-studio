import { User } from '../entities/user';
import { AdminUser } from '../entities/admin-user';

export interface TelegramAuthRequest {
  initData: string;
}

export interface TelegramAuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  isNewUser: boolean;
}

export interface AdminLoginRequest {
  email: string;
  password: string;
  totpCode?: string;
}

export interface AdminLoginResponse {
  accessToken: string;
  user: AdminUser;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}
