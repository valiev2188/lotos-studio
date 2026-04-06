import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { adminAuth, requirePermission } from '../../middleware/admin-auth.js';
import { AppError } from '../../plugins/error-handler.js';

export async function adminRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', adminAuth);

  // ── Users ─────────────────────────────────────────
  fastify.get('/admin/users', { preHandler: requirePermission('clients') }, async (request, reply) => {
    const query = z.object({
      search: z.string().optional(),
      role: z.string().optional(),
      limit: z.coerce.number().min(1).max(100).default(20),
      page: z.coerce.number().min(1).default(1),
    }).parse(request.query);

    const where: Record<string, unknown> = { deletedAt: null };
    if (query.role) where.role = query.role;
    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search } },
      ];
    }

    const [users, total] = await Promise.all([
      fastify.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: query.limit,
        skip: (query.page - 1) * query.limit,
      }),
      fastify.prisma.user.count({ where }),
    ]);

    return reply.send({
      data: users.map((u) => ({ ...u, telegramId: Number(u.telegramId) })),
      total,
      page: query.page,
      limit: query.limit,
      hasMore: query.page * query.limit < total,
    });
  });

  // ── Classes CRUD ──────────────────────────────────
  fastify.post('/admin/classes', { preHandler: requirePermission('schedule') }, async (request, reply) => {
    const body = z.object({
      trainerId: z.string().uuid(),
      directionId: z.string().uuid(),
      title: z.string().min(1).max(200),
      description: z.string().optional(),
      startsAt: z.string().datetime(),
      durationMin: z.number().min(15).max(180),
      maxSpots: z.number().min(1).max(50),
      level: z.enum(['beginner', 'intermediate', 'all']).default('all'),
      room: z.string().optional(),
      recurrence: z.object({
        freq: z.enum(['weekly', 'biweekly']),
        until: z.string().datetime(),
      }).optional(),
    }).parse(request.body);

    const cls = await fastify.prisma.class.create({
      data: {
        ...body,
        startsAt: new Date(body.startsAt),
        recurrence: body.recurrence ?? undefined,
      },
      include: { trainer: { include: { user: true } }, direction: true },
    });

    return reply.status(201).send(cls);
  });

  fastify.put('/admin/classes/:id', { preHandler: requirePermission('schedule') }, async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const body = z.object({
      trainerId: z.string().uuid().optional(),
      directionId: z.string().uuid().optional(),
      title: z.string().min(1).max(200).optional(),
      description: z.string().optional(),
      startsAt: z.string().datetime().optional(),
      durationMin: z.number().min(15).max(180).optional(),
      maxSpots: z.number().min(1).max(50).optional(),
      level: z.enum(['beginner', 'intermediate', 'all']).optional(),
      status: z.enum(['scheduled', 'cancelled', 'done']).optional(),
      room: z.string().optional(),
    }).parse(request.body);

    const data: Record<string, unknown> = { ...body };
    if (body.startsAt) data.startsAt = new Date(body.startsAt);

    const cls = await fastify.prisma.class.update({
      where: { id },
      data,
      include: { trainer: { include: { user: true } }, direction: true },
    });

    return reply.send(cls);
  });

  fastify.delete('/admin/classes/:id', { preHandler: requirePermission('schedule') }, async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);

    await fastify.prisma.class.update({
      where: { id },
      data: { status: 'cancelled', deletedAt: new Date() },
    });

    return reply.send({ success: true, message: 'Class cancelled' });
  });

  // ── Bookings (attendance) ─────────────────────────
  fastify.patch('/admin/bookings/:id/attend', { preHandler: requirePermission('schedule') }, async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);

    const booking = await fastify.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new AppError(404, 'Not Found', 'Booking not found');

    await fastify.prisma.booking.update({
      where: { id },
      data: { status: 'attended' },
    });

    return reply.send({ success: true });
  });

  // ── Analytics ─────────────────────────────────────
  fastify.get('/admin/analytics/overview', { preHandler: requirePermission('analytics') }, async (request, reply) => {
    const query = z.object({
      from: z.string().optional(),
      to: z.string().optional(),
    }).parse(request.query);

    const from = query.from ? new Date(query.from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const to = query.to ? new Date(query.to) : new Date();

    const [totalBookings, attended, newClients, revenue] = await Promise.all([
      fastify.prisma.booking.count({ where: { createdAt: { gte: from, lte: to } } }),
      fastify.prisma.booking.count({ where: { status: 'attended', createdAt: { gte: from, lte: to } } }),
      fastify.prisma.user.count({ where: { createdAt: { gte: from, lte: to }, role: 'client' } }),
      fastify.prisma.subscription.aggregate({
        where: { createdAt: { gte: from, lte: to } },
        _sum: { paidAmount: true },
      }),
    ]);

    return reply.send({
      totalBookings,
      totalAttended: attended,
      attendanceRate: totalBookings > 0 ? Math.round((attended / totalBookings) * 100) : 0,
      revenue: Number(revenue._sum.paidAmount ?? 0),
      newClients,
      activeSubscriptions: await fastify.prisma.subscription.count({
        where: { status: 'active', expiresAt: { gt: new Date() } },
      }),
      occupancyRate: 0,
      comparison: { bookings: 0, revenue: 0, newClients: 0 },
    });
  });

  // ── Plans CRUD ────────────────────────────────────
  fastify.get('/admin/plans', async (_request, reply) => {
    const plans = await fastify.prisma.plan.findMany({ orderBy: { sortOrder: 'asc' } });
    return reply.send({ data: plans.map((p) => ({ ...p, price: Number(p.price) })) });
  });

  fastify.post('/admin/plans', { preHandler: requirePermission('settings') }, async (request, reply) => {
    const body = z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      classesCount: z.number().min(1),
      price: z.number().min(0),
      validityDays: z.number().min(1),
    }).parse(request.body);

    const plan = await fastify.prisma.plan.create({ data: body });
    return reply.status(201).send({ ...plan, price: Number(plan.price) });
  });

  // ── Directions CRUD ───────────────────────────────
  fastify.post('/admin/directions', { preHandler: requirePermission('settings') }, async (request, reply) => {
    const body = z.object({
      name: z.string().min(1),
      slug: z.string().min(1),
      description: z.string().optional(),
      color: z.string().optional(),
      icon: z.string().optional(),
    }).parse(request.body);

    const direction = await fastify.prisma.direction.create({ data: body });
    return reply.status(201).send(direction);
  });

  // ── Admin Subscriptions ─────────────────────────
  // Выдать абонемент клиенту (полуавтоматика)
  fastify.post('/admin/subscriptions', { preHandler: requirePermission('clients') }, async (request, reply) => {
    const body = z.object({
      userId: z.string().uuid(),
      planId: z.string().uuid(),
      paidAmount: z.number().min(0),
      paymentMethod: z.enum(['payme', 'click', 'cash', 'tg_pay']).default('cash'),
      paymentId: z.string().optional(),
    }).parse(request.body);

    const plan = await fastify.prisma.plan.findUnique({ where: { id: body.planId } });
    if (!plan) throw new AppError(404, 'Not Found', 'Plan not found');

    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + plan.validityDays);

    const subscription = await fastify.prisma.subscription.create({
      data: {
        userId: body.userId,
        planId: body.planId,
        totalClasses: plan.classesCount,
        usedClasses: 0,
        startsAt: now,
        expiresAt,
        paidAmount: body.paidAmount,
        paymentMethod: body.paymentMethod,
        paymentId: body.paymentId ?? null,
        status: 'active',
      },
      include: { plan: true, user: true },
    });

    return reply.status(201).send({
      ...subscription,
      paidAmount: Number(subscription.paidAmount),
      user: { ...subscription.user, telegramId: Number(subscription.user.telegramId) },
    });
  });

  // Список всех абонементов
  fastify.get('/admin/subscriptions', { preHandler: requirePermission('clients') }, async (request, reply) => {
    const query = z.object({
      userId: z.string().uuid().optional(),
      status: z.string().optional(),
      limit: z.coerce.number().min(1).max(100).default(50),
      page: z.coerce.number().min(1).default(1),
    }).parse(request.query);

    const where: Record<string, unknown> = {};
    if (query.userId) where.userId = query.userId;
    if (query.status) where.status = query.status;

    const [subs, total] = await Promise.all([
      fastify.prisma.subscription.findMany({
        where,
        include: {
          plan: true,
          user: { select: { id: true, firstName: true, lastName: true, phone: true, telegramId: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: query.limit,
        skip: (query.page - 1) * query.limit,
      }),
      fastify.prisma.subscription.count({ where }),
    ]);

    return reply.send({
      data: subs.map((s) => ({
        ...s,
        paidAmount: Number(s.paidAmount),
        user: { ...s.user, telegramId: Number(s.user.telegramId) },
      })),
      total,
      page: query.page,
      hasMore: query.page * query.limit < total,
    });
  });

  // Детальная карточка клиента для CRM
  fastify.get('/admin/users/:id', { preHandler: requirePermission('clients') }, async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);

    const user = await fastify.prisma.user.findUnique({
      where: { id },
      include: {
        subscriptions: { include: { plan: true }, orderBy: { createdAt: 'desc' } },
        bookings: {
          include: {
            class: {
              include: {
                direction: { select: { name: true, color: true } },
                trainer: { include: { user: { select: { firstName: true, lastName: true } } } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        reviews: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    });

    if (!user) throw new AppError(404, 'Not Found', 'User not found');

    const attendedCount = await fastify.prisma.booking.count({
      where: { userId: id, status: 'attended' },
    });

    const cancelledCount = await fastify.prisma.booking.count({
      where: { userId: id, status: 'cancelled' },
    });

    const avgRating = user.reviews.length > 0
      ? user.reviews.reduce((sum, r) => sum + r.rating, 0) / user.reviews.length
      : null;

    return reply.send({
      ...user,
      telegramId: Number(user.telegramId),
      subscriptions: user.subscriptions.map((s) => ({ ...s, paidAmount: Number(s.paidAmount) })),
      stats: {
        totalAttended: attendedCount,
        totalCancelled: cancelledCount,
        avgRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
        totalReviews: user.reviews.length,
        totalSubscriptions: user.subscriptions.length,
        totalSpent: user.subscriptions.reduce((sum, s) => sum + Number(s.paidAmount), 0),
      },
    });
  });

  // Отметить посещение массово (все букинги занятия)
  fastify.patch('/admin/classes/:id/complete', { preHandler: requirePermission('schedule') }, async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const body = z.object({
      attendedUserIds: z.array(z.string().uuid()),
      noShowUserIds: z.array(z.string().uuid()).default([]),
    }).parse(request.body);

    // Отмечаем посетивших
    if (body.attendedUserIds.length > 0) {
      await fastify.prisma.booking.updateMany({
        where: { classId: id, userId: { in: body.attendedUserIds } },
        data: { status: 'attended' },
      });
    }

    // Отмечаем не пришедших
    if (body.noShowUserIds.length > 0) {
      await fastify.prisma.booking.updateMany({
        where: { classId: id, userId: { in: body.noShowUserIds } },
        data: { status: 'no_show' },
      });
    }

    // Помечаем занятие как завершённое
    await fastify.prisma.class.update({
      where: { id },
      data: { status: 'done' },
    });

    return reply.send({ success: true });
  });

  // Обзор отзывов для админа
  fastify.get('/admin/reviews', { preHandler: requirePermission('clients') }, async (request, reply) => {
    const query = z.object({
      limit: z.coerce.number().min(1).max(100).default(50),
      page: z.coerce.number().min(1).default(1),
    }).parse(request.query);

    const [reviews, total] = await Promise.all([
      fastify.prisma.review.findMany({
        include: {
          user: { select: { firstName: true, lastName: true } },
          class: { select: { title: true, startsAt: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: query.limit,
        skip: (query.page - 1) * query.limit,
      }),
      fastify.prisma.review.count(),
    ]);

    return reply.send({ data: reviews, total, page: query.page });
  });
}
