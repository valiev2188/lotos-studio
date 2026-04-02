import { BookingStatus } from '../enums';
import { Class } from './class';
import { Subscription } from './subscription';

export interface Booking {
  id: string;
  userId: string;
  classId: string;
  subscriptionId: string | null;
  status: BookingStatus;
  isTrial: boolean;
  cancelledAt: Date | string | null;
  cancelReason: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  class?: Class;
  subscription?: Subscription;
}
