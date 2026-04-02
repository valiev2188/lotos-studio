import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { AppError } from '../../plugins/error-handler.js';

const bodySchema = z.object({
  refreshToken: z.string().min(1),
});

export async function refreshToken(request: FastifyRequest, reply: FastifyReply) {
  const { refreshToken: token } = bodySchema.parse(request.body);

  let decoded;
  try {
    decoded = request.server.jwt.verify<{ sub: string; type: string }>(token);
  } catch {
    throw new AppError(401, 'Unauthorized', 'Invalid refresh token');
  }

  if (decoded.type !== 'refresh') {
    throw new AppError(401, 'Unauthorized', 'Invalid token type');
  }

  const user = await request.server.prisma.user.findUnique({
    where: { id: decoded.sub },
  });

  if (!user || user.deletedAt) {
    throw new AppError(401, 'Unauthorized', 'User not found');
  }

  const accessToken = request.server.jwt.sign(
    { sub: user.id, telegramId: Number(user.telegramId), role: user.role, type: 'access' },
    { expiresIn: '15m' },
  );

  const newRefreshToken = request.server.jwt.sign(
    { sub: user.id, type: 'refresh' },
    { expiresIn: '30d' },
  );

  return reply.send({
    accessToken,
    refreshToken: newRefreshToken,
  });
}
