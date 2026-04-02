import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { verifyTelegramInitData } from '../../utils/telegram-auth.js';
import { env } from '../../config/env.js';

const bodySchema = z.object({
  initData: z.string().min(1),
});

export async function telegramAuth(request: FastifyRequest, reply: FastifyReply) {
  const { initData } = bodySchema.parse(request.body);

  let parsed;
  if (env.NODE_ENV === 'development' && initData === 'dev_bypass') {
    parsed = {
      user: { id: 123456789, first_name: 'Dev', last_name: 'User', username: 'devuser' },
      authDate: Math.floor(Date.now() / 1000),
      hash: 'dev',
    };
  } else {
    parsed = verifyTelegramInitData(initData, env.TELEGRAM_BOT_TOKEN);
  }

  const { user: tgUser } = parsed;

  let user = await request.server.prisma.user.findUnique({
    where: { telegramId: BigInt(tgUser.id) },
  });

  const isNewUser = !user;

  if (!user) {
    user = await request.server.prisma.user.create({
      data: {
        telegramId: BigInt(tgUser.id),
        firstName: tgUser.first_name,
        lastName: tgUser.last_name ?? null,
        username: tgUser.username ?? null,
      },
    });
  }

  const accessToken = request.server.jwt.sign(
    { sub: user.id, telegramId: Number(user.telegramId), role: user.role, type: 'access' },
    { expiresIn: '15m' },
  );

  const refreshToken = request.server.jwt.sign(
    { sub: user.id, type: 'refresh' },
    { expiresIn: '30d' },
  );

  const serializedUser = {
    ...user,
    telegramId: Number(user.telegramId),
  };

  return reply.send({
    accessToken,
    refreshToken,
    user: serializedUser,
    isNewUser,
  });
}
