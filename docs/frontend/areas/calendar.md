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
- Click (or keyboard activation) opens a quick preview with Edit, Reschedule, Duplicate, Delete. Full post content and network overrides are shown per account; published accounts link to their live post.
- Click an empty time → composer pre-filled with that time.

## API calls
`GET /calendar?from=&to=&accountId=&status=&labelId=` (refetch on range change; at most 62 days), `PATCH /targets/:tid/schedule` with `{ at, previousAt }` (drag-and-drop), `GET/PUT /accounts/:aid/queue-slots` (GET also gives the next slot times and the posts in each, for the queue view).

## Behavior
- **Drag-and-drop** reschedules a single target; optimistic move with rollback if the API rejects it (e.g. time in the past, post needs re-approval, or `SCHEDULE_CHANGED`: someone else moved it first, so the card jumps to where they put it and says so).
- Published posts can't be dragged.
- All times in the workspace timezone; a small label shows the timezone.
- Mobile: agenda (list) view instead of month grid.

## P2-F2 implementation
- Month/week, day, account, status, label and account separation persist in the route's search parameters. Invalid dates and IDs are discarded.
- Deliveries for the same post at the same instant share a card, including mixed statuses. **Show each account** separates them for dragging; grouped cards with multiple accounts cannot be dragged. Preview rescheduling also offers one account at a time, including on phones and keyboards.
- Rescheduling sends the original `previousAt`, allows one pending write per target, enforces the API's two-minute/year bounds, and refreshes calendar, post and queue caches. A conflicting server time replaces stale time; failed moves restore the previous position.
- Date buttons and empty month cells propose 09:00 on that workspace day (today: at least an hour ahead, rounded to 15 minutes); an empty week slot proposes its exact time. The composer shows the proposed time and prefills Schedule, while an existing saved schedule takes priority. The user still confirms scheduling.
- Edit/Delete require ownership or approval permission and no published/publishing target. Duplicate requires write permission; rescheduling requires publishing permission. A viewer can read previews only.
- Calendar reads refresh on period/filter changes, on local post mutations and every 30 seconds until socket invalidation in P2-F5. Loading, stale data, failed filter reads, empty periods and the 1000-delivery truncation have explicit states.
- Week view opens at 08:00 with half-hour rows; its cards are at most about an hour tall and show one line of text (the left border and the label carry the status), so a card never reads as a duration. An empty period says so in one line above the grid; the phone agenda says it in the list.
- Shared `CalendarEventCard` lives in `packages/ui` with catalogue stories. Model and move tests cover grouping, timezone/DST, bounds, concurrency and rollback; `e2e/phase-2/calendar.spec.ts` exercises the real browser calendar with deterministic API fixtures. Real-network schedule-to-publish acceptance remains P2-Q3; queue UI remains P2-F3.
