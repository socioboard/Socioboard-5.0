# Module: notifications

**Phase:** 2 (in-app + email for publishing), 4 (approvals, tasks, AI) · **Path:** `packages/core/src/modules/notifications` · **Depends on:** platform (mailer, realtime, events, queue), workspaces

## Purpose
Tells people what happened: in-app notification feed with live updates over WebSocket, plus email for important events. Listens to events from other modules; other modules never send emails themselves.

## Data
| Table | Key fields | Notes |
| --- | --- | --- |
| `Notification` | id, userId, workspaceId?, type, title, body, link?, params JSON, readAt?, createdAt | Kept 90 days. `type` is a string (new types need no migration). Read through the user; listed as workspace-scoped only so writes for a workspace are stamped. Deleting a workspace deletes its notifications |
| `NotificationPreference` | userId, type, inApp (bool), email (bool) | Unique per user and type; types with no row use their defaults |

## API
| Method | Path | Permission | Description |
| --- | --- | --- | --- |
| GET | `/api/v1/notifications?unread=&type=` | signed in | My notifications, newest first, with `unreadCount` (across all pages) |
| POST | `/api/v1/notifications/read-all` | signed in | Mark all read; returns `{ unreadCount }` |
| POST | `/api/v1/notifications/:id/read` | signed in | Mark one read (again is fine); returns `{ unreadCount }` |
| GET | `/api/v1/me/notification-preferences` | signed in | Every type with its in-app and email setting (defaults filled in) |
| PUT | `/api/v1/me/notification-preferences` | signed in | Set the listed types' channels; others keep theirs |

Shapes are in `packages/contracts/src/notifications.ts`. Notifications are a user's own, across workspaces: each names its workspace (`id`, `slug`, `name`) or none. The UI words a notification from `type` and `params` (i18n); `title` and `body` are the English fallback, also used in emails. `link` is a path inside the app, never a full URL (`//host` is refused too), so a notification can't send anyone off-site. A channel a type doesn't offer is `null` in preferences (the digest is email only) and can't be turned on (`NOTIFICATION_CHANNEL_NOT_OFFERED`, 422). Another user's notification id answers `NOTIFICATION_NOT_FOUND` (404).

**Types (phase 2):** `publish_failed`, `post_published`, `account_reauth_required`, and `digest` (email only). Phase 4 adds review, comment, task and AI types.

**WebSocket (Socket.IO)** at `/api/socket.io` (`REALTIME_PATH`), events in `packages/contracts/src/events.ts`. On connect the server checks the session cookie and joins `user:<id>` and `workspace:<id>` for each of the user's workspaces; it leaves a workspace's room when the user is removed from it. The browser only listens. Payloads say what changed, not the whole object, and the web app refetches through the API, where permissions apply:
- `notification.new` (to the user): the notification and the new unread count.
- `notification.read` (to the user): marked read in another tab or device; `ids`, or null for all, and the unread count.
- `post.status_changed` (to the workspace): post id and status, and each target's id, status, `scheduledAt`, `publishedAt`.
- `account.status_changed` (to the workspace): account id and status.
- `ai.job.updated` joins in phase 4.

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
- `notifications`: email sending off the request path (5 tries, backing off from 30 s, on SMTP errors).
- `notification-purge` (nightly, 03:45 UTC): deletes notifications older than 90 days.

## How it works (P2-B8)
- `registerNotificationListeners` runs in the API and the worker (events are emitted in both). For each event it finds the live workspace and its people (a deleted workspace notifies nobody; an author who left isn't notified), then `notify()` gives each user one notification through the channels they chose. Defaults (`DEFAULT_CHANNELS`): publish failed in the app and by email, published in the app only, needs reconnecting in the app and by email, digest email only and off.
- In the app: the row is saved and `notification.new` goes to `user:<id>` with the new unread count. Reading one (when it wasn't read yet) or all sends `notification.read` to the same room, so other tabs update. Live events go through `platform/realtime`'s emitter; the API's Socket.IO server that delivers them to browsers is P2-B11, which also starts emitting `post.status_changed` and `account.status_changed`.
- By email: each item joins a Valkey list for its user, group and 2-minute window (`notify-email:<user>:<group>:<window>`), and that window's job (`email-<user>-<group>-<window>`, added once) runs just after the window closes. It sends one email for everything in the list, leaving out types the user turned email off for since, then deletes the list; a failed send leaves the list for the retry. Groups: one post's deliveries (`post:<id>`), one workspace's accounts needing reconnecting (`accounts:<workspaceId>`, so a login's Pages arrive as one email). Until P2-B12 every type uses one plain template (`notificationEmail` in `packages/emails`): the first item's title as the subject ("… (and 2 more)"), each item's title and text, and a button to the first item's page.
- English text (`title`, `body`) is the fallback; `params` carries what the UI needs to word it (post, target, account ids, network, error kind). Links are app paths: `/w/<slug>/posts/<postId>`, `/w/<slug>/accounts?account=<id>`.

## Rules
- Emails use React Email templates in `packages/emails`, sent via Nodemailer (any SMTP).
- Group bursts: several failures from one post become one email.
- Never include tokens or private data in email bodies; link to the app instead.
- A user sees notifications of the workspaces they still belong to (and ones about themselves alone): once removed from a workspace, its notifications leave their feed and unread count, so nothing about its posts or accounts stays visible.
