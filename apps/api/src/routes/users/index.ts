import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authenticate } from '../../middleware/authenticate.js';

export async function userRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', authenticate);

  fastify.get('/users/me', async (request, reply) => {
    const user = await fastify.prisma.user.findUnique({
      where: { id: request.userId },
      include: {
        trainer: true,
        subscriptions: {
          where: { status: 'active', expiresAt: { gt: new Date() } },
          include: { plan: true },
          orderBy: { expiresAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!user || user.deletedAt) {
      return reply.status(404).send({ message: 'User not found' });
    }

    return reply.send({ ...user, telegramId: Number(user.telegramId) });
  });

  fastify.put('/users/me', async (request, reply) => {
    const body = z
      .object({
        firstName: z.string().min(1).max(100).optional(),
        lastName: z.string().max(100).optional(),
        phone: z.string().max(20).optional(),
        goal: z.enum(['yoga', 'pilates', 'stretch', 'any']).optional(),
        language: z.enum(['ru', 'uz']).optional(),
      })
      .parse(request.body);

    const user = await fastify.prisma.user.update({
      where: { id: request.userId },
      data: body,
    });

    return reply.send({ ...user, telegramId: Number(user.telegramId) });
  });

  fastify.get('/users/me/stats', async (request, reply) => {
    const userId = request.userId;

    const [totalClasses, attendedBookings] = await Promise.all([
      fastify.prisma.booking.count({
        where: { userId, status: 'attended' },
      }),
      fastify.prisma.booking.findMany({
        where: { userId, status: 'attended' },
        include: { class: { include: { direction: true } } },
        orderBy: { class: { startsAt: 'desc' } },
      }),
    ]);

    const directionCounts: Record<string, { name: string; count: number }> = {};
    for (const b of attendedBookings) {
      const dir = b.class.direction;
      if (!directionCounts[dir.id]) {
        directionCounts[dir.id] = { name: dir.name, count: 0 };
      }
      directionCounts[dir.id].count++;
    }

    const favoriteDirections = Object.entries(directionCounts)
      .map(([directionId, data]) => ({ directionId, directionName: data.name, count: data.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    const thisMonth = attendedBookings.filter((b) => {
      const d = new Date(b.class.startsAt);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;

    const user = await fastify.prisma.user.findUnique({ where: { id: userId } });

    return reply.send({
      totalClasses,
      currentStreak: 0,
      longestStreak: 0,
      favoriteDirections,
      thisMonth,
      memberSince: user?.createdAt.toISOString() ?? '',
    });
  });
}
