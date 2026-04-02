import { PaymentMethod } from '../enums';
import { Subscription } from '../entities/subscription';

export interface CreateSubscriptionRequest {
  planId: string;
  paymentMethod: PaymentMethod;
  paymentId?: string;
}

export type SubscriptionResponse = Subscription & {
  remainingClasses: number;
  plan: {
    name: string;
    classesCount: number;
  };
};
