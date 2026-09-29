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
# Start the server immediately (fast health check). The server does not touch
# the DB at boot, so migrations are run separately (once) with
# `npx prisma migrate deploy` against DATABASE_URL — see DEPLOYMENT.md.
CMD ["node", "dist/server.js"]
