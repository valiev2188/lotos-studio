import { ClassLevel, ClassStatus } from '../enums';
import { Trainer } from './trainer';
import { Direction } from './direction';

export interface Recurrence {
  freq: 'weekly' | 'biweekly';
  until: string;
}

export interface Class {
  id: string;
  trainerId: string;
  directionId: string;
  title: string;
  description: string | null;
  startsAt: Date | string;
  durationMin: number;
  maxSpots: number;
  level: ClassLevel;
  status: ClassStatus;
  recurrence: Recurrence | null;
  room: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt: Date | string | null;
  trainer?: Trainer;
  direction?: Direction;
  bookedCount?: number;
  availableSpots?: number;
}
