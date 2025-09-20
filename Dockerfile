FROM node:20.19.4-slim AS base

ENV NODE_ENV=production
WORKDIR /app

# Required system deps for sharp/lightningcss/etc.
RUN apt-get update && apt-get install -y --no-install-recommends \
  ca-certificates \
  curl \
  gnupg \
  && rm -rf /var/lib/apt/lists/*

# Install deps (including dev deps) for building
FROM base AS deps
ENV NODE_ENV=development
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Build
FROM base AS builder
ENV NODE_ENV=development
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Ensure Next does not try to auto-install dev deps mid-build
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Runtime image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Use the node user provided by the image
USER node

COPY --chown=node:node --from=builder /app/public ./public
COPY --chown=node:node --from=builder /app/.next/standalone ./
COPY --chown=node:node --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
CMD ["node", "server.js"]