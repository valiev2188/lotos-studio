import { FastifyRequest, FastifyReply } from 'fastify';
import { AppError } from '../plugins/error-handler.js';

interface AdminJwtPayload {
  sub: string;
  email: string;
  role: string;
  type: 'access';
}

declare module 'fastify' {
  interface FastifyRequest {
    adminId: string;
    adminRole: string;
  }
}

export async function adminAuth(request: FastifyRequest, _reply: FastifyReply) {
  try {
    const decoded = await request.jwtVerify<AdminJwtPayload>();
    if (decoded.type !== 'access') {
      throw new AppError(401, 'Unauthorized', 'Invalid token type');
    }
    request.adminId = decoded.sub;
    request.adminRole = decoded.role;
  } catch {
    throw new AppError(401, 'Unauthorized', 'Admin authentication required');
  }
}

const PERMISSIONS: Record<string, string[]> = {
  super_admin: [
    'schedule',
    'clients',
    'finance',
    'settings',
    'trainers',
    'notifications',
    'analytics',
  ],
  manager: ['schedule', 'clients', 'bookings', 'notifications'],
  trainer: ['schedule:own', 'clients:own', 'exercises:own'],
};

export function requirePermission(resource: string) {
  return async (request: FastifyRequest, _reply: FastifyReply) => {
    const permissions = PERMISSIONS[request.adminRole] ?? [];
    const hasAccess =
      permissions.includes(resource) || permissions.includes(`${resource}:own`);

    if (!hasAccess) {
      throw new AppError(403, 'Forbidden', 'Insufficient permissions');
    }
  };
}
