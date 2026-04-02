export interface Plan {
  id: string;
  name: string;
  description: string | null;
  classesCount: number;
  price: number;
  validityDays: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}
