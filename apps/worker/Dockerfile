# syntax=docker/dockerfile:1.7
# The worker (docs/infra.md, P0-I4): queue processors (publishing, media, purges). Includes
# ffmpeg and ffprobe for video duration, thumbnails and transcoding. Build from the repo root:
#   docker build -f apps/worker/Dockerfile -t socioboard-worker .
ARG NODE_VERSION=24

FROM node:${NODE_VERSION}-slim AS base
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH CI=true
RUN corepack enable
WORKDIR /repo

FROM base AS build
COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm turbo run build --filter=@socioboard/worker
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm --filter @socioboard/worker deploy --prod --config.node-linker=hoisted /out

FROM node:${NODE_VERSION}-slim AS runtime
RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg \
  && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production FFMPEG_PATH=/usr/bin/ffmpeg FFPROBE_PATH=/usr/bin/ffprobe
WORKDIR /app
COPY --from=build --chown=node:node /out/node_modules ./node_modules
COPY --from=build --chown=node:node /out/package.json ./package.json
COPY --from=build --chown=node:node /repo/apps/worker/dist ./dist
USER node
# node directly, so SIGTERM reaches the worker: it finishes its current jobs (up to 30 s), then exits.
CMD ["node", "dist/main.mjs"]
