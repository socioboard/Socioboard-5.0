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
| `FeatureFlag` | key, enabled, rules JSON (workspace ids, % rollout), updatedBy | Read by all modules through `flags.isOn(key, ctx)` |
| `Announcement` | id, message, level, startsAt, endsAt, audience | Shown as an in-app banner |
| `MaintenanceWindow` | id, startsAt, endsAt, message, blockWrites | Optional read-only mode |
| `AbuseFlag` | id, workspaceId, reason, status, createdBy | Suspended workspaces can't publish |

## API (all under `/api/admin`, platform admin only)
| Method | Path | Phase | Description |
| --- | --- | --- | --- |
| GET | `/overview` | 2 | Counts: sign-ups, active workspaces, posts published/failed today, queue backlog, AI usage, MRR |
| GET | `/publishing/health?network=&range=` | 2 | Success/failure rates per network, top errors |
| GET | `/publishing/failed` | 2 | Failed or stuck targets (filterable) |
| POST | `/publishing/targets/:tid/retry` · `/cancel` | 2 | Retry or cancel a target |
| GET | `/accounts/expiring` | 2 | Accounts with expiring or revoked tokens |
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

## Rules
- Admin endpoints never return decrypted tokens or secrets.
- Heavy aggregates are cached for 60 s; growth charts are precomputed nightly.
- Infrastructure metrics (CPU, memory, error traces) stay in Grafana/Sentry; the console links out.
