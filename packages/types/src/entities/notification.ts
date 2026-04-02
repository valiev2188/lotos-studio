import { NotificationType, NotificationChannel } from '../enums';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  channel: NotificationChannel;
  payload: Record<string, unknown>;
  sentAt: Date | string | null;
  readAt: Date | string | null;
  createdAt: Date | string;
}
