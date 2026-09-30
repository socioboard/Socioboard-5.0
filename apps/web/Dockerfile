# syntax=docker/dockerfile:1.7
# The web app (docs/infra.md, P0-I4): the built static files served by nginx, every unknown path
# answered with index.html (client-side routes). /api is routed to the API by the reverse proxy in
# front (Caddy), not here. Build from the repo root:
#   docker build -f apps/web/Dockerfile -t socioboard-web .
ARG NODE_VERSION=24

FROM node:${NODE_VERSION}-slim AS build
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH CI=true
RUN corepack enable
WORKDIR /repo
COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm turbo run build --filter=@socioboard/web

FROM nginxinc/nginx-unprivileged:1.29-alpine AS runtime
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/apps/web/dist /usr/share/nginx/html
EXPOSE 8080
