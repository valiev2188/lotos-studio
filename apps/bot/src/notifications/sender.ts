import { Telegraf, Markup } from 'telegraf';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface NotificationPayload {
  type: string;
  userId: string;
  data: Record<string, unknown>;
}

export async function sendNotification(bot: Telegraf, payload: NotificationPayload) {
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user) return;

  const telegramId = Number(user.telegramId);
  const miniappUrl = process.env.MINIAPP_URL || 'https://app.lotos-studio.uz';

  switch (payload.type) {
    case 'booking_confirmed': {
      const { classTitle, trainerName, dateTime, bookingId } = payload.data as Record<string, string>;
      await bot.telegram.sendMessage(
        telegramId,
        `✅ Вы записаны!\n\n📋 ${classTitle}\n👤 ${trainerName}\n🕐 ${dateTime}\n\nДо встречи в студии! 🪷`,
        Markup.inlineKeyboard([
          Markup.button.callback('Отменить запись', `cancel_booking:${bookingId}`),
          Markup.button.webApp('Мои записи', `${miniappUrl}?startapp=my-bookings`),
        ]),
      );
      break;
    }
    case 'reminder_1h': {
      const { classTitle, time } = payload.data as Record<string, string>;
      await bot.telegram.sendMessage(
        telegramId,
        `⏰ Через 1 час — ${classTitle} в ${time}\n\nНе забудьте взять форму и воду! 🪷`,
      );
      break;
    }
    case 'class_cancelled': {
      const { classTitle, reason } = payload.data as Record<string, string>;
      await bot.telegram.sendMessage(
        telegramId,
        `😔 Занятие "${classTitle}" отменено\n${reason ? `Причина: ${reason}\n` : ''}\nЗанятие возвращено на абонемент.`,
        Markup.inlineKeyboard([
          Markup.button.webApp('Выбрать другое', `${miniappUrl}?startapp=schedule`),
        ]),
      );
      break;
    }
  }
}
