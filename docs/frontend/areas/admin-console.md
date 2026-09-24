# Area: admin-console

**Phase:** 2 (overview-lite, publishing health, queues), 5 (users, workspaces, AI, billing, controls, audit), 6.1 (growth) · **Folder:** `features/admin` · **Backend:** [admin](../../backend/modules/admin.md)

Only for platform admins (`isPlatformAdmin`) with 2FA. Uses the same shell with a distinct "Admin" top bar color so staff always know they're in the console.

## Screens
| Route | Screen | Phase |
| --- | --- | --- |
| `/admin` | Overview: KPI row (sign-ups, active workspaces, published/failed today, queue backlog, AI usage, MRR) + small trend charts | 2 (basic), 5 |
| `/admin/publishing` | Health per network (success rate, top errors) + failed/stuck targets table with Retry / Cancel | 2 |
| `/admin/queues` | Embedded Bull Board | 2 |
| `/admin/accounts` | Expiring or revoked social account tokens | 2 |
| `/admin/users`, `/admin/users/:id` | Search users (name, email, sign-up date, verified, 2FA, last active); details: workspaces, sessions; ban/unban, revoke sessions, "View as user (read-only)" | 5 |
| `/admin/workspaces`, `/admin/workspaces/:id` | Search workspaces; members, accounts, plan, usage; **Billing tab: invoices and payment history** (from Stripe, with PDF and "Open in Stripe" links); suspend/restore; change plan, extend trial, grant credits | 5 |
| `/admin/networks` | API quota and rate-limit usage, X spend | 5 |
| `/admin/ai` | AI jobs, failures, cost per workspace | 5 |
| `/admin/billing` | Subscriptions, failed payments (links to Stripe) | 5 |
| `/admin/controls` | Feature flags, announcements, maintenance mode, abuse flags | 5 |
| `/admin/audit` | Platform audit log | 5 |
| `/admin/growth` | Sign-up, activation, retention charts | 6.1 |

## Behavior
- Every destructive action asks for confirmation and a reason (stored in the audit log).
- **View-as mode:** opens the customer's workspace in a new tab with a persistent "Viewing as <user>, read-only" banner; all write buttons are disabled.
- Links to Grafana and Sentry for infrastructure detail.
