import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authenticate } from '../../middleware/authenticate.js';
import { AppError } from '../../plugins/error-handler.js';

export async function bookingRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', authenticate);

  fastify.get('/bookings', async (request, reply) => {
    const query = z
      .object({
        status: z.string().optional(),
        limit: z.coerce.number().min(1).max(100).default(20),
        page: z.coerce.number().min(1).default(1),
      })
      .parse(request.query);

    const where: Record<string, unknown> = { userId: request.userId };
    if (query.status) where.status = query.status;

    const [bookings, total] = await Promise.all([
      fastify.prisma.booking.findMany({
        where,
        include: {
          class: {
            include: {
              trainer: { include: { user: { select: { firstName: true, lastName: true } } } },
              direction: { select: { name: true, color: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: query.limit,
        skip: (query.page - 1) * query.limit,
      }),
      fastify.prisma.booking.count({ where }),
    ]);

    return reply.send({
      data: bookings,
      total,
      page: query.page,
      limit: query.limit,
      hasMore: query.page * query.limit < total,
    });
  });

  fastify.post('/bookings', async (request, reply) => {
    const body = z
      .object({
        classId: z.string().uuid(),
        isTrial: z.boolean().default(false),
        subscriptionId: z.string().uuid().optional(),
      })
      .parse(request.body);

    const cls = await fastify.prisma.class.findUnique({
      where: { id: body.classId },
      include: {
        _count: { select: { bookings: { where: { status: { not: 'cancelled' } } } } },
        trainer: { include: { user: { select: { firstName: true, lastName: true } } } },
        direction: { select: { name: true } },
      },
    });

    if (!cls || cls.status !== 'scheduled' || cls.deletedAt) {
      throw new AppError(404, 'Not Found', 'Class not found or not available');
    }

    if (cls._count.bookings >= cls.maxSpots) {
      throw new AppError(409, 'Conflict', 'No available spots');
    }

    const existing = await fastify.prisma.booking.findUnique({
      where: { userId_classId: { userId: request.userId, classId: body.classId } },
    });

    if (existing && existing.status !== 'cancelled') {
      throw new AppError(409, 'Conflict', 'Already booked for this class');
    }

    if (body.subscriptionId) {
      const sub = await fastify.prisma.subscription.findFirst({
        where: {
          id: body.subscriptionId,
          userId: request.userId,
          status: 'active',
          expiresAt: { gt: new Date() },
        },
      });

      if (!sub || sub.usedClasses >= sub.totalClasses) {
        throw new AppError(400, 'Bad Request', 'Invalid or exhausted subscription');
      }

      await fastify.prisma.subscription.update({
        where: { id: sub.id },
        data: { usedClasses: { increment: 1 } },
      });
    }

    const booking = await fastify.prisma.booking.create({
      data: {
        userId: request.userId,
        classId: body.classId,
        isTrial: body.isTrial,
        subscriptionId: body.subscriptionId ?? null,
        status: 'confirmed',
      },
      include: {
        class: {
          include: {
            trainer: { include: { user: { select: { firstName: true, lastName: true } } } },
            direction: { select: { name: true } },
          },
        },
      },
    });

    return reply.status(201).send(booking);
  });

  fastify.patch('/bookings/:id/cancel', async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);

    const booking = await fastify.prisma.booking.findFirst({
      where: { id, userId: request.userId },
      include: { class: true },
    });

    if (!booking) {
      throw new AppError(404, 'Not Found', 'Booking not found');
    }

    if (booking.status === 'cancelled') {
      throw new AppError(400, 'Bad Request', 'Booking already cancelled');
    }

    const hoursUntilClass =
      (new Date(booking.class.startsAt).getTime() - Date.now()) / (1000 * 60 * 60);
    let refundedToSubscription = false;

    if (hoursUntilClass > 2 && booking.subscriptionId) {
      await fastify.prisma.subscription.update({
        where: { id: booking.subscriptionId },
        data: { usedClasses: { decrement: 1 } },
      });
      refundedToSubscription = true;
    }

    await fastify.prisma.booking.update({
      where: { id },
      data: { status: 'cancelled', cancelledAt: new Date() },
    });

    return reply.send({
      success: true,
      refundedToSubscription,
      message: refundedToSubscription
        ? 'Booking cancelled, class returned to subscription'
        : 'Booking cancelled',
    });
  });
}
