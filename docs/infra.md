# Infra & DevOps

As of 2026-09-23 · See also: [Architecture](architecture.md#environments-and-domains), [Stages](stages/README.md)

Everything that isn't application code but still has to be built: repo tooling, containers, CI/CD, environments, monitoring, backups and the self-host package. Each item has a phase and task ID.

| Item | Path / tool | Phase | Task |
| --- | --- | --- | --- |
| Monorepo tooling | pnpm workspaces, Turborepo, `tsconfig` base, ESLint, Prettier, dependency-cruiser (Changesets arrives with releases, P5-I5) | 0 | P0-I1, P0-I2 |
| Dev environment | `docker/compose.dev.yml`: Postgres 17, Valkey 8, Mailpit, and MinIO as an optional profile (`COMPOSE_PROFILES=minio`) for developers without S3. api, worker and web run on the host with `pnpm dev` (fast hot reload) | 0 | P0-I3 |
| Dockerfiles | `apps/api`, `apps/worker` (includes ffmpeg/ffprobe for video processing), `apps/web` (nginx static), `packages/db` (migrate); multi-stage, multi-arch | 0 | P0-I4 |
| CI | GitHub Actions: install → lint → typecheck → unit → integration (Postgres/Valkey services) → build images → Playwright E2E on PRs to main | 0 | P0-I4 |
| Dev tunnels | Cloudflare Tunnel: `dev1..dev3.dev.socioboard.com` | 0 | P0-I8 |
| Staging | `app.staging.socioboard.com`, `media.staging.socioboard.com`; auto-deploy from `main` | 0 | P0-I7 |
| Backups | Daily + point-in-time Postgres backups; storage bucket versioning; one tested restore; bucket lifecycle rule aborting incomplete multipart uploads after 1 day | 0 (staging), 5 (production) | P0-I6, P5-I1 |
| Secrets | Env files locally; secret manager in staging/production; no secrets in the repo (gitleaks in CI) | 0 | P0-I4 |
| Dependency hygiene | Renovate, CodeQL, SBOM on release | 0 (Renovate, CodeQL), 5 (SBOM) | P0-I4, P5-I5 |
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
