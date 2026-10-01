# Module: admin

**Phase:** 2 (v1: queues, publishing health), 5 (v2: users, workspaces, billing, AI, controls), 6.1 (growth dashboards) · **Path:** `packages/core/src/modules/admin` · **Depends on:** read access to most modules; audit (every action logged)

## Purpose
APIs behind the platform admin console (`/admin` in the web app) for Socioboard staff to monitor and operate the whole service. Separate from workspace roles.

## Access
- Only users with `User.isPlatformAdmin = true`, with 2FA enabled and verified in the current session.
- Every write action is recorded in [audit](audit.md) with `actorType = admin`.
- "View as user" is **read-only**: it issues a special session flagged `impersonating`, blocks every non-GET request, and shows the customer a banner/notice.

## Data
| Table | Key fields | Notes |
| --- | --- | --- |
| `FeatureFlag` | key (unique), description, enabled, rules JSON (`{ workspaceIds?, percent? }`, `{}` = everyone), updatedById? | Read by all modules through `flags.isOn(key, ctx)`; table from P2-B1 |
| `Announcement` | id, message, level, startsAt, endsAt, audience | Shown as an in-app banner |
| `MaintenanceWindow` | id, startsAt, endsAt, message, blockWrites | Optional read-only mode |
| `AbuseFlag` | id, workspaceId, reason, status, createdBy | Suspended workspaces can't publish |

## API (all under `/api/admin`, platform admin only)
| Method | Path | Phase | Description |
| --- | --- | --- | --- |
| GET | `/overview` | 2 | Counts over the last 24 hours: sign-ups, published, failed; active workspaces (30 days), stuck targets, accounts needing attention, queue backlog. Phase 5 adds AI usage and MRR |
| GET | `/publishing/health?range=24h\|7d\|30d&network=` | 2 | Per network: published, failed, retried, success rate, top 5 errors |
| GET | `/publishing/failed?state=failed\|stuck&network=&errorKind=&workspaceId=` | 2 | Failed or stuck targets across workspaces, paged |
| POST | `/publishing/targets/:tid/retry` · `/cancel` | 2 | Retry or cancel a target; body `{ reason }` (3–500 characters, kept in the audit log) |
| GET | `/accounts/expiring?state=expiring\|reauth_required&withinDays=7&network=` | 2 | Accounts whose token expires soon or that need reconnecting, with how many scheduled targets they put at risk |
| — | `/queues/*` | 2 | Bull Board mounted here |
| GET | `/users`, `/users/:id` | 5 | Search and inspect users |
| GET | `/workspaces`, `/workspaces/:id` | 5 | Search and inspect workspaces (members, accounts, plan, usage) |
| POST | `/workspaces/:id/suspend` · `/restore` | 5 | Suspend or restore |
| POST | `/workspaces/:id/plan` · `/trial` · `/credits` | 5 | Change plan, extend trial, grant AI credits |
| GET | `/workspaces/:id/invoices` | 5 | Invoice history (number, date, amount, status paid/open/failed, PDF link), read live from Stripe |
| GET | `/workspaces/:id/payments` | 5 | Payment history (charges, refunds, failures with reason), read live from Stripe, each with an "Open in Stripe" link |
| POST | `/users/:id/ban` · `/unban` · `/revoke-sessions` | 5 | User management via Better Auth admin plugin (audited) |
| POST | `/users/:id/view-as` | 5 | Start a read-only view-as session |
| GET | `/networks/quotas` | 5 | Rate-limit and quota usage per network, X spend |
| GET | `/ai/jobs`, `/ai/costs` | 5 | AI jobs, failures, cost per workspace |
| GET | `/billing/subscriptions`, `/billing/failed-payments` | 5 | With Stripe links |
| CRUD | `/flags`, `/announcements`, `/maintenance`, `/abuse-flags` | 5 | Controls |
| GET | `/audit` | 5 | Platform audit log |
| GET | `/metrics/growth` | 6.1 | Sign-up, activation and retention charts |

Shapes are in `packages/contracts/src/admin.ts`; routes use `access: 'platform_admin'`, and `defineRoute` allows that access on `/api/admin/*` paths only (and those paths only with it).

## Errors (API)
| Code | Status | When |
| --- | --- | --- |
| `NOT_PLATFORM_ADMIN` | 403 | Signed in, but not a platform admin |
| `ADMIN_2FA_REQUIRED` | 403 | A platform admin without 2FA verified in this session |
| `TARGET_NOT_FOUND` | 404 | No such target (any workspace) |
| `TARGET_NOT_RETRYABLE` / `TARGET_NOT_CANCELLABLE` | 409 | Retry of a target that isn't failed or stuck / cancel of one already published or cancelled |

## Mounting (P2-B10)
- The API router refuses to mount a `platform_admin` route unless `createApiRouter` gets a `platformAdminGuard`, so an admin route can never be open to any signed-in user. The guard throws `NOT_PLATFORM_ADMIN` or `ADMIN_2FA_REQUIRED`; it runs after the session check and before anything else.
- `/api/admin` needs the same middleware as `/api/v1` (origin check, rate limit, session); until then an admin route answers 401.

## Rules
- Admin endpoints never return decrypted tokens or secrets, and never post content (text, media, overrides): the console shows that a delivery failed and why, not what the customer wrote. Viewing content is phase 5's read-only view-as.
- Heavy aggregates are cached for 60 s; growth charts are precomputed nightly.
- Infrastructure metrics (CPU, memory, error traces) stay in Grafana/Sentry; the console links out.
