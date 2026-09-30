# Infra & DevOps

As of 2026-09-23 · See also: [Architecture](architecture.md#environments-and-domains), [Stages](stages/README.md)

Everything that isn't application code but still has to be built: repo tooling, containers, CI/CD, environments, monitoring, backups and the self-host package. Each item has a phase and task ID.

| Item | Path / tool | Phase | Task |
| --- | --- | --- | --- |
| Monorepo tooling | pnpm workspaces, Turborepo, `tsconfig` base, ESLint, Prettier, dependency-cruiser (Changesets arrives with releases, P5-I5) | 0 | P0-I1, P0-I2 |
| Dev environment | `docker/compose.dev.yml`: Postgres 17, Valkey 8, Mailpit, and MinIO as an optional profile (`COMPOSE_PROFILES=minio`) for developers without S3. api, worker and web run on the host with `pnpm dev` (fast hot reload) | 0 | P0-I3 |
| Dockerfiles | `apps/api`, `apps/worker` (includes ffmpeg/ffprobe for video processing), `apps/web` (nginx static), `packages/db` (migrate); multi-stage, multi-arch. Built from the repo root (`docker build -f apps/api/Dockerfile .`); `.dockerignore` keeps `.env`, e2e sessions and local builds out. The api and worker images hold the bundle plus a flat production `node_modules` (`pnpm deploy --prod --config.node-linker=hoisted`: the bundle imports its workspace packages' dependencies), run as `node`, and start with `node` itself so SIGTERM reaches the app. The migrate image runs `prisma migrate deploy` and exits; the web image is nginx serving `dist` with index.html for app routes and `/healthz`. Sizes today: web 84 MB, migrate ~0.8 GB, api ~1.1 GB, worker ~1.75 GB (trimming them is a later task) | 0 | P0-I4 |
| CI | GitHub Actions (`.github/workflows/ci.yml`, on pushes to `main` and `6.0`, and on pull requests): gitleaks over the history → `pnpm check`, unit tests, build, catalog → integration tests (the dev compose's Postgres, Valkey, Mailpit, MinIO; storage off, then MinIO) → the four images built (amd64; multi-arch comes with releases) and smoke-tested by `docker/smoke-test.sh` (migrations apply, `/api/health` 200, the worker starts with ffmpeg, the web image serves app routes, api and worker exit 0 on SIGTERM; it can be run locally, see the script) → Playwright E2E (the app suite; the Meta suite never runs in CI) on pull requests to `main` and on demand | 0 | P0-I4 |
| Health checks | Load balancer and uptime checks use `GET /api/health` (readiness: 503 when Postgres or Valkey is down or while shutting down); container restart policies use `GET /api/health/live`, which never checks dependencies, so a database outage doesn't restart every api instance | 0 | P0-B11 |
| Repository | One repo, `socioboard/socioboard` (the renamed 5.0 repo): 6.0 on `main`, older code on `archive/*` branches; see [repo migration](repo-migration.md) | 0 | P0-I9 |
| Dev tunnels | Cloudflare Tunnel: `dev1..dev3.dev.socioboard.com` | 0 | P0-I8 |
| Staging | `app.staging.socioboard.com`, `media.staging.socioboard.com`; auto-deploy from `main` | 0 | P0-I7 |
| Storage bucket CORS | Browsers upload straight to the bucket (presigned PUTs) and view files through signed URLs, so the bucket allows `PUT` and `GET` from the app's origin with the `Content-Type` header, and exposes `ETag` (multipart uploads read each part's ETag; without it large uploads fail with "upload failed"). MinIO's defaults already allow this; S3 needs the rule | 0 (staging), 5 (production, self-host guide) | P0-I7, P5-I1, P5-I4 |
| Backups | Daily + point-in-time Postgres backups; storage bucket versioning; one tested restore; bucket lifecycle rule aborting incomplete multipart uploads after 1 day | 0 (staging), 5 (production) | P0-I6, P5-I1 (DevOps team) |
| Secrets | Env files locally; secret manager in staging/production; no secrets in the repo (gitleaks in CI with its default rules; `.gitleaks.toml` allows only the named, public dev-only example values that config validation refuses in production) | 0 | P0-I4 |
| Dependency hygiene | Renovate (`renovate.json`: weekly, grouped; needs the Renovate app installed on the repo), CodeQL (`.github/workflows/codeql.yml`, security-extended, weekly and on pushes/PRs), SBOM on release | 0 (Renovate, CodeQL), 5 (SBOM) | P0-I4, P5-I5 |
| Observability | Sentry (api, worker, web), OpenTelemetry traces → Grafana, uptime checks, alerts for failed-publish spikes and queue backlog | 2 (Sentry), 5 (full) | P2-I1, P5-I2 |
| Production | Chosen cloud: managed Postgres, Valkey, Amazon S3, CDN for web, api + worker autoscaling | 5 | P5-I1 |
| Load test | k6 script: 10k scheduled posts/hour against a mock network | 5 | P5-I3 |
| Self-host package | `docker/compose.selfhost.yml` (Postgres, Valkey, Caddy HTTPS; optional `minio` profile when the installer has no S3 bucket; optional `ai` profile running the pinned `ghcr.io/socioboard/socioboard-ai` image), `.env.example`, install + upgrade guides, per-network setup guides | 5 | P5-I4 |
| Releases | Semver tags, changelog (Changesets), images on GHCR | 5 | P5-I5 |

## Environments
| Env | URL | Deploys | Data |
| --- | --- | --- | --- |
| Local | `localhost` / `devN.dev.socioboard.com` | manual | seed data |
| Staging | `app.staging.socioboard.com` | every merge to `main` | test accounts only |
| Production | `app.socioboard.com` | tagged releases | customers |

## Public media address
`media.<domain>` (and the dev tunnels) must proxy to the API's `/public-media` path, e.g. Caddy `media.socioboard.com { rewrite * /public-media{uri}; reverse_proxy api:3000 }`, with `MEDIA_PUBLIC_URL=https://media.socioboard.com`. Networks that fetch media themselves (Instagram images, TikTok) read files there; addresses are signed and expire (see [media](backend/modules/media.md#delivering-media-to-networks-p1-b8)). TikTok's URL-prefix verification covers `https://media.socioboard.com/`.
