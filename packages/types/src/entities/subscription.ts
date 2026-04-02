import { SubscriptionStatus, PaymentMethod } from '../enums';
import { Plan } from './plan';

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  totalClasses: number;
  usedClasses: number;
  startsAt: Date | string;
  expiresAt: Date | string;
  paidAmount: number;
  paymentMethod: PaymentMethod;
  paymentId: string | null;
  status: SubscriptionStatus;
  createdAt: Date | string;
  updatedAt: Date | string;
  plan?: Plan;
  remainingClasses?: number;
}
