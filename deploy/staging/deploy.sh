#!/usr/bin/env bash
# Deploys the checkout this script is in to staging (docs/infra.md#staging-pm2, P0-I7): pull,
# install, build, migrate, reload the PM2 processes. Run on the server as the deploy user:
#   deploy/staging/deploy.sh
# BRANCH (default 6.0 until the repo migration puts 6.0 on main) and SOCIOBOARD_ENV_FILE
# (default /etc/socioboard/staging.env) can be overridden.
set -euo pipefail

BRANCH="${BRANCH:-6.0}"
export SOCIOBOARD_ENV_FILE="${SOCIOBOARD_ENV_FILE:-/etc/socioboard/staging.env}"
root="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$root"

[ -r "$SOCIOBOARD_ENV_FILE" ] || { echo "No settings at $SOCIOBOARD_ENV_FILE" >&2; exit 1; }

echo "==> Pulling $BRANCH"
git fetch --prune origin "$BRANCH"
# Fast-forward only: a server checkout with local changes stops the deploy instead of losing them.
git checkout -q "$BRANCH"
git merge --ff-only "origin/$BRANCH"

echo "==> Installing and building $(git rev-parse --short HEAD)"
pnpm install --frozen-lockfile
pnpm build

echo "==> Applying database migrations"
# Prisma reads DATABASE_URL from the environment; the settings file holds it.
set -a
# shellcheck source=/dev/null
. "$SOCIOBOARD_ENV_FILE"
set +a
pnpm db:deploy

echo "==> Reloading PM2"
pm2 startOrReload deploy/staging/ecosystem.config.cjs --update-env
pm2 save

echo "==> Waiting for the API"
port="${API_PORT:-3000}"
for _ in $(seq 1 30); do
  if curl -fsS "http://127.0.0.1:${port}/api/health" >/dev/null; then
    echo "Deployed $(git rev-parse --short HEAD)"
    exit 0
  fi
  sleep 2
done
echo "The API didn't report healthy within 60 s: pm2 logs socioboard-api" >&2
exit 1
