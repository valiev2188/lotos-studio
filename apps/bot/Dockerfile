FROM node:20-slim

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN npm install -g pnpm@9

WORKDIR /app

# Copy workspace config
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy all package.json files for dependency resolution
COPY packages/types/package.json ./packages/types/
COPY packages/config/package.json ./packages/config/
COPY packages/ui/package.json ./packages/ui/
COPY apps/bot/package.json ./apps/bot/
COPY apps/api/package.json ./apps/api/
COPY apps/landing/package.json ./apps/landing/
COPY apps/miniapp/package.json ./apps/miniapp/
COPY apps/admin/package.json ./apps/admin/

# Copy prisma schema for client generation
COPY prisma/ ./prisma/

# Install deps
RUN pnpm install --frozen-lockfile
RUN npx prisma generate

# Copy source code
COPY packages/ ./packages/
COPY apps/bot/ ./apps/bot/

# Build types then bot
RUN pnpm --filter @lotos/types build || true
RUN pnpm --filter @lotos/bot build

ENV NODE_ENV=production

WORKDIR /app/apps/bot
CMD ["node", "dist/index.js"]
