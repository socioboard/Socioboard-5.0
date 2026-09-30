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
- **Built in P0-F5** (`features/shell`): layout, sidebar, switcher, user menu, ⌘K palette, the verify-email banner, route guards. The notification bell arrives with P2-F4, the other banners with their phases, and the platform-admin guard with the admin console (P2-F6).
- **Layout:** floating glass panes 12 px apart: the sidebar (232 px, or 64 px icons-only when collapsed, remembered as `sb-sidebar` in `localStorage`) and the content pane. Pages render into the content pane and start with a `PageHeader`. Under 768 px the sidebar becomes a bottom tab bar: the pages, Search, and Menu (a sheet with the switcher and account).
- **Sidebar items** come from one list (`features/shell/nav.ts`), shared with the tab bar and palette, filtered by permission. A page joins it when its route exists: Calendar (placeholder until P2-F2) now, Settings with P0-F6, Media with P0-F7, Accounts with P1-F1. The primary "New post" button (people who can write posts) arrived with P1-F5, above search in the sidebar (an icon when collapsed), at the top of the mobile menu sheet, and as "New post" under "Create" in the command palette.
- **Workspace in the URL:** `/w/:slug` for a workspace the user isn't in shows "Workspace not found" (after asking the server once more, in case they just joined), with links to theirs; the same answer whether it exists or not. Opening a workspace makes it the active one on the server (`POST /me/active-workspace`), so the next sign-in returns there.
- **Session ending mid-use** (expired, signed out elsewhere, revoked): our API's 401 `UNAUTHENTICATED` from any query or mutation, or `me` coming back empty when it is re-checked (on window focus once older than 30 s), drops every cached answer (and uploads waiting or failed, which live outside the cache) and goes to `/login?redirect=<here>` with a 10-second toast saying why. Other 401s (Better Auth uses 401 for a wrong 2FA or backup code, or a bad token) only trigger that re-check, so a mistyped code never signs anyone out. Signing out on purpose goes to `/login` with no toast.
- **Command palette:** ⌘K / Ctrl+K from anywhere (the same keys close it), or the sidebar's search button: go to a page, switch or create a workspace, theme, collapse the sidebar, sign out. Every word typed must match (label, hint, keywords or group).
- `/` has no page: it redirects to the active workspace, `/onboarding`, `/verify-email` or `/login`.
- Items the user can't access are hidden, not disabled.
- Socket connection is opened here once and shared by all areas.
- Theme and sidebar state are stored in `localStorage` (UI preferences only).
