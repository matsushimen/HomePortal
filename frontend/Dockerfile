# syntax=docker/dockerfile:1.5

FROM node:20-alpine AS base
WORKDIR /app

FROM base AS builder
ARG NEXT_PUBLIC_BACKEND_URL
ARG BACKEND_URL
ENV NEXT_TELEMETRY_DISABLED=1 \
    NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL:-http://localhost:8000} \
    BACKEND_URL=${BACKEND_URL:-http://backend:8000}
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.ts ./next.config.ts
EXPOSE 3000
CMD ["npm", "run", "start", "--", "--port", "3000", "--hostname", "0.0.0.0"]
