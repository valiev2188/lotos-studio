import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authenticate } from '../../middleware/authenticate.js';
import { AppError } from '../../plugins/error-handler.js';

export async function reviewRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', authenticate);

  // Создать отзыв после посещения занятия
  fastify.post('/reviews', async (request, reply) => {
    const body = z
      .object({
        classId: z.string().uuid(),
        rating: z.number().int().min(1).max(5),
        text: z.string().max(1000).optional(),
      })
      .parse(request.body);

    // Проверяем что пользователь реально посещал это занятие
    const booking = await fastify.prisma.booking.findFirst({
      where: {
        userId: request.userId,
        classId: body.classId,
        status: 'attended',
      },
      include: { class: true },
    });

    if (!booking) {
      throw new AppError(403, 'Forbidden', 'You can only review classes you attended');
    }

    // Проверяем что отзыв ещё не оставлен
    const existing = await fastify.prisma.review.findFirst({
      where: { userId: request.userId, classId: body.classId },
    });

    if (existing) {
      throw new AppError(409, 'Conflict', 'You already reviewed this class');
    }

    const review = await fastify.prisma.review.create({
      data: {
        userId: request.userId,
        classId: body.classId,
        trainerId: booking.class.trainerId,
        rating: body.rating,
        text: body.text ?? null,
      },
    });

    return reply.status(201).send(review);
  });

  // Получить отзывы пользователя (чтобы знать какие занятия уже оценены)
  fastify.get('/reviews/my', async (request, reply) => {
    const reviews = await fastify.prisma.review.findMany({
      where: { userId: request.userId },
      orderBy: { createdAt: 'desc' },
    });

    return reply.send({ data: reviews });
  });
}
