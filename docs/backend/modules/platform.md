# Module: platform (shared infrastructure)

**Phase:** 0 (all parts), extended as later phases need · **Path:** `packages/core/src/platform/*` · **Depends on:** nothing inside Socioboard (lowest layer)

## Purpose
The shared building blocks every feature module uses. No business logic lives here. Feature modules receive these through their `createXModule(deps)` factory.

## Parts
| Part | Path | What it provides | Phase |
| --- | --- | --- | --- |
| config | `platform/config` | Zod-validated env; typed `config` object; feature toggles derived from which keys are set (`billing.enabled`, `ai.enabled`; `networks.enabled` in 1); `ENCRYPTION_KEYS` for token encryption (example dev key refused in production) | 0 |
| logger | `platform/logger` | Pino JSON logger with request/job IDs; redaction of tokens and secrets | 0 |
| db | `packages/db` + `platform/db` | Prisma schema, migrations, generated client; workspace-scope client extension; **seed scripts** (dev users, demo workspace, sample posts) | 0 |
| http | `platform/http` | Express app factory, error classes + `errorHandler`, `validate()`, `requestId`, `rateLimit` (Valkey-backed), `session`, `workspace`, `requirePermission`, `/api/health` (db + valkey + storage checks), OpenAPI generation from contracts, served at `/api/docs` in dev | 0 |
| queue | `platform/queue` | One connection string, `REDIS_URL` (`redis://:password@host:6379/0`, or `rediss://` for TLS), pointing at **Valkey or Redis**; both speak the same protocol, so no code or credential differences. BullMQ connection, queue registry, `defineQueue(name, processor, opts)` (0); per-network group rate limiter helpers (1, with publishing); Bull Board adapter (2, for `/admin/queues`) | 0, 1, 2 |
| storage | `platform/storage` | S3 client (Amazon S3 by default; MinIO or any S3-compatible service via `S3_ENDPOINT` + `S3_FORCE_PATH_STYLE`): presigned upload/download, multipart, public media URLs | 0 |
| mailer | `platform/mailer` + `packages/emails` | Nodemailer SMTP transport; React Email templates (verification, reset, magic link, invitation, publish failed, account reconnect, review request, digest, report ready, export ready, payment failed); logs links when no SMTP | 0 (base), each phase adds templates |
| events | `platform/events` | Typed in-process event bus; `emitDurable()` also enqueues to BullMQ | 0 |
| realtime | `platform/realtime` | Socket.IO server on api, Valkey adapter, auth on connect, room helpers (`user:`, `workspace:`) | 2 |
| crypto | `platform/crypto` | AES-256-GCM encrypt/decrypt for tokens (key rotation support), HMAC sign/verify for webhooks and OAuth state | 0 (crypto), 1 (tokens) |
| flags | `platform/flags` | `flags.isOn(key, ctx)` reading `FeatureFlag` with a 30 s cache | 2 |
| clock | `platform/clock` | Injectable time source (tests control "now") | 0 |
| kv | `platform/kv` | Key-value store on Valkey (`get`, `getAndDelete`, `set` with TTL, `incr` counters): auth session cache and rate-limit counters | 0 |
| ids | `platform/ids` | `newId()`: UUIDv7, used for every id we generate (Better Auth included) | 0 |

## Entry points
| App | Path | Does | Phase |
| --- | --- | --- | --- |
| api | `apps/api/src/main.ts` | `bootstrap()` (config + logger, fail fast on bad env), `createPlatform()` (every client, created once), all modules; mounts routers; starts HTTP (+ Socket.IO in 2) | 0 |
| worker | `apps/worker/src/main.ts` | Builds the same modules; registers every queue processor and repeatable job; graceful shutdown | 0 (skeleton), 1 (publish) |
| migrate | `packages/db` script | `prisma migrate deploy` for releases | 0 |

## Rules
- Nothing in `platform` imports from `modules`.
- Every external client (DB, Valkey, S3, SMTP) is created once at startup and injected, never imported as a global.
- Graceful shutdown: stop accepting requests/jobs, finish in-flight work (30 s max), close connections. Jobs still running after 30 s are left to BullMQ, which retries them on another worker once their lock expires.
- Workspace isolation has two layers: `db.forWorkspace(id)` scopes every top-level query (reads, updates, deletes, creates; unknown operations fail closed), and relations between workspace-owned tables use **composite foreign keys** `(xId, workspaceId) → (id, workspaceId)` (with `@@unique([id, workspaceId])` on the target), so Postgres rejects a row in one workspace pointing at a row in another. Both were verified against Postgres on 2026-09-24: without the composite key, a nested `connect` linked another workspace's row.
- Logs never contain secrets: any field named like a token, password, secret, API key, cookie or authorization header is redacted at any depth, including inside error objects.
