import { FastifyInstance } from 'fastify';
import { z } from 'zod';

const scheduleQuery = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  directionId: z.string().uuid().optional(),
  trainerId: z.string().uuid().optional(),
});

export async function scheduleRoutes(fastify: FastifyInstance) {
  fastify.get('/schedule', async (request, reply) => {
    const query = scheduleQuery.parse(request.query);

    const now = new Date();
    const dateFrom = query.dateFrom ? new Date(query.dateFrom) : now;
    const dateTo = query.dateTo
      ? new Date(query.dateTo)
      : new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const where: Record<string, unknown> = {
      startsAt: { gte: dateFrom, lte: dateTo },
      status: 'scheduled',
      deletedAt: null,
    };

    if (query.directionId) where.directionId = query.directionId;
    if (query.trainerId) where.trainerId = query.trainerId;

    const classes = await fastify.prisma.class.findMany({
      where,
      include: {
        trainer: { include: { user: { select: { firstName: true, lastName: true } } } },
        direction: true,
        _count: { select: { bookings: { where: { status: { not: 'cancelled' } } } } },
      },
      orderBy: { startsAt: 'asc' },
    });

    const result = classes.map((c) => ({
      ...c,
      bookedCount: c._count.bookings,
      availableSpots: c.maxSpots - c._count.bookings,
      _count: undefined,
    }));

    return reply.send({ data: result });
  });

  fastify.get('/classes/:id', async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);

    const cls = await fastify.prisma.class.findUnique({
      where: { id },
      include: {
        trainer: { include: { user: { select: { firstName: true, lastName: true } } } },
        direction: true,
        _count: { select: { bookings: { where: { status: { not: 'cancelled' } } } } },
      },
    });

    if (!cls || cls.deletedAt) {
      return reply.status(404).send({ message: 'Class not found' });
    }

    return reply.send({
      ...cls,
      bookedCount: cls._count.bookings,
      availableSpots: cls.maxSpots - cls._count.bookings,
      _count: undefined,
    });
  });
}
