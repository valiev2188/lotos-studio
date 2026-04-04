FROM node:20-alpine AS base
RUN npm install -g pnpm@9

# ---- Install dependencies ----
FROM base AS deps
WORKDIR /app
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages/types/package.json ./packages/types/package.json
COPY packages/config/package.json ./packages/config/package.json 2>/dev/null || true
RUN pnpm install --frozen-lockfile

# ---- Build ----
FROM deps AS builder
WORKDIR /app
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/
COPY prisma/ ./prisma/
RUN pnpm --filter @lotos/types build 2>/dev/null || true
RUN pnpm --filter @lotos/api exec prisma generate --schema=../../prisma/schema.prisma 2>/dev/null || \
    cd prisma && npx prisma generate
RUN pnpm --filter @lotos/api build

# ---- Production image ----
FROM node:20-alpine AS runner
RUN npm install -g pnpm@9
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/packages/types/package.json ./packages/types/package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules 2>/dev/null || true
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/prisma ./prisma

# Generate Prisma client in production image
RUN cd /app && npx prisma generate --schema=prisma/schema.prisma 2>/dev/null || true

WORKDIR /app/apps/api

EXPOSE 3001

CMD ["node", "dist/index.js"]
