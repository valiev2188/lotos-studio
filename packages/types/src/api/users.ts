import { UserGoal, Language } from '../enums';
import { User } from '../entities/user';

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  goal?: UserGoal;
  language?: Language;
}

export interface UserStatsResponse {
  totalClasses: number;
  currentStreak: number;
  longestStreak: number;
  favoriteDirections: Array<{
    directionId: string;
    directionName: string;
    count: number;
  }>;
  thisMonth: number;
  memberSince: string;
}

export type GetMeResponse = User;
