# syntax=docker/dockerfile:1.7
# The API (docs/infra.md, P0-I4). Build from the repo root:
#   docker build -f apps/api/Dockerfile -t socioboard-api .
# Multi-stage: the workspace is installed and built once, then only the API's production
# dependencies (flat node_modules: the bundle imports its workspace packages' dependencies)
# and its bundle go into a slim runtime that runs as the unprivileged `node` user.
ARG NODE_VERSION=24

FROM node:${NODE_VERSION}-slim AS base
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH CI=true
RUN corepack enable
WORKDIR /repo

FROM base AS build
COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm turbo run build --filter=@socioboard/api
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm --filter @socioboard/api deploy --prod --config.node-linker=hoisted /out

FROM node:${NODE_VERSION}-slim AS runtime
ENV NODE_ENV=production API_PORT=3000
WORKDIR /app
COPY --from=build --chown=node:node /out/node_modules ./node_modules
COPY --from=build --chown=node:node /out/package.json ./package.json
COPY --from=build --chown=node:node /repo/apps/api/dist ./dist
USER node
EXPOSE 3000
# Liveness without curl in the image: the process answers /api/health/live.
HEALTHCHECK --interval=10s --timeout=3s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.API_PORT||3000)+'/api/health/live').then(r=>process.exit(r.ok?0:1),()=>process.exit(1))"
# node directly (not pnpm or npm), so SIGTERM reaches the app and it shuts down gracefully.
CMD ["node", "dist/main.mjs"]
