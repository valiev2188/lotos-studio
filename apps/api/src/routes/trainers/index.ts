import { FastifyInstance } from 'fastify';
import { z } from 'zod';

export async function trainerRoutes(fastify: FastifyInstance) {
  fastify.get('/trainers', async (_request, reply) => {
    const trainers = await fastify.prisma.trainer.findMany({
      where: { isActive: true },
      include: {
        user: { select: { firstName: true, lastName: true, username: true } },
      },
    });
    return reply.send({ data: trainers });
  });

  fastify.get('/trainers/:id', async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);

    const trainer = await fastify.prisma.trainer.findUnique({
      where: { id },
      include: {
        user: { select: { firstName: true, lastName: true, username: true } },
        classes: {
          where: { status: 'scheduled', startsAt: { gt: new Date() }, deletedAt: null },
          include: { direction: true },
          orderBy: { startsAt: 'asc' },
          take: 10,
        },
      },
    });

    if (!trainer) {
      return reply.status(404).send({ message: 'Trainer not found' });
    }

    return reply.send(trainer);
  });
}
