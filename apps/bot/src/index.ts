import { Telegraf, Markup } from 'telegraf';
import type { Context } from 'telegraf';
import { PrismaClient, User } from '@prisma/client';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const MINIAPP_URL = process.env.MINIAPP_URL || 'https://app.lotos-studio.uz';
const ADMIN_USERNAME = process.env.TELEGRAM_ADMIN_USERNAME || '';
const ADMIN_CHAT_ID = process.env.ADMIN_TELEGRAM_CHAT_ID || '';

if (!BOT_TOKEN) {
  console.error('TELEGRAM_BOT_TOKEN is required');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);
const prisma = new PrismaClient();

// ─── Texts ────────────────────────────────────────────────────────────────────

const WELCOME_NEW = `🌸 Добро пожаловать в Студию Лотос!

Мы рады видеть вас! Лотос — это студия женского фитнеса в Ташкенте: йога, пилатес, стретчинг, барре и медитация.

Для завершения регистрации нам нужен ваш номер телефона — нажмите кнопку ниже 👇`;

const REGISTRATION_COMPLETE = `✅ Отлично, регистрация завершена!

Теперь вы можете:
• Смотреть расписание занятий 📅
• Записываться онлайн
• Покупать абонементы 💳

Нажмите кнопку ниже, чтобы открыть приложение 🌸`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Показывает главное меню с кнопками Mini App */
async function showMainMenu(ctx: Context, user: User) {
  const greeting = `С возвращением, ${user.firstName}! 🌸\n\nЧем могу помочь?`;

  await ctx.reply(greeting, {
    reply_markup: Markup.inlineKeyboard([
      [Markup.button.webApp('🌸 Открыть приложение', MINIAPP_URL)],
      [
        Markup.button.webApp('📅 Расписание', `${MINIAPP_URL}?startapp=schedule`),
        Markup.button.webApp('📋 Мои записи', `${MINIAPP_URL}?startapp=my-bookings`),
      ],
      [Markup.button.callback('💬 Связаться с администратором', 'contact_admin')],
    ]).reply_markup,
  });
}

/** Устанавливает постоянную кнопку Mini App в поле ввода */
async function setMenuButton(chatId: number) {
  try {
    await bot.telegram.setChatMenuButton({
      chatId: chatId,
      menuButton: {
        type: 'web_app',
        text: '🌸 Открыть Лотос',
        web_app: { url: MINIAPP_URL },
      },
    });
  } catch (err) {
    // Не критично — просто логируем
    console.warn('setMenuButton error:', err);
  }
}

/** Уведомляет администратора о новом пользователе */
async function notifyAdmin(text: string) {
  if (!ADMIN_CHAT_ID) return;
  try {
    await bot.telegram.sendMessage(ADMIN_CHAT_ID, text, { parse_mode: 'HTML' });
  } catch (err) {
    console.warn('Admin notify error:', err);
  }
}

// ─── /start ───────────────────────────────────────────────────────────────────

bot.start(async (ctx) => {
  const tgUser = ctx.from;
  const startPayload = ctx.startPayload;

  // Ищем или создаём пользователя
  let user = await prisma.user.findUnique({
    where: { telegramId: BigInt(tgUser.id) },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        telegramId: BigInt(tgUser.id),
        firstName: tgUser.first_name,
        lastName: tgUser.last_name ?? null,
        username: tgUser.username ?? null,
      },
    });
  }

  // Если телефона нет — запускаем цепочку регистрации
  if (!user.phone) {
    await ctx.reply(WELCOME_NEW, {
      reply_markup: Markup.keyboard([
        [Markup.button.contactRequest('📱 Поделиться номером телефона')],
      ])
        .resize()
        .oneTime()
        .reply_markup,
    });
    return;
  }

  // Уже зарегистрирован — открываем deeplink если есть
  if (startPayload) {
    await ctx.reply(
      `С возвращением, ${user.firstName}! 🌸`,
      Markup.inlineKeyboard([
        Markup.button.webApp('🌸 Открыть приложение', `${MINIAPP_URL}?startapp=${startPayload}`),
      ]),
    );
    return;
  }

  await showMainMenu(ctx, user);
});

// ─── Contact handler (регистрация) ───────────────────────────────────────────

bot.on('contact', async (ctx) => {
  try {
    const contact = ctx.message.contact;

    // Проверяем что пользователь поделился своим (не чужим) контактом
    if (contact.user_id !== undefined && contact.user_id !== ctx.from.id) {
      await ctx.reply(
        'Пожалуйста, используйте кнопку «📱 Поделиться номером телефона», чтобы отправить именно ваш контакт.',
        { reply_markup: Markup.keyboard([[Markup.button.contactRequest('📱 Поделиться номером телефона')]]).resize().oneTime().reply_markup },
      );
      return;
    }

    const rawPhone = contact.phone_number;
    const phone = rawPhone.startsWith('+') ? rawPhone : `+${rawPhone}`;
    const tgUser = ctx.from;

    // upsert — безопасно, даже если юзер не создан через /start
    const user = await prisma.user.upsert({
      where: { telegramId: BigInt(tgUser.id) },
      create: {
        telegramId: BigInt(tgUser.id),
        firstName: tgUser.first_name,
        lastName: tgUser.last_name ?? null,
        username: tgUser.username ?? null,
        phone,
      },
      update: { phone },
    });

    // Убираем ReplyKeyboard
    await ctx.reply('✅', { reply_markup: { remove_keyboard: true } });

    // Устанавливаем постоянную кнопку Mini App (некритично если упадёт)
    await setMenuButton(ctx.chat.id);

    // Показываем сообщение о завершении + кнопки
    await ctx.reply(REGISTRATION_COMPLETE, {
      reply_markup: Markup.inlineKeyboard([
        [Markup.button.webApp('🌸 Открыть приложение', MINIAPP_URL)],
        [Markup.button.callback('💬 Связаться с администратором', 'contact_admin')],
      ]).reply_markup,
    });

    // Уведомляем администратора
    await notifyAdmin(
      `🌸 <b>Новый пользователь зарегистрирован!</b>\n\n` +
      `👤 Имя: ${user.firstName}${user.lastName ? ' ' + user.lastName : ''}\n` +
      `📞 Телефон: ${phone}\n` +
      (user.username ? `💬 Username: @${user.username}\n` : '') +
      `🆔 Telegram ID: ${user.telegramId}`,
    );
  } catch (err) {
    console.error('Contact handler error:', err);
    // Всегда отвечаем пользователю — даже при ошибке БД
    await ctx.reply(
      'Что-то пошло не так 😔 Напишите /start и попробуйте ещё раз.',
      { reply_markup: { remove_keyboard: true } },
    ).catch(() => {});
  }
});

// ─── /schedule ────────────────────────────────────────────────────────────────

bot.command('schedule', async (ctx) => {
  await ctx.reply(
    '📅 Расписание занятий Студии Лотос:',
    Markup.inlineKeyboard([
      Markup.button.webApp('Открыть расписание', `${MINIAPP_URL}?startapp=schedule`),
    ]),
  );
});

// ─── /help ────────────────────────────────────────────────────────────────────

bot.command('help', async (ctx) => {
  const adminLine = ADMIN_USERNAME
    ? `\n💬 Администратор: @${ADMIN_USERNAME}`
    : '';

  await ctx.reply(
    `🌸 <b>Студия Лотос — Помощь</b>\n\n` +
    `/start — Открыть главное меню\n` +
    `/schedule — Расписание занятий\n` +
    `/help — Эта справка\n` +
    adminLine,
    {
      parse_mode: 'HTML',
      reply_markup: Markup.inlineKeyboard([
        [Markup.button.webApp('🌸 Открыть приложение', MINIAPP_URL)],
        [Markup.button.callback('💬 Связаться с администратором', 'contact_admin')],
      ]).reply_markup,
    },
  );
});

// ─── Callback: contact_admin ──────────────────────────────────────────────────

bot.action('contact_admin', async (ctx) => {
  await ctx.answerCbQuery();

  const hasAdmin = Boolean(ADMIN_USERNAME);
  const adminUrl = hasAdmin ? `https://t.me/${ADMIN_USERNAME}` : null;

  const text = adminUrl
    ? `Наш администратор готов помочь!\n\nНапишите нам в Telegram 👇`
    : `По всем вопросам свяжитесь с нами:\n📞 +998 90 123-45-67`;

  await ctx.reply(text, adminUrl ? {
    reply_markup: Markup.inlineKeyboard([[
      Markup.button.url('💬 Написать администратору', adminUrl),
    ]]).reply_markup,
  } : undefined);
});

// ─── Callback: cancel_booking ─────────────────────────────────────────────────

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

// ─── /mybookings ─────────────────────────────────────────────────────────────

bot.command('mybookings', async (ctx) => {
  try {
    const tgUser = ctx.from;

    const user = await prisma.user.findUnique({
      where: { telegramId: BigInt(tgUser.id) },
    });

    if (!user) {
      await ctx.reply('Пожалуйста, начните с /start для регистрации.');
      return;
    }

    const bookings = await prisma.booking.findMany({
      where: {
        userId: user.id,
        status: 'confirmed',
        class: { startsAt: { gt: new Date() } },
      },
      include: {
        class: {
          include: {
            trainer: { include: { user: true } },
            direction: true,
          },
        },
      },
      orderBy: { class: { startsAt: 'asc' } },
      take: 5,
    });

    if (bookings.length === 0) {
      await ctx.reply(
        'У вас пока нет предстоящих записей.\n\nЗапишитесь на занятие в приложении! 🌸',
        Markup.inlineKeyboard([
          [Markup.button.webApp('📅 Открыть расписание', `${MINIAPP_URL}?startapp=schedule`)],
        ]),
      );
      return;
    }

    const weekdays = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const months = [
      'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
      'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
    ];

    let message = '📋 Ваши предстоящие записи:\n';

    bookings.forEach((booking, idx) => {
      const dt = new Date(booking.class.startsAt);
      const wd = weekdays[dt.getUTCDay()];
      const day = dt.getUTCDate();
      const month = months[dt.getUTCMonth()];
      const hours = String(dt.getUTCHours()).padStart(2, '0');
      const mins = String(dt.getUTCMinutes()).padStart(2, '0');

      message += `\n${idx + 1}. ${booking.class.title}\n   📅 ${wd}, ${day} ${month} · ${hours}:${mins}\n`;
    });

    const cancelButtons = bookings.map((booking) =>
      [Markup.button.callback(`❌ Отменить: ${booking.class.title}`, `cancel_booking:${booking.id}`)],
    );

    await ctx.reply(message, {
      reply_markup: Markup.inlineKeyboard([
        ...cancelButtons,
        [Markup.button.webApp('📋 Открыть все записи', `${MINIAPP_URL}?startapp=my-bookings`)],
      ]).reply_markup,
    });
  } catch (err) {
    console.error('mybookings command error:', err);
    await ctx.reply('Произошла ошибка. Попробуйте позже.').catch(() => {});
  }
});

// ─── Reminder system ────────────────────────────────────────────────────────

async function checkAndSendReminders() {
  try {
    const now = new Date();
    const from = new Date(now.getTime() + 55 * 60 * 1000); // 55 minutes from now
    const to = new Date(now.getTime() + 65 * 60 * 1000);   // 65 minutes from now

    // Find classes starting in ~1 hour
    const upcomingClasses = await prisma.class.findMany({
      where: {
        startsAt: { gte: from, lte: to },
        status: 'scheduled',
      },
      include: {
        trainer: { include: { user: true } },
        direction: true,
        bookings: {
          where: { status: 'confirmed' },
          include: { user: true },
        },
      },
    });

    for (const cls of upcomingClasses) {
      for (const booking of cls.bookings) {
        try {
          // Check if reminder already sent for this user + class
          const existing = await prisma.notification.findFirst({
            where: {
              userId: booking.userId,
              type: 'reminder_1h',
              payload: { path: ['classId'], equals: cls.id },
            },
          });

          if (existing) continue;

          const telegramId = Number(booking.user.telegramId);
          const dt = new Date(cls.startsAt);
          const hours = String(dt.getUTCHours()).padStart(2, '0');
          const mins = String(dt.getUTCMinutes()).padStart(2, '0');
          const time = `${hours}:${mins}`;

          const message =
            `⏰ Напоминание о занятии!\n\n` +
            `📅 ${cls.title}\n` +
            `🕐 Начало через 1 час — в ${time}\n` +
            `👩‍🏫 Тренер: ${cls.trainer.user.firstName}\n` +
            `📍 ${cls.direction.name}\n\n` +
            `Хорошей тренировки! 🌸`;

          await bot.telegram.sendMessage(
            telegramId,
            message,
            Markup.inlineKeyboard([
              [Markup.button.webApp('Открыть приложение', MINIAPP_URL)],
            ]),
          );

          // Record notification to avoid duplicates
          await prisma.notification.create({
            data: {
              userId: booking.userId,
              type: 'reminder_1h',
              channel: 'telegram',
              payload: { classId: cls.id, classTitle: cls.title },
              sentAt: new Date(),
            },
          });

          console.log(`Reminder sent to user ${telegramId} for class ${cls.title}`);
        } catch (err) {
          console.error(`Failed to send reminder to user ${booking.userId} for class ${cls.id}:`, err);
        }
      }
    }
  } catch (err) {
    console.error('Reminder check error:', err);
  }
}

// ─── Graceful shutdown ────────────────────────────────────────────────────────

let reminderInterval: ReturnType<typeof setInterval> | null = null;

process.once('SIGINT', () => {
  if (reminderInterval) clearInterval(reminderInterval);
  bot.stop('SIGINT');
});
process.once('SIGTERM', () => {
  if (reminderInterval) clearInterval(reminderInterval);
  bot.stop('SIGTERM');
});

// ─── Launch ───────────────────────────────────────────────────────────────────

bot.launch().then(() => {
  console.log('🌸 Lotos Bot started in polling mode');

  // Start reminder system: check every 5 minutes
  reminderInterval = setInterval(checkAndSendReminders, 5 * 60 * 1000);
  console.log('⏰ Reminder system started (every 5 minutes)');
});
