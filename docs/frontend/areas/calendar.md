# Area: calendar

**Phase:** 2 · **Folder:** `features/calendar` · **Backend:** [scheduling](../../backend/modules/scheduling.md), [posts](../../backend/modules/posts.md)

The default home screen of a workspace.

## Screens
| Route | Screen | Permission |
| --- | --- | --- |
| `/w/:slug/calendar` | Month and week views of scheduled + published posts; filter by account, status, label | `calendar:read` |
| `/w/:slug/queue` | List view per account: upcoming queue slots and the posts in them; empty slots shown | `calendar:read` |

## Components
- FullCalendar with custom event cards: account avatars, first line of text, media thumbnail, status color.
- Hover/click opens a quick preview with Edit, Reschedule, Duplicate, Delete.
- Click an empty time → composer pre-filled with that time.

## API calls
`GET /calendar?from=&to=&accountId=&status=&labelId=` (refetch on range change; at most 62 days), `PATCH /targets/:tid/schedule` with `{ at, previousAt }` (drag-and-drop), `GET/PUT /accounts/:aid/queue-slots` (GET also gives the next slot times and the posts in each, for the queue view).

## Behavior
- **Drag-and-drop** reschedules a single target; optimistic move with rollback if the API rejects it (e.g. time in the past, post needs re-approval, or `SCHEDULE_CHANGED`: someone else moved it first, so the card jumps to where they put it and says so).
- Published posts can't be dragged.
- All times in the workspace timezone; a small label shows the timezone.
- Mobile: agenda (list) view instead of month grid.
