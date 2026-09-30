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
