# QA: calendar and queue

Area doc: [calendar](../frontend/areas/calendar.md) · Checks for every screen: [README](README.md#every-screen)

## Month and week
- [ ] **CAL-01** Calendar opens on the month; the whole month fits the screen without page scrolling (laptop); today is tinted; past days are hatched and quieter.
- [ ] **CAL-02** Week view opens at 08:00; the hours scroll inside the grid; a red "now" line with the time.
- [ ] **CAL-03** A post shows as a card at its time: time, first line of text, account pictures, coloured by status.
- [ ] **CAL-04** A day with more posts than fit → "+2 more" → that day's list.
- [ ] **CAL-05** Previous / next / Today; switching month ↔ week quickly several times → no error, no blank grid.
- [ ] **CAL-06** Keys: ← → change period, **T** today, **M** month, **W** week, **N** new post; not while typing or in a dialog. Tooltips show them.
- [ ] **CAL-07** Filters: account, status, label; "Show each account" splits a post's accounts into separate cards. All are kept in the address.
- [ ] **CAL-08** An empty period says so in one line; times are in the workspace's time zone (shown on the toolbar).

## Creating from the calendar
- [ ] **CAL-10** Week view: move the mouse down a day → a dashed "+ 11:15 AM" follows (every 15 minutes) → click → the composer opens with that time.
- [ ] **CAL-11** Month view: hovering a future day shows "+" by its number → click → the composer, at 09:00 that day.
- [ ] **CAL-12** Not offered in the past or the next 2 minutes, or over a post.

## Looking at a post
- [ ] **CAL-20** Rest the mouse on a card → a quick look beside it: time, picture, text, each account and its status, why a delivery failed, Open / Reschedule.
- [ ] **CAL-21** Click a card → the full preview: each account's version, links to published posts, Edit, Reschedule, Duplicate, Delete (by permission).

## Rescheduling
- [ ] **CAL-30** Drag a scheduled card to another time → a label says "Move to Thu, 8 Oct 2026, 4:00 PM" → drop → it settles there; the toast offers **Undo**, which moves it back.
- [ ] **CAL-31** Dragging into the past → the label says "Can't move into the past" in red; dropping there puts it back.
- [ ] **CAL-32** Published cards can't be dragged.
- [ ] **CAL-33** A card with several accounts can't be dragged; "Show each account" splits it, then each moves on its own.
- [ ] **CAL-34** Someone else moved the same post first (two tabs) → your move is refused, the card jumps to their time and it says so.
- [ ] **CAL-35** Reschedule from the preview (keyboard and phone users) → pick the time → moved.
- [ ] **CAL-36** As viewer: previews only; no dragging, no Edit/Reschedule/Delete.
- [ ] **CAL-37** (real network) A post dragged to a new time goes out at the new time, once; the old time does nothing.

## Free posting times on the week
- [ ] **CAL-40** With posting times set: free ones show as dashed cards ("+ 11:00 AM · <account>") → click → the composer with that time and account.
- [ ] **CAL-41** Not shown with a status or label filter, in the past, or on phones.

## Phone
- [ ] **CAL-50** Phones show an agenda list instead of the grid; swipe sideways to change period; tap a post for its preview.

## Queue
- [ ] **CAL-60** Queue: the accounts in a list (a select on phones), the chosen one's next 14 posting times by day, on the workspace's clock.
- [ ] **CAL-61** A slot with posts shows each (time, picture, text, status) and links to it; a free slot is dashed with **Write a post**.
- [ ] **CAL-62** A summary: how many posting times a week, the time zone, how many of the next 14 are free.
- [ ] **CAL-63** No posting times yet → an empty state; admins get **Set posting times**, others are told who sets them.
- [ ] **CAL-64** An account that can't post says its slots stay empty until it's fixed.

## Not built yet
Approval states on cards (phase 4).
