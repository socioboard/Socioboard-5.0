# syntax=docker/dockerfile:1.7
# Database migrations (docs/infra.md, P0-I4): runs `prisma migrate deploy` against DATABASE_URL
# and exits. Run it before starting a new API version. Build from the repo root:
#   docker build -f packages/db/Dockerfile -t socioboard-migrate .
ARG NODE_VERSION=24

FROM node:${NODE_VERSION}-slim AS base
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH CI=true
RUN corepack enable
WORKDIR /repo

FROM base AS build
COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
# The Prisma CLI is a dev dependency of the db package: keep it (no --prod).
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm --filter @socioboard/db deploy --config.node-linker=hoisted /out

FROM node:${NODE_VERSION}-slim AS runtime
# Prisma's schema engine (migrate) needs OpenSSL, which the slim image doesn't have.
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build --chown=node:node /out ./
USER node
CMD ["node_modules/.bin/prisma", "migrate", "deploy"]
