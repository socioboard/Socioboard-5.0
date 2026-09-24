# Module: notifications

**Phase:** 2 (in-app + email for publishing), 4 (approvals, tasks, AI) · **Path:** `packages/core/src/modules/notifications` · **Depends on:** platform (mailer, realtime, events, queue), workspaces

## Purpose
Tells people what happened: in-app notification feed with live updates over WebSocket, plus email for important events. Listens to events from other modules; other modules never send emails themselves.

## Data
| Table | Key fields | Notes |
| --- | --- | --- |
| `Notification` | id, userId, workspaceId?, type, title, body, link, payload JSON, readAt?, createdAt | Kept 90 days |
| `NotificationPreference` | userId, type, inApp (bool), email (bool) | Defaults per type |

## API
| Method | Path | Permission | Description |
| --- | --- | --- | --- |
| GET | `/api/v1/notifications?unread=` | signed in | My notifications |
| POST | `/api/v1/notifications/:id/read` | signed in | Mark one read |
| POST | `/api/v1/notifications/read-all` | signed in | Mark all read |
| GET/PUT | `/api/v1/me/notification-preferences` | signed in | Read/update preferences |

**WebSocket (Socket.IO):** the client joins `user:<id>` and `workspace:<id>` rooms after auth. Server emits `notification.new`, `post.status_changed`, `ai.job.updated`, `account.status_changed`.

## Event → notification map
| Event | Who gets it | Email by default |
| --- | --- | --- |
| `target.failed` (final) | post author + workspace admins | yes |
| `target.published` | post author | no |
| `account.reauth_required` | workspace admins | yes |
| `post.submitted` | members with `posts:approve` | yes |
| `post.approved` / `post.changes_requested` | author | yes |
| `post.commented` | author + participants | no |
| `task.assigned` | assignee | yes |
| `ai.job.completed` / `ai.job.failed` | requester | no |
| `member.invited` | invitee (email only) | yes |

## Jobs
- `notifications`: fan-out and email sending off the request path (retries on SMTP errors).

## Rules
- Emails use React Email templates in `packages/emails`, sent via Nodemailer (any SMTP).
- Group bursts: several failures from one post become one email.
- Never include tokens or private data in email bodies; link to the app instead.
