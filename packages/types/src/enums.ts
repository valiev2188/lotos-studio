export enum UserRole {
  CLIENT = 'client',
  TRAINER = 'trainer',
  MANAGER = 'manager',
  ADMIN = 'admin',
}

export enum UserGoal {
  YOGA = 'yoga',
  PILATES = 'pilates',
  STRETCH = 'stretch',
  ANY = 'any',
}

export enum Language {
  RU = 'ru',
  UZ = 'uz',
}

export enum ClassLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ALL = 'all',
}

export enum ClassStatus {
  SCHEDULED = 'scheduled',
  CANCELLED = 'cancelled',
  DONE = 'done',
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  ATTENDED = 'attended',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  PAYME = 'payme',
  CLICK = 'click',
  CASH = 'cash',
  TG_PAY = 'tg_pay',
}

export enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  MANAGER = 'manager',
  TRAINER = 'trainer',
}

export enum NotificationType {
  BOOKING_CONFIRMED = 'booking_confirmed',
  REMINDER_24H = 'reminder_24h',
  REMINDER_1H = 'reminder_1h',
  CLASS_CANCELLED = 'class_cancelled',
  WAITLIST_SPOT = 'waitlist_spot',
  SUBSCRIPTION_EXPIRING = 'subscription_expiring',
  ADMIN_BROADCAST = 'admin_broadcast',
}

export enum NotificationChannel {
  TELEGRAM = 'telegram',
  SMS = 'sms',
}

export enum ExerciseDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}
