import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authenticate } from '../../middleware/authenticate.js';

export async function subscriptionRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', authenticate);

  fastify.get('/subscriptions', async (request, reply) => {
    const subscriptions = await fastify.prisma.subscription.findMany({
      where: { userId: request.userId },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    });

    const result = subscriptions.map((s) => ({
      ...s,
      paidAmount: Number(s.paidAmount),
      remainingClasses: s.totalClasses - s.usedClasses,
      plan: { ...s.plan, price: Number(s.plan.price) },
    }));

    return reply.send({ data: result });
  });

  fastify.post('/subscriptions', async (request, reply) => {
    const body = z
      .object({
        planId: z.string().uuid(),
        paymentMethod: z.enum(['payme', 'click', 'cash', 'tg_pay']),
        paymentId: z.string().optional(),
      })
      .parse(request.body);

    const plan = await fastify.prisma.plan.findUnique({
      where: { id: body.planId },
    });

    if (!plan || !plan.isActive) {
      return reply.status(404).send({ message: 'Plan not found' });
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + plan.validityDays * 24 * 60 * 60 * 1000);

    const subscription = await fastify.prisma.subscription.create({
      data: {
        userId: request.userId,
        planId: body.planId,
        totalClasses: plan.classesCount,
        startsAt: now,
        expiresAt,
        paidAmount: plan.price,
        paymentMethod: body.paymentMethod,
        paymentId: body.paymentId ?? null,
      },
      include: { plan: true },
    });

    return reply.status(201).send({
      ...subscription,
      paidAmount: Number(subscription.paidAmount),
      remainingClasses: subscription.totalClasses - subscription.usedClasses,
      plan: { ...subscription.plan, price: Number(subscription.plan.price) },
    });
  });
}
