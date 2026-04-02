import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Directions
  const directions = await Promise.all([
    prisma.direction.upsert({
      where: { slug: 'yoga' },
      update: {},
      create: { name: 'Йога', slug: 'yoga', description: 'Хатха-йога, виньяса и восстановительные практики', color: '#774936', icon: '🧘', sortOrder: 1 },
    }),
    prisma.direction.upsert({
      where: { slug: 'pilates' },
      update: {},
      create: { name: 'Пилатес', slug: 'pilates', description: 'Укрепление кора, осанка и гибкость', color: '#662E9B', icon: '💪', sortOrder: 2 },
    }),
    prisma.direction.upsert({
      where: { slug: 'stretching' },
      update: {},
      create: { name: 'Стретчинг', slug: 'stretching', description: 'Растяжка и гибкость для всех уровней', color: '#774936', icon: '🤸', sortOrder: 3 },
    }),
    prisma.direction.upsert({
      where: { slug: 'fitness' },
      update: {},
      create: { name: 'Фитнес', slug: 'fitness', description: 'Функциональные тренировки и кардио', color: '#662E9B', icon: '🏋️', sortOrder: 4 },
    }),
    prisma.direction.upsert({
      where: { slug: 'meditation' },
      update: {},
      create: { name: 'Медитация', slug: 'meditation', description: 'Осознанность, дыхание и релаксация', color: '#774936', icon: '🧠', sortOrder: 5 },
    }),
    prisma.direction.upsert({
      where: { slug: 'barre' },
      update: {},
      create: { name: 'Барре', slug: 'barre', description: 'Балетные тренировки для тонуса и грации', color: '#662E9B', icon: '🩰', sortOrder: 6 },
    }),
  ]);

  // Trainer users
  const trainerUsers = await Promise.all([
    prisma.user.upsert({
      where: { telegramId: BigInt(100001) },
      update: {},
      create: { telegramId: BigInt(100001), firstName: 'Камила', lastName: 'Рахимова', role: 'trainer', phone: '+998901234567' },
    }),
    prisma.user.upsert({
      where: { telegramId: BigInt(100002) },
      update: {},
      create: { telegramId: BigInt(100002), firstName: 'Диана', lastName: 'Ким', role: 'trainer', phone: '+998901234568' },
    }),
    prisma.user.upsert({
      where: { telegramId: BigInt(100003) },
      update: {},
      create: { telegramId: BigInt(100003), firstName: 'Азиз', lastName: 'Каримов', role: 'trainer', phone: '+998901234569' },
    }),
  ]);

  // Trainers
  const trainers = await Promise.all([
    prisma.trainer.upsert({
      where: { userId: trainerUsers[0].id },
      update: {},
      create: {
        userId: trainerUsers[0].id,
        bio: 'Сертифицированный инструктор йоги с 5-летним опытом. Специализируется на хатха-йоге и виньяса-флоу.',
        experienceYears: 5,
        certifications: ['RYT-200', 'Хатха-йога'],
        specializations: ['Йога', 'Медитация'],
      },
    }),
    prisma.trainer.upsert({
      where: { userId: trainerUsers[1].id },
      update: {},
      create: {
        userId: trainerUsers[1].id,
        bio: 'Мастер пилатеса и стретчинга. 7 лет обучает клиентов правильной осанке и гибкости.',
        experienceYears: 7,
        certifications: ['STOTT Pilates', 'PMA-CPT'],
        specializations: ['Пилатес', 'Стретчинг'],
      },
    }),
    prisma.trainer.upsert({
      where: { userId: trainerUsers[2].id },
      update: {},
      create: {
        userId: trainerUsers[2].id,
        bio: 'Фитнес-тренер и специалист по функциональным тренировкам. Мотивирует и вдохновляет.',
        experienceYears: 4,
        certifications: ['NASM-CPT', 'Functional Training'],
        specializations: ['Фитнес', 'Барре'],
      },
    }),
  ]);

  // Plans
  await Promise.all([
    prisma.plan.upsert({
      where: { id: '00000000-0000-0000-0000-000000000001' },
      update: {},
      create: { id: '00000000-0000-0000-0000-000000000001', name: 'Пробное', description: 'Первое занятие бесплатно', classesCount: 1, price: 0, validityDays: 7, sortOrder: 1 },
    }),
    prisma.plan.upsert({
      where: { id: '00000000-0000-0000-0000-000000000002' },
      update: {},
      create: { id: '00000000-0000-0000-0000-000000000002', name: 'Базовый', description: '8 занятий в месяц', classesCount: 8, price: 400000, validityDays: 30, sortOrder: 2 },
    }),
    prisma.plan.upsert({
      where: { id: '00000000-0000-0000-0000-000000000003' },
      update: {},
      create: { id: '00000000-0000-0000-0000-000000000003', name: 'Стандарт', description: '12 занятий в месяц', classesCount: 12, price: 550000, validityDays: 30, sortOrder: 3 },
    }),
    prisma.plan.upsert({
      where: { id: '00000000-0000-0000-0000-000000000004' },
      update: {},
      create: { id: '00000000-0000-0000-0000-000000000004', name: 'Безлимит', description: 'Безлимитное посещение', classesCount: 999, price: 800000, validityDays: 30, sortOrder: 4 },
    }),
  ]);

  // Classes for the next 2 weeks
  const now = new Date();
  const classes = [];
  for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
    const date = new Date(now);
    date.setDate(date.getDate() + dayOffset);
    if (date.getDay() === 0) continue; // Skip Sundays

    const slots = [
      { hour: 8, title: 'Утренняя йога', trainer: trainers[0], direction: directions[0], level: 'all' as const },
      { hour: 10, title: 'Пилатес', trainer: trainers[1], direction: directions[1], level: 'beginner' as const },
      { hour: 12, title: 'Стретчинг', trainer: trainers[1], direction: directions[2], level: 'all' as const },
      { hour: 17, title: 'Фитнес', trainer: trainers[2], direction: directions[3], level: 'intermediate' as const },
      { hour: 19, title: 'Вечерняя йога', trainer: trainers[0], direction: directions[0], level: 'all' as const },
    ];

    if (dayOffset % 2 === 0) {
      slots.push({ hour: 15, title: 'Медитация', trainer: trainers[0], direction: directions[4], level: 'all' as const });
    }
    if (dayOffset % 3 === 0) {
      slots.push({ hour: 11, title: 'Барре', trainer: trainers[2], direction: directions[5], level: 'beginner' as const });
    }

    for (const slot of slots) {
      const startsAt = new Date(date);
      startsAt.setHours(slot.hour, 0, 0, 0);
      if (startsAt < now) continue;

      classes.push({
        trainerId: slot.trainer.id,
        directionId: slot.direction.id,
        title: slot.title,
        startsAt,
        durationMin: slot.hour === 15 ? 45 : 60,
        maxSpots: 12,
        level: slot.level,
        room: 'Зал 1',
      });
    }
  }

  for (const cls of classes) {
    await prisma.class.create({ data: cls });
  }
  console.log(`Created ${classes.length} classes`);

  // Admin user
  const passwordHash = await bcrypt.hash('admin123', 12);
  await prisma.adminUser.upsert({
    where: { email: 'admin@lotos-studio.uz' },
    update: {},
    create: {
      email: 'admin@lotos-studio.uz',
      passwordHash,
      role: 'super_admin',
      firstName: 'Admin',
      lastName: 'Lotos',
    },
  });

  // Sample clients
  const clients = await Promise.all(
    [
      { telegramId: BigInt(200001), firstName: 'Мадина', lastName: 'Алиева', phone: '+998911111111', goal: 'yoga' as const },
      { telegramId: BigInt(200002), firstName: 'Нодир', lastName: 'Усманов', phone: '+998912222222', goal: 'pilates' as const },
      { telegramId: BigInt(200003), firstName: 'Лола', lastName: 'Каримова', phone: '+998913333333', goal: 'stretch' as const },
      { telegramId: BigInt(200004), firstName: 'Тимур', lastName: 'Рашидов', phone: '+998914444444', goal: 'any' as const },
      { telegramId: BigInt(200005), firstName: 'Зарина', lastName: 'Ибрагимова', phone: '+998915555555', goal: 'yoga' as const },
    ].map((c) =>
      prisma.user.upsert({
        where: { telegramId: c.telegramId },
        update: {},
        create: c,
      }),
    ),
  );

  console.log(`Created ${clients.length} sample clients`);
  console.log('Seed completed!');
  console.log('Admin login: admin@lotos-studio.uz / admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
