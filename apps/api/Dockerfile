FROM node:20-slim

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN npm install -g pnpm@9

WORKDIR /app

# Copy all workspace package.json files so pnpm lockfile resolves correctly
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/types/package.json ./packages/types/
COPY packages/config/package.json ./packages/config/
COPY packages/ui/package.json ./packages/ui/
COPY apps/api/package.json ./apps/api/
COPY apps/landing/package.json ./apps/landing/
COPY apps/miniapp/package.json ./apps/miniapp/
COPY apps/admin/package.json ./apps/admin/
COPY apps/bot/package.json ./apps/bot/
COPY prisma/ ./prisma/

RUN pnpm install --frozen-lockfile

# Explicitly generate Prisma client
RUN npx prisma generate

# Copy source code
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

# Build shared types and API
RUN pnpm --filter @lotos/types build || true
RUN pnpm --filter @lotos/api build

ENV NODE_ENV=production
EXPOSE 3001

WORKDIR /app/apps/api
CMD ["node", "dist/index.js"]
