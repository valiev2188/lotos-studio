import { FastifyInstance } from 'fastify';
import { z } from 'zod';

export async function exerciseRoutes(fastify: FastifyInstance) {
  fastify.get('/exercises', async (request, reply) => {
    const query = z
      .object({
        category: z.string().optional(),
        difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
        trainerId: z.string().uuid().optional(),
        limit: z.coerce.number().min(1).max(50).default(20),
        page: z.coerce.number().min(1).default(1),
      })
      .parse(request.query);

    const where: Record<string, unknown> = { isPublished: true };
    if (query.category) where.category = query.category;
    if (query.difficulty) where.difficulty = query.difficulty;
    if (query.trainerId) where.trainerId = query.trainerId;

    const [exercises, total] = await Promise.all([
      fastify.prisma.exercise.findMany({
        where,
        include: {
          trainer: {
            include: { user: { select: { firstName: true, lastName: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: query.limit,
        skip: (query.page - 1) * query.limit,
      }),
      fastify.prisma.exercise.count({ where }),
    ]);

    return reply.send({
      data: exercises,
      total,
      page: query.page,
      limit: query.limit,
      hasMore: query.page * query.limit < total,
    });
  });
}
