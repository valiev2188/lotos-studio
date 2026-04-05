FROM node:20-slim
RUN npm install -g pnpm@9

WORKDIR /app

# Copy workspace manifest files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy package.json for each workspace package
COPY packages/types/package.json ./packages/types/
COPY packages/config/package.json ./packages/config/
COPY packages/ui/package.json ./packages/ui/
COPY apps/api/package.json ./apps/api/

# Copy Prisma schema BEFORE pnpm install
# (Prisma runs `prisma generate` as a postinstall hook and needs the schema)
COPY prisma/ ./prisma/

# Install all workspace dependencies
RUN pnpm install --frozen-lockfile

# Copy all source code
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

# Build shared packages first
RUN pnpm --filter @lotos/types build || true

# Build the API
RUN pnpm --filter @lotos/api build

ENV NODE_ENV=production
EXPOSE 3001

WORKDIR /app/apps/api
CMD ["node", "dist/index.js"]
