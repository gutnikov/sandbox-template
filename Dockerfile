# syntax=docker/dockerfile:1

FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml* ./
# Если лок-файл отстал от package.json, ставим по свежему разрешению:
# в прототипе забытый lockfile не должен ломать выкат.
RUN pnpm install --frozen-lockfile || pnpm install

COPY . .
RUN pnpm build

FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --prod --frozen-lockfile || pnpm install --prod

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
# Порт задаёт платформа. Значение по умолчанию — только чтобы образ
# запускался и без неё.
ENV PORT=3000

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./

USER node
EXPOSE 3000
CMD ["node", "dist/server/index.js"]
