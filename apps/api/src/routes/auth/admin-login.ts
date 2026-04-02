import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { AppError } from '../../plugins/error-handler.js';

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function adminLogin(request: FastifyRequest, reply: FastifyReply) {
  const { email, password } = bodySchema.parse(request.body);

  const admin = await request.server.prisma.adminUser.findUnique({
    where: { email },
  });

  if (!admin || !admin.isActive) {
    throw new AppError(401, 'Unauthorized', 'Invalid credentials');
  }

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    throw new AppError(401, 'Unauthorized', 'Invalid credentials');
  }

  await request.server.prisma.adminUser.update({
    where: { id: admin.id },
    data: { lastLoginAt: new Date() },
  });

  const accessToken = request.server.jwt.sign(
    { sub: admin.id, email: admin.email, role: admin.role, type: 'access' },
    { expiresIn: '8h' },
  );

  reply.setCookie('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 8 * 60 * 60,
  });

  return reply.send({
    accessToken,
    user: {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      firstName: admin.firstName,
      lastName: admin.lastName,
    },
  });
}
