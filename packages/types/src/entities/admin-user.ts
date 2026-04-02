import { AdminRole } from '../enums';

export interface AdminUser {
  id: string;
  email: string;
  role: AdminRole;
  firstName: string;
  lastName: string | null;
  isActive: boolean;
  lastLoginAt: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface AdminAuditLog {
  id: string;
  adminUserId: string;
  action: string;
  entityType: string;
  entityId: string | null;
  changes: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: Date | string;
}
