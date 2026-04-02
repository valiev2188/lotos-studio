import { BookingStatus } from '../enums';
import { Booking } from '../entities/booking';

export interface GetBookingsQuery {
  status?: BookingStatus;
  limit?: number;
  page?: number;
}

export interface CreateBookingRequest {
  classId: string;
  isTrial?: boolean;
  subscriptionId?: string;
}

export interface CreateBookingResponse extends Booking {
  class: {
    title: string;
    startsAt: string;
    durationMin: number;
    trainerName: string;
    directionName: string;
  };
}

export interface CancelBookingResponse {
  success: true;
  refundedToSubscription: boolean;
  message: string;
}
