# Area: app-shell

**Phase:** 0 · **Folder:** `features/shell` · **Backend:** [auth](../../backend/modules/auth.md), [workspaces](../../backend/modules/workspaces.md), [notifications](../../backend/modules/notifications.md), [admin](../../backend/modules/admin.md) (announcements)

## Pieces
| Piece | What it does |
| --- | --- |
| Layout | Sidebar + top bar + content area; collapses to a bottom tab bar under 768px |
| Sidebar | Compose (primary button), Calendar, Posts, Approvals (badge with pending count), Media, AI Studio, Accounts, Analytics (6.1), Discovery (6.1), Settings |
| Workspace switcher | Lists my workspaces, switches `/w/:slug`, "Create workspace" |
| User menu | Profile, security, notification settings, theme (light/dark/system), language (later), sign out |
| Notification bell | Unread count, opens the feed ([notifications](notifications.md)) |
| Banners | Email not verified, account needs reconnecting, payment failed, admin announcements, maintenance mode, "support is viewing this account" |
| Command palette | ⌘K / Ctrl+K: jump to pages, create post, switch workspace |
| Route guards | Signed-in check, workspace membership, permission-gated pages, platform-admin guard for `/admin` |

## Public pages (no sign-in)
| Route | Page | Phase |
| --- | --- | --- |
| `/pricing` | Plans from `GET /billing/plans` (cloud only) | 5 |
| `/data-deletion-status/:code` | Status of a Meta data-deletion request ([compliance](../../backend/modules/compliance.md)) | 5 |

The marketing site and legal pages (`/privacy`, `/terms`, `/data-deletion`) stay on `socioboard.com` and are not part of this app.

## API calls
`GET /api/v1/me` (cached for the session), `GET /api/v1/workspaces`, `GET /api/v1/notifications?unread=true` (count), announcements via `GET /api/v1/me` payload.

## Behavior
- Items the user can't access are hidden, not disabled.
- Socket connection is opened here once and shared by all areas.
- Theme and sidebar state are stored in `localStorage` (UI preferences only).
