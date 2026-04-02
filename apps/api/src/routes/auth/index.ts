import { FastifyInstance } from 'fastify';
import { telegramAuth } from './telegram.js';
import { adminLogin } from './admin-login.js';
import { refreshToken } from './refresh.js';

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/auth/telegram', telegramAuth);
  fastify.post('/auth/admin/login', adminLogin);
  fastify.post('/auth/refresh', refreshToken);
}
