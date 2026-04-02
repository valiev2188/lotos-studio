# Lotos Studio - System Architecture & Context

## Обзор (Overview)
Это монорепозиторий для проекта **Lotos Studio** (фитнес/студия).
Проект использует **Turborepo** и пакетный менеджер **pnpm**.

## Основные Технологии (Tech Stack)
- **Фронтенд:** Next.js, React, TailwindCSS, TypeScript.
- **Бэкенд/API:** Node.js (скорее всего Express или Fastify, находится в `apps/api`), TypeScript.
- **База данных:** **Supabase** (PostgreSQL) поверх Prisma ORM.
- **Телеграм Бот:** Разрабатывается для мини-аппа (находится в `apps/bot`). Клиентский Mini App находится в `apps/miniapp`.
- **Админка / Лендинг:** `apps/admin` и `apps/landing`.

## Архитектура Базы Данных (Prisma & Supabase)
- Файл схемы: `prisma/schema.prisma`
- Провайдер ORM: `postgresql`.
- **Внимание агентам (AI Agents):** 
  - Используется полноценный PostgreSQL со всеми его фичами (Enums, Json, массивы, Decimal).
  - Подключение к БД осуществляется через `DATABASE_URL` (Supabase). Убедитесь, что миграции и пуши выполняются через этот URL.

## Переменные окружения (.env)
Локальный конфиг находится в: `.env`.
Важные переменные:
- `DATABASE_URL` — ссылка на PostgreSQL (Supabase).
- `SUPABASE_URL` — ссылка на API Supabase.
- `SUPABASE_ANON_KEY` — публичный ключ для доступа к Supabase.
- `TELEGRAM_BOT_TOKEN` — ключ от Telegram-бота.
- `DATABASE_URL` — URL базы для Prisma.

## Дополнительно
Архитектурная схема (UI) лежит в корне: `lotos-architecture.html`.
Все типы TS-приложений вынесены в `packages/types`.
UI-компоненты вынесены в `packages/ui` (если есть).
