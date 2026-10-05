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
- Every destructive action asks for confirmation and a reason, 3–500 characters (stored in the audit log).
- Phase 2 API: `GET /api/admin/overview`, `/publishing/health`, `/publishing/failed`, `POST /publishing/targets/:tid/retry` and `/cancel`, `GET /accounts/expiring` (shapes in `packages/contracts/src/admin.ts`). The console shows deliveries, errors and accounts, never post content.
- **View-as mode:** opens the customer's workspace in a new tab with a persistent "Viewing as <user>, read-only" banner; all write buttons are disabled.
- Links to OpenObserve for infrastructure detail.

**Built in P2-F6** (`features/admin`, routes `/admin`, `/admin/publishing`, `/admin/queues`, `/admin/accounts`):
- **Frame:** its own (not a workspace's): a pane with "Admin console · Every workspace", the four pages and "Back to Socioboard", and an amber-to-orange band across the top of every page, so staff always know they're looking across customers. Phones: the pages scroll in a row, with a back arrow. Reached from the user menu ("Admin console"), shown to platform admins only.
- **Who gets in:** the route answers "page not found" to anyone who isn't a platform admin (as if it weren't there). A platform admin without 2FA is asked to turn it on (link to Security), and the console asks the API nothing; one whose session didn't use the 2FA code (`ADMIN_2FA_REQUIRED`) is asked to sign in again with it, and comes back to the console.
- **Overview:** six tiles for the last 24 hours (sign-ups, workspaces that posted in 30 days, deliveries published, failed, stuck over 15 minutes, accounts needing attention); failed, stuck and accounts are coloured when not zero and link to the filtered page. The queues' backlog (waiting, delayed, active, failed; failed in red) with a link to Bull Board. Refreshed every minute (the server caches for 60 s), with "Updated 15:10" and a refresh button.
- **Publishing:** health by network for 24 hours, 7 days or 30 days (kept in the address): success rate (green from 98 %, amber from 90 %, red below; "–" when nothing finished) with a bar, published / failed / retried, and the most common errors with their count, network code and kind. Below, failed and stuck deliveries (account, workspace, state, last error and its kind, attempts and the last one's time), filtered by state, network and error kind (in the address), 25 at a time. **Retry** and **Cancel delivery** ask "Are you sure?" with a **reason** (3–500 characters, counted, kept in the audit log; the button waits for one); a refusal is explained in the dialog; the console re-reads after. Retrying a stuck delivery warns it may already be on the network.
- **Queues:** Bull Board (read-only) in the page, with "Open in a new tab" and a note that retries go through Publishing.
- **Accounts:** accounts needing reconnecting (with the network's reason) or whose sign-in expires within 7, 14 or 30 days, with how many scheduled posts each puts at risk and when it was last checked; filtered by state, window and network.
- Times are on the reader's own clock (the console spans workspaces). It never shows post content.
- Not yet: a link to OpenObserve (no address is configured; production OpenObserve is P5-I2), trend charts and the phase 5 pages.
