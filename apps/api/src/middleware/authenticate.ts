import { FastifyRequest, FastifyReply } from 'fastify';
import { AppError } from '../plugins/error-handler.js';

export interface JwtPayload {
  sub: string;
  telegramId?: number;
  role: string;
  type: 'access' | 'refresh';
}

declare module 'fastify' {
  interface FastifyRequest {
    userId: string;
    userRole: string;
  }
}

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    const decoded = await request.jwtVerify<JwtPayload>();
    if (decoded.type !== 'access') {
      throw new AppError(401, 'Unauthorized', 'Invalid token type');
    }
    request.userId = decoded.sub;
    request.userRole = decoded.role;
  } catch {
    throw new AppError(401, 'Unauthorized', 'Invalid or expired token');
  }
}
