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
- `record({ actor, action, entity, diff })`: called directly for synchronous actions.
- Listens to domain events (`member.*`, `account.*`, `post.approved`, `billing.*`, `admin.*`) and records them.

## Rules
- Action names are `entity.verb`: `member.role_changed`, `account.disconnected`, `post.approved`, `admin.impersonation_started`.
- Never store secrets or tokens in `diff`; a redaction list strips known sensitive fields.
- Retention: 2 years on the hosted cloud; configurable when self-hosted.
