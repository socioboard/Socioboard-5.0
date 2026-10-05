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
- The API router refuses to mount a `platform_admin` route unless `createApiRouter` gets a `platformAdminGuard`, so an admin route can never be open to any signed-in user. The guard (`auth/platform-admin.ts`) throws `NOT_PLATFORM_ADMIN` or `ADMIN_2FA_REQUIRED`; it runs after the session check and before anything else. It reads `isPlatformAdmin` and `twoFactorEnabled` from the database, not the session (Better Auth caches the user there), so taking admin away or turning 2FA off applies at once, and it requires the session's 2FA mark ([auth](auth.md)).
- `/api/admin` has the same middleware as `/api/v1`: origin check, rate limit (`admin`), session.
- Bull Board is at `/api/admin/queues` behind the same guard, **read-only** (`readOnlyMode`): retrying or cancelling a delivery goes through the audited endpoints, never a raw job action. It shows `WORKER_QUEUES` (`admin/queues.ts`), the list the overview counts too; the worker refuses to start if the queues it runs differ from that list, so a new queue can't be left out (the CI smoke test starts the worker).

## Behaviour (P2-B10)
- **Overview** and **publishing health** are cached in Valkey for 60 s. Health counts each finished attempt in the range by outcome (`published`, `failed` = final, `retried` = `will_retry`) per network, with the five most common final errors (kind, network code, message).
- **Problem targets**: `failed`, and `stuck` = `publishing` for over 15 minutes (it may be waiting on a retry or a rate limit; `reconcile` fails the ones with no job behind them). Live workspaces only, newest first.
- **Retry** (`TARGET_NOT_RETRYABLE` unless failed or stuck): back to `publishing`, a new try queued with publish-now's job id; a stuck one may already be on the network, which is why `reconcile` never retries it: the admin decides, and says why. **Cancel** (`TARGET_NOT_CANCELLABLE` for published, cancelled, or publishing and not stuck): failed, stuck, scheduled (its delayed job dropped) or pending. Both recompute the post's status and write an audit entry (`admin.target_retried` / `admin.target_cancelled`, actor type `admin`, the reason, the post and the status before).
- **Accounts needing attention**: `reauth_required`, or active with the token it posts with expiring within `withinDays`: its own where it has one, else its login's (a Facebook Page's own token outlives its login's, so the login expiring doesn't put it at risk). Each says how many scheduled targets it would fail.

## Alerts (P2-I1)
Built in, so every install has them with or without OpenObserve. `createOpsAlerts` (`admin/alerts.ts`) checks every 5 minutes in the api and in the worker (a Valkey counter per 5-minute slot lets one process run each check, and the api still checks when the worker is down):

| Alert | When | Links to |
| --- | --- | --- |
| `publish_failures` | At least `ALERT_FAILED_PUBLISHES` (default 10) deliveries failed for good in the last 15 minutes | `/admin/publishing` |
| `queue_backlog` | A queue has at least `ALERT_QUEUE_WAITING` (default 1000) jobs waiting, or its oldest waiting job has waited `ALERT_QUEUE_LAG_MINUTES` (default 10) | `/admin/queues` |
| `jobs_overdue` | A delayed job (a scheduled post, a retry) is `ALERT_QUEUE_LAG_MINUTES` past its time: no worker is promoting jobs | `/admin/queues` |

Each alert is one email to every platform admin with a verified address and an `error` log line (`ops alert`, with the alert's `kind`), so a log-based alert in OpenObserve can page too. Then that alert stays quiet for an hour (per queue for the queue alerts), even if the condition holds. A check that can't read the database or Valkey logs the error and tries again next time.

## Rules
- Admin endpoints never return decrypted tokens or secrets, and never post content (text, media, overrides): the console shows that a delivery failed and why, not what the customer wrote. Viewing content is phase 5's read-only view-as.
- Heavy aggregates are cached for 60 s; growth charts are precomputed nightly.
- Infrastructure metrics (CPU, memory, error traces) stay in OpenObserve; the console links out.
