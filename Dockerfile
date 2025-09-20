# syntax=docker/dockerfile:1

# 1) Install deps (add libc6-compat for native libs)
FROM node:20.19.4-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package*.json ./
# Lock exact deps for CI
RUN npm ci

# 2) Build (disable Turbopack to confirm the CSS error is a TP bug)
FROM node:20.19.4-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat
ENV NEXT_TELEMETRY_DISABLED=1
# Explicitly force Webpack build (toggle back to true later if you want Turbopack)
ENV NEXT_PRIVATE_TURBOPACK=false
# (Optional) give build more heap to avoid worker crashes masquerading as EOF
ENV NODE_OPTIONS="--max-old-space-size=2048"

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Clean any stale caches that can confuse the parser
RUN rm -rf .next node_modules/.cache || true

# If you build sharp or other native deps during build:
# RUN apk add --no-cache python3 make g++  # only if your build actually needs node-gyp

RUN npm run build

# 3) Run with standalone output
FROM node:20.19.4-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
RUN apk add --no-cache libc6-compat

# These paths assume next.config.js has:  module.exports = { output: 'standalone' }
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]