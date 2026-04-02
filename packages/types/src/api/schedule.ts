import { ClassLevel, ClassStatus } from '../enums';
import { Class } from '../entities/class';

export interface GetScheduleQuery {
  dateFrom: string;
  dateTo: string;
  directionId?: string;
  trainerId?: string;
  level?: ClassLevel;
}

export interface CreateClassRequest {
  trainerId: string;
  directionId: string;
  title: string;
  description?: string;
  startsAt: string;
  durationMin: number;
  maxSpots: number;
  level: ClassLevel;
  room?: string;
  recurrence?: {
    freq: 'weekly' | 'biweekly';
    until: string;
  };
}

export interface UpdateClassRequest {
  trainerId?: string;
  directionId?: string;
  title?: string;
  description?: string;
  startsAt?: string;
  durationMin?: number;
  maxSpots?: number;
  level?: ClassLevel;
  status?: ClassStatus;
  room?: string;
}

export interface ClassDetailResponse extends Class {
  bookedCount: number;
  availableSpots: number;
  isUserBooked?: boolean;
  attendees?: Array<{
    userId: string;
    firstName: string;
    lastName: string | null;
    status: string;
  }>;
}
