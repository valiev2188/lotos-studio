import { User } from './user';

export interface Trainer {
  id: string;
  userId: string;
  bio: string | null;
  experienceYears: number;
  photoUrl: string | null;
  certifications: string[];
  specializations: string[];
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  user?: User;
}
