import { ExerciseDifficulty } from '../enums';
import { Trainer } from './trainer';

export interface Exercise {
  id: string;
  trainerId: string;
  title: string;
  description: string | null;
  category: string;
  difficulty: ExerciseDifficulty;
  content: string;
  mediaUrl: string | null;
  isPublished: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  trainer?: Trainer;
}
