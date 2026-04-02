import { Telegraf, Markup } from 'telegraf';
import { PrismaClient } from '@prisma/client';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const MINIAPP_URL = process.env.MINIAPP_URL || 'https://app.lotos-studio.uz';

if (!BOT_TOKEN) {
  console.error('TELEGRAM_BOT_TOKEN is required');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);
const prisma = new PrismaClient();

// /start command
bot.start(async (ctx) => {
  const startPayload = ctx.startPayload;
  const telegramId = ctx.from.id;

  const user = await prisma.user.findUnique({
    where: { telegramId: BigInt(telegramId) },
  });

  if (!user) {
    await ctx.reply(
      '🪷 Добро пожаловать в Студию Лотос!\n\nОткройте приложение для записи на занятия:',
      Markup.inlineKeyboard([
        Markup.button.webApp('Открыть Лотос', `${MINIAPP_URL}?startapp=${startPayload || 'home'}`),
      ]),
    );
  } else {
    await ctx.reply(
      `Привет, ${user.firstName}! 🪷\n\nЧто хотите сделать?`,
      Markup.inlineKeyboard([
        [Markup.button.webApp('Записаться на занятие', `${MINIAPP_URL}?startapp=schedule`)],
        [Markup.button.webApp('Мои записи', `${MINIAPP_URL}?startapp=my-bookings`)],
        [Markup.button.webApp('Расписание', `${MINIAPP_URL}?startapp=schedule`)],
      ]),
    );
  }
});

// /schedule command
bot.command('schedule', async (ctx) => {
  await ctx.reply(
    'Расписание занятий:',
    Markup.inlineKeyboard([
      Markup.button.webApp('Открыть расписание', `${MINIAPP_URL}?startapp=schedule`),
    ]),
  );
});

// /help command
bot.command('help', async (ctx) => {
  await ctx.reply(
    '🪷 Студия Лотос — Помощь\n\n' +
      '/start — Открыть приложение\n' +
      '/schedule — Расписание занятий\n' +
      '/help — Эта справка\n\n' +
      'По всем вопросам: @lotos_support',
  );
});

// Callback: cancel booking
bot.action(/cancel_booking:(.+)/, async (ctx) => {
  const bookingId = ctx.match[1];

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { class: true },
    });

    if (!booking || booking.status === 'cancelled') {
      await ctx.answerCbQuery('Запись уже отменена');
      return;
    }

    const hoursUntilClass =
      (new Date(booking.class.startsAt).getTime() - Date.now()) / (1000 * 60 * 60);

    if (hoursUntilClass < 2) {
      await ctx.answerCbQuery('Отмена возможна не позднее чем за 2 часа до занятия');
      return;
    }

    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'cancelled', cancelledAt: new Date() },
    });

    if (booking.subscriptionId) {
      await prisma.subscription.update({
        where: { id: booking.subscriptionId },
        data: { usedClasses: { decrement: 1 } },
      });
    }

    await ctx.answerCbQuery('Запись отменена');
    await ctx.editMessageText('❌ Запись отменена. Занятие возвращено на абонемент.');
  } catch {
    await ctx.answerCbQuery('Ошибка при отмене');
  }
});

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

// Launch
bot.launch().then(() => {
  console.log('Bot started in polling mode');
});
