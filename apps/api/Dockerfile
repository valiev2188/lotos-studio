FROM node:20-alpine
RUN npm install -g pnpm@9

WORKDIR /app

# Copy workspace config first
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy ALL package.json files for workspace resolution
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/
COPY packages/config/package.json ./packages/config/
COPY packages/ui/package.json ./packages/ui/ 2>/dev/null || true

# Copy prisma schema BEFORE install (prisma generate runs as postinstall)
COPY prisma/ ./prisma/

# Install all dependencies (includes prisma generate postinstall)
RUN pnpm install --frozen-lockfile

# Copy all source code
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

# Build packages
RUN pnpm --filter @lotos/types build 2>/dev/null || true

# Build API
RUN pnpm --filter @lotos/api build

ENV NODE_ENV=production
EXPOSE 3001

WORKDIR /app/apps/api
CMD ["node", "dist/index.js"]
