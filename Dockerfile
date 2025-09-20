# syntax=docker/dockerfile:1

# 1) Install all dependencies (including dev) to build Next.js
FROM node:20.19.4-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# 2) Build the app with dev deps available
FROM node:20.19.4-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# 3) Run with Next.js standalone output
FROM node:20.19.4-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Copy the standalone server and assets
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
