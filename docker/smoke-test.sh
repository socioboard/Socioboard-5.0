#!/usr/bin/env bash
# Smoke test of the built images (docs/infra.md, P0-I4). A bundling mistake once broke only the
# built app, so CI starts the real images: the migration runs, the API answers /api/health 200,
# the worker starts, the web image serves the app, and the API and worker shut down cleanly on
# SIGTERM (exit 0, "shutting down" logged). Postgres and Valkey must be running (the dev compose).
#
#   docker/smoke-test.sh                      images tagged socioboard-{api,worker,migrate,web}:ci
#   TAG=local DB_HOST=host.docker.internal docker/smoke-test.sh     on Docker Desktop
set -euo pipefail

TAG="${TAG:-ci}"
DB_HOST="${DB_HOST:-localhost}"
PG_PORT="${POSTGRES_PORT:-5440}"
VALKEY_PORT="${VALKEY_PORT:-6380}"
# On Linux CI the containers share the host network; elsewhere ports are published.
# API_HOST_PORT / WEB_HOST_PORT pick free host ports when a dev server already holds 3000.
API_PORT_ON_HOST=3000
if [ "$DB_HOST" = "localhost" ]; then NET=(--network host); PUBLISH_API=(); PUBLISH_WEB=(); WEB_PORT=8080
else
  NET=()
  API_PORT_ON_HOST="${API_HOST_PORT:-3000}"
  WEB_PORT="${WEB_HOST_PORT:-8081}"
  PUBLISH_API=(-p "${API_PORT_ON_HOST}:3000")
  PUBLISH_WEB=(-p "${WEB_PORT}:8080")
fi

# Throwaway secrets for this run only (production rejects the example ones).
AUTH_SECRET="$(head -c 36 /dev/urandom | base64 | tr -d '\n/+=')"
ENC_KEY="$(head -c 32 /dev/urandom | base64 | tr -d '\n')"
ENV=(
  -e "DATABASE_URL=postgresql://socioboard:socioboard@${DB_HOST}:${PG_PORT}/socioboard"
  -e "REDIS_URL=redis://${DB_HOST}:${VALKEY_PORT}"
  -e "AUTH_SECRET=${AUTH_SECRET}"
  -e "ENCRYPTION_KEYS=k1:${ENC_KEY}"
  -e "APP_URL=http://localhost:5173"
  -e "SMTP_URL=smtp://${DB_HOST}:1025"
  -e "TRUST_PROXY=loopback"
)

fail() { echo "SMOKE FAILED: $*" >&2; docker logs smoke-api 2>/dev/null | tail -40 >&2 || true; docker logs smoke-worker 2>/dev/null | tail -40 >&2 || true; exit 1; }
cleanup() { docker rm -f smoke-api smoke-worker smoke-web >/dev/null 2>&1 || true; }
trap cleanup EXIT
cleanup

echo "== migrate"
docker run --rm "${NET[@]}" -e "DATABASE_URL=postgresql://socioboard:socioboard@${DB_HOST}:${PG_PORT}/socioboard" "socioboard-migrate:${TAG}" \
  || fail "migrations did not apply"

# Stops a container with SIGTERM and checks it exited 0 after saying it was shutting down.
stop_cleanly() {
  local name="$1"
  docker stop -t 40 "$name" >/dev/null
  local code; code="$(docker inspect -f '{{.State.ExitCode}}' "$name")"
  [ "$code" = "0" ] || fail "$name exited $code on SIGTERM (expected 0)"
  docker logs "$name" 2>&1 | grep -q 'shutting down' || fail "$name did not log a graceful shutdown"
  echo "$name: stopped cleanly on SIGTERM"
}

echo "== api"
docker run -d --name smoke-api "${NET[@]}" "${PUBLISH_API[@]}" "${ENV[@]}" "socioboard-api:${TAG}" >/dev/null
for _ in $(seq 1 60); do
  status="$(curl -s -o /tmp/health.json -w '%{http_code}' "http://localhost:${API_PORT_ON_HOST}/api/health" || true)"
  [ "$status" = "200" ] && break
  [ "$(docker inspect -f '{{.State.Running}}' smoke-api)" = "true" ] || fail "api exited on start"
  sleep 1
done
[ "$status" = "200" ] || fail "api /api/health answered ${status:-nothing} after 60 s"
echo "api: /api/health 200 $(cat /tmp/health.json)"
stop_cleanly smoke-api

echo "== worker"
docker run -d --name smoke-worker "${NET[@]}" "${ENV[@]}" "socioboard-worker:${TAG}" >/dev/null
for _ in $(seq 1 60); do
  docker logs smoke-worker 2>&1 | grep -q 'worker started' && break
  [ "$(docker inspect -f '{{.State.Running}}' smoke-worker)" = "true" ] || fail "worker exited on start"
  sleep 1
done
docker logs smoke-worker 2>&1 | grep -q 'worker started' || fail "worker did not start in 60 s"
docker exec smoke-worker sh -c 'ffmpeg -version >/dev/null && ffprobe -version >/dev/null' \
  || fail "ffmpeg/ffprobe missing from the worker image"
echo "worker: started, ffmpeg and ffprobe present"
stop_cleanly smoke-worker

echo "== web"
docker run -d --name smoke-web "${PUBLISH_WEB[@]}" "socioboard-web:${TAG}" >/dev/null
# The host network can't be shared on Docker Desktop, so the web image always publishes a port
# there; on Linux CI it's reached through the container's own address.
if [ "${#NET[@]}" -gt 0 ]; then WEB="http://$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' smoke-web):8080"
else WEB="http://localhost:${WEB_PORT}"; fi
for _ in $(seq 1 20); do curl -sf "$WEB/healthz" >/dev/null && break; sleep 1; done
curl -sf "$WEB/healthz" >/dev/null || fail "web /healthz did not answer"
# A client-side route is answered with the app's page.
curl -sf "$WEB/w/some-workspace/posts" | grep -q '<div id="root">' || fail "web did not serve index.html for an app route"
echo "web: serves the app and its routes"

echo "SMOKE PASSED"
