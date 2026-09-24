# Module: compliance

**Phase:** 5 · **Path:** `packages/core/src/modules/compliance` · **Depends on:** auth, workspaces, social-accounts, media, audit, platform (queue, storage, mailer)

## Purpose
Legal and platform-policy requirements: users can export and delete their data (GDPR), Meta can ask us to delete a user's data, and data is kept only as long as needed.

## Data
| Table | Key fields | Notes |
| --- | --- | --- |
| `DataRequest` | id, type (export/delete), userId?, workspaceId?, source (user/meta/admin), status, confirmationCode, fileKey?, requestedAt, completedAt | |

## API
| Method | Path | Permission | Description |
| --- | --- | --- | --- |
| POST | `/api/v1/me/export` | signed in | Export my personal data (ZIP link by email) |
| POST | `/api/v1/me/delete` | signed in (re-auth) | Delete my account |
| POST | `/api/v1/workspaces/:wid/export` | owner | Export all workspace data |
| POST | `/api/webhooks/meta/data-deletion` | Meta signed request | Meta data-deletion callback; returns `{ url, confirmation_code }` |
| GET | `/data-deletion-status/:code` | public | Status page Meta links to |

## Jobs
- `data-export`: builds a ZIP (JSON + media) in storage; emails a link valid for 7 days.
- `data-delete`: removes a user (or the Meta-identified account's data): revoke and delete tokens, anonymize authored posts, delete personal fields; logs completion.
- `retention` (nightly): purge notifications > 90 days, publish attempts > 1 year, soft-deleted workspaces > 30 days, expired exports.

## Rules
- Deleting a user who is the only owner of a workspace requires transferring or deleting that workspace first.
- Deletion is final after a 7-day cancellation window (except Meta requests, processed immediately).
- Every request is audit-logged.
