# Area: notifications

**Phase:** 2 · **Folder:** `features/notifications` · **Backend:** [notifications](../../backend/modules/notifications.md)

## Screens
| Route | Screen |
| --- | --- |
| (popover) | Bell dropdown: latest 20, unread first, "Mark all read", link to full list |
| `/me/notifications` | Full list with filters (unread, type) and **preferences**: per type, in-app on/off, email on/off |

## API calls
`GET /notifications` (with `unreadCount` for the bell), `POST /notifications/:id/read`, `POST /notifications/read-all`, `GET/PUT /me/notification-preferences`. Socket `notification.new` prepends to the list and sets the count; `notification.read` keeps other tabs in step. Wording comes from `type` + `params` through i18n (`title`/`body` are the fallback); a switch whose channel is `null` isn't shown.

## Behavior
- Each notification links to the relevant screen (failed post → post detail; approval request → approvals).
- Toast for high-importance events (publish failed, account needs reconnecting) while the app is open.
- Browser tab title shows the unread count.

**Built in P2-F4** (`features/notifications`):
- **Bell:** beside search in the sidebar (below it when the sidebar is collapsed), with the unread count on it (up to 9, then "9+"; it pops in, and the bell rings once when the count changes). Its panel: the latest 20, unread first, each with a mark by kind (failed red, published green, needs reconnecting amber), the wording, the workspace and how long ago ("5 min ago"); an unread one is bold with a dot. Opening one marks it read and goes to its page. **Mark all read**, and **See all notifications**. Nothing there: "You're all caught up". On phones, the Menu tab carries the count, and the Menu sheet has **Notifications** with it.
- **`/me/notifications`** (a tab of the account pages): all of them, newest first, 25 at a time with **Load more**; **All / Unread (n)** and a kind filter, kept in the address (`?unread=true&type=`); **Mark all read**. **What you hear about**: a row per kind with its description, and a switch for in the app and for email; a switch applies at once and goes back if the server refuses; a channel a kind doesn't offer shows "–" (the weekly summary is email only).
- **Wording:** from `type` and `params` ("A post couldn't go out to Instagram", "Halden Coffee needs reconnecting", "Your post is live on Facebook"); the body is the network's own reason where there is one; the server's `title`/`body` stand in for anything the app can't word.
- **Live:** since P2-F5 a new notification arrives over the socket and goes on top of the bell at once (`notification.new`), and reading in another tab or device updates this one (`notification.read`); the bell asks every 30 s only while the socket is down. A **toast** pops up for a post that couldn't go out or an account that needs reconnecting when one arrives while the app is open (once each, never for what was there when the app opened), with **Open**. Marking read updates every cached copy (bell, page, filters) with the server's count.
- **Tab title:** "(3) Socioboard" while there are unread ones.
