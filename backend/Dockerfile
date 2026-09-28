# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app
RUN apk add --no-cache openssl
COPY package*.json ./
RUN npm ci
COPY prisma ./prisma
RUN npx prisma generate
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---- Runtime stage ----
FROM node:20-alpine AS runtime
WORKDIR /app
RUN apk add --no-cache openssl
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY prisma ./prisma
RUN npx prisma generate
COPY --from=build /app/dist ./dist
# Local uploads dir is ephemeral in containers — use object storage in real prod.
RUN mkdir -p uploads
EXPOSE 4000
# Apply migrations, then start. DATABASE_URL / JWT_SECRET / CORS_ORIGIN come from env.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
