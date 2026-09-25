# Module: audit

**Phase:** 0 (write path), 5 (admin viewing) · **Path:** `packages/core/src/modules/audit` · **Depends on:** platform (db, events)

## Purpose
An append-only record of sensitive actions: who did what, to what, and when. Used for approvals history, customer trust, and every platform-admin action.

## Data
| Table | Key fields | Notes |
| --- | --- | --- |
| `AuditLog` | id, workspaceId?, actorUserId, actorType (user/admin/system), action, entityType, entityId, diff JSON, ip, userAgent, createdAt | Append-only; no update or delete API |

## API
| Method | Path | Permission | Description |
| --- | --- | --- | --- |
| GET | `/api/v1/workspaces/:wid/audit` | `workspace:update` | Workspace activity log (filter: actor, action, date) |
| GET | `/api/admin/audit` | platform admin | Platform-wide log |

## Services
- `record({ workspaceId, actor, action, entity, diff })`: appends an entry (there is no update or delete). IP and user agent come from the current request (`requestContext`, kept apart from log context so IPs aren't on every log line).
- `registerAuditListeners(events, audit)`: records domain events from one typed table (`AUDITED` in `listeners.ts`), so a changed event payload breaks the build instead of recording the wrong thing. Phase 0: `user.signed_up`, `user.signed_in`, `user.password_changed`, `workspace.created/updated/deleted/ownership_transferred`, `member.invited/joined/role_changed/removed`, `invitation.revoked/declined`, `media.deleted`. Later phases add `account.*`, `post.approved`, `billing.*`, `admin.*`. Operational events (`media.ready`) are not audited.
- A failed audit write is logged as an error and never fails the user's action.

## Jobs
- `audit-purge`: nightly at 03:30 UTC in the worker, deletes entries older than `AUDIT_RETENTION_DAYS` (default 730).

## Rules
- Action names are `entity.verb`: `member.role_changed`, `account.disconnected`, `post.approved`, `admin.impersonation_started`.
- Never store secrets or tokens in `diff`: `record()` strips them with the same key list as the logger (tokens, passwords, secrets, API keys, auth headers), at any depth.
- Retention: 2 years on the hosted cloud; configurable when self-hosted.
