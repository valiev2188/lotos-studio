import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import cookie from '@fastify/cookie';
import rateLimit from '@fastify/rate-limit';
import prismaPlugin from './plugins/prisma.js';
import errorHandlerPlugin from './plugins/error-handler.js';
import { authRoutes } from './routes/auth/index.js';
import { userRoutes } from './routes/users/index.js';
import { scheduleRoutes } from './routes/schedule/index.js';
import { bookingRoutes } from './routes/bookings/index.js';
import { subscriptionRoutes } from './routes/subscriptions/index.js';
import { directionRoutes } from './routes/directions/index.js';
import { trainerRoutes } from './routes/trainers/index.js';
import { exerciseRoutes } from './routes/exercises/index.js';
import { adminRoutes } from './routes/admin/index.js';
import { reviewRoutes } from './routes/reviews/index.js';

const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || '0.0.0.0';

async function main() {
  const fastify = Fastify({
    logger: { level: process.env.NODE_ENV === 'production' ? 'info' : 'warn' },
  });

  // Plugins
  await fastify.register(cors, {
    origin: (origin, cb) => {
      const allowed = [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:3000',
        process.env.MINIAPP_URL,
        process.env.ADMIN_URL,
        process.env.LANDING_URL,
      ].filter(Boolean);

      // Allow all Vercel preview/production domains
      if (!origin || allowed.includes(origin) || /\.vercel\.app$/.test(origin)) {
        cb(null, true);
      } else {
        cb(new Error('Not allowed by CORS'), false);
      }
    },
    credentials: true,
  });

  await fastify.register(jwt, {
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-production-32ch',
  });

  await fastify.register(cookie);

  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  await fastify.register(errorHandlerPlugin);
  await fastify.register(prismaPlugin);

  // Routes
  await fastify.register(async (app) => {
    await app.register(authRoutes);
    await app.register(userRoutes);
    await app.register(scheduleRoutes);
    await app.register(bookingRoutes);
    await app.register(subscriptionRoutes);
    await app.register(directionRoutes);
    await app.register(trainerRoutes);
    await app.register(exerciseRoutes);
    await app.register(adminRoutes);
  }, { prefix: '/v1' });

  // Health check
  fastify.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

  // Start
  try {
    await fastify.listen({ port: PORT, host: HOST });
    console.log(`API server running on http://${HOST}:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

main();
