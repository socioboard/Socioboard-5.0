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
- Calendar reads refresh on period/filter changes, on local post mutations and live: `post.status_changed` refreshes it (every 30 seconds only while the socket is down, since P2-F5). Loading, stale data, failed filter reads, empty periods and the 1000-delivery truncation have explicit states.
- Week view opens at 08:00 with half-hour rows; its cards are at most about an hour tall and show one line of text (the left border and the label carry the status), so a card never reads as a duration. An empty period says so in one line above the grid; the phone agenda says it in the list.
- Shared `CalendarEventCard` lives in `packages/ui` with catalogue stories. Model and move tests cover grouping, timezone/DST, bounds, concurrency and rollback; `e2e/phase-2/calendar.spec.ts` exercises the real browser calendar with deterministic API fixtures. Real-network schedule-to-publish acceptance remains P2-Q3; queue UI remains P2-F3.

## Polish (P2-F2, after review)
- **Hover to create (week):** a dashed "+ 11:15 AM" card follows the mouse down each day's column, snapped to 15 minutes; a click opens the composer at exactly that time. Not in the past or the next 2 minutes, not over a post, not for touch or pens (they tap a slot). Month: hovering a day shows a "+" by its number (future days).
- **Quick look:** resting the mouse on a card (380 ms) shows the post beside it, on whichever side has room: the time, the picture, the text, each account with its status, why a delivery failed, and Open / Reschedule. Moving onto it keeps it open; it closes 160 ms after the pointer leaves. Mouse and trackpad only; clicking still opens the full preview, which keyboard and touch users get.
- **Dragging:** the card lifts (shadow, a slight tilt of its contents); its old place stays as a faint dashed outline; a label by the pointer says "Move to Thu, 8 Oct 2026, 4:00 PM", or "Can't move into the past" in red where a drop is refused. On drop the card settles with a small bounce, and the toast offers **Undo** (a move back, sent with the new time as `previousAt`; undoing isn't itself undoable).
- **Readability:** past days and past week columns are hatched and quieter; today's column is tinted; the "now" line shows the time in the hour column; month cards lead with the post's picture.
- **Moving around:** a new period slides in from its side, a new view settles in place (a crossfade under reduced motion). Keys: ← → periods, **T** today, **M** month, **W** week, **N** new post; not while typing, with a modifier, or in a dialog, menu, list or dropdown. The toolbar's tooltips show them. On phones, swiping the agenda sideways changes period.
- **Drag safety:** FullCalendar lives in `CalendarGrid`, which re-renders only when the posts, view, date, timezone or permissions change, and receives the page's handlers through a stable ref. A re-render as a drag starts cancels it, and the page re-renders often (background refresh, the clock, hovering). The landing bounce is set on the element for the same reason, and the quick look and drag label are rendered on the page body (the content pane's frosted glass makes `fixed` relative to the pane).

## Queue (P2-F3)
- **`/w/:slug/queue`** (`calendar:read`; "Queue" in the sidebar after Calendar): the workspace's connected accounts in a list (a select on phones), kept in the address as `?account=`, and the chosen account's next 14 posting times by day ("Tuesday, 6 October"), on the workspace's clock. A slot with posts shows each (time, picture, text, status) and links to it; a free slot is dashed with **Write a post**, which opens the composer at that time with that account already chosen (`/compose?at=…&account=…`; only an account that can post is pre-chosen). A summary says how many posting times a week, in which time zone, and how many of the next 14 are free. An account that can't post says its slots stay empty until it's fixed.
- **No posting times yet:** an empty state; people who manage accounts get **Set posting times**, others are told who sets them.
- **Free slots on the calendar (week view, desktop):** each shown account's free posting times (from `GET /accounts/:id/queue-slots`, at most 20 accounts) are dashed cards ("+ 11:00 AM · Halden Coffee"), one per instant with every account free then. A click writes a post for that time (and account, when it's one). Not shown with a status or label filter, which they don't belong to, nor in the past or the next 2 minutes.
- The editor is an account's (see [accounts](accounts.md), "Posting times").
