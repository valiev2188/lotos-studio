export interface Review {
  id: string;
  userId: string;
  trainerId: string | null;
  classId: string | null;
  rating: number;
  text: string | null;
  isPublished: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}
