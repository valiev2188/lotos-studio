import { FastifyInstance } from 'fastify';

export async function directionRoutes(fastify: FastifyInstance) {
  fastify.get('/directions', async (_request, reply) => {
    const directions = await fastify.prisma.direction.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    return reply.send({ data: directions });
  });
}
