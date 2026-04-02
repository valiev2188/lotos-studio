export interface WaitlistEntry {
  id: string;
  userId: string;
  classId: string;
  position: number;
  notifiedAt: Date | string | null;
  createdAt: Date | string;
}
