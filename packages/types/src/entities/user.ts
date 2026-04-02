import { UserRole, UserGoal, Language } from '../enums';

export interface User {
  id: string;
  telegramId: bigint | number;
  firstName: string;
  lastName: string | null;
  phone: string | null;
  username: string | null;
  role: UserRole;
  goal: UserGoal | null;
  language: Language;
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt: Date | string | null;
}
