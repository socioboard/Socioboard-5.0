# Module: scheduling

**Phase:** 2 · **Path:** `packages/core/src/modules/scheduling` · **Depends on:** posts, publishing, social-accounts, workspaces

## Purpose
When posts go out: one-time schedules, recurring schedules, per-account posting time slots ("add to queue"), the calendar view, and the reconciler that keeps BullMQ in sync with Postgres.

## Data
| Table | Key fields | Notes |
| --- | --- | --- |
| `PostTarget.scheduledAt`, `scheduleVersion` | (owned by posts) | Version bumps on every reschedule |
| `RecurringRule` | id, workspaceId, postId (one rule per post), rule JSON (the structured rule as the API took it; expansion reads this), rrule (RFC 5545, for interoperability), timezone, startsAt, endsAt?, nextRunAt?, active, createdById? | RFC 5545 RRULE, built from the structured rule; replaces 5.0's day-of-week schedules. `postId` is the **template** post; deleting the template deletes its rule. Stopping a rule sets `active = false` |
| `Post.recurringRuleId`, `occurrenceAt`, `customizedAt` | (owned by posts) | Set on each occurrence post: which rule made it, and for which occurrence (unique together, so an occurrence is created once); `customizedAt` once it was edited, scheduled, moved or unscheduled by hand |

**Recurring posts are a template plus one ordinary post per occurrence** (decided 2026-09-30). The post the rule is set on becomes the template: it holds the content, accounts and rule, and is never published itself. The `recurring` job creates a normal post for each occurrence in the horizon, copying the template's content, overrides and labels, scheduled at the occurrence's time. An occurrence then behaves like any other post: its own targets, status, history and retry; it can be edited, moved or deleted alone, and it appears in the posts list and on the calendar (`recurring: true`). Why not many targets on one post: a target is one account's delivery of one post (unique per post and account), and everything that reads posts (status, editing, retry, history, tenant checks) would have to learn about occurrences.
| `QueueSlot` | id, workspaceId, socialAccountId, weekday (0–6, 0 = Sunday), time (HH:mm), timezone | Preferred posting times per account; unique per account, weekday and time; go with the account. `pnpm db:seed` gives the sample accounts weekdays at 09:00 and 15:00 |

## API
| Method | Path | Permission | Description |
| --- | --- | --- | --- |
| POST | `/api/v1/workspaces/:wid/posts/:pid/schedule` | `posts:publish` (or approved post) | Schedule every waiting target at `at`, or some at their own times (`targets: [{ targetId, at }]`) |
| POST | `/api/v1/workspaces/:wid/posts/:pid/queue` | `posts:publish` | Put into each account's next free queue slot |
| POST | `/api/v1/workspaces/:wid/posts/:pid/unschedule` | `posts:publish` | Back to approved/draft; removes jobs |
| PATCH | `/api/v1/workspaces/:wid/targets/:tid/schedule` | `posts:publish` | Move one target (calendar drag-and-drop); body `{ at, previousAt }` |
| PUT | `/api/v1/workspaces/:wid/posts/:pid/recurrence` | `posts:publish` | Set/replace a recurring rule; returns the rule with `nextRunAt` |
| DELETE | `/api/v1/workspaces/:wid/posts/:pid/recurrence` | `posts:publish` | Stop recurring |
| GET | `/api/v1/workspaces/:wid/calendar?from=&to=&accountId=&status=&labelId=` | `calendar:read` | Targets in a date range (at most 62 days), for month/week views |
| GET | `/api/v1/workspaces/:wid/accounts/:aid/queue-slots` | `calendar:read` | An account's slots and its next 14 slot times, with the posts already in each (the queue view) |
| PUT | `/api/v1/workspaces/:wid/accounts/:aid/queue-slots` | `accounts:manage` | Replace an account's slots (one timezone for all of them) |

Shapes are in `packages/contracts/src/scheduling.ts` and `recurrence.ts`:
- **Schedule and reschedule** return the post. A reschedule sends `previousAt`, the time the client showed; if the target moved since, the API answers `SCHEDULE_CHANGED` rather than overwrite that move. `scheduleVersion` stays internal (it names the delayed job).
- **Recurrence** is structured, not RRULE text: `frequency` (daily, weekly with `weekdays` 0 = Sunday, monthly with `monthDay`, -1 = last day), `interval` 1–12, `time` (HH:mm), `timezone`, `startsOn`, and `ends` (never, on a date, or after 1–365 times). The server turns it into an RRULE, so arbitrary rules (e.g. every second) never reach the expander. `GET /posts/:pid` includes the post's `recurrence`.
- **Calendar** entries are one per target: account, status, `at` (published time, else due time, else the last attempt of a failed publish-now), the first 280 characters of the text the account gets, a thumbnail, labels, whether a rule made it, the permalink and the last error. At most 1000 per response; `truncated` says there were more. The UI groups a post's targets at the same time into one card. The range is `[from, to)` by `at`, oldest first; without `status` it shows `scheduled`, `publishing`, `published` and `failed` (`cancelled` and `pending` only when asked for by name); `accountId` and `status` repeat, `labelId` is one label (P2-B9, `calendar.ts` `createCalendarService`). The database narrows by each link of `at` (published in range; else due in range; else any try in range) and the exact `at` is checked after, so a failed publish-now shows on its last try's day only. When truncated, the earliest by due time are kept.

## Errors (API)
| Code | Status | When |
| --- | --- | --- |
| `NO_ACCOUNTS` | 422 | Scheduling a post with no accounts |
| `POST_NOT_FOUND`, `TARGET_NOT_FOUND`, `ACCOUNT_NOT_FOUND` | 404 | Not in this workspace (or a `targets[].targetId` that isn't on the post) |
| `SCHEDULE_TOO_SOON` / `SCHEDULE_TOO_FAR` | 422 | A time before now + 2 minutes / more than a year ahead |
| `POST_HAS_ERRORS` | 422 | Validation finds errors; `details` is the validation report |
| `REVIEW_REQUIRED` | 422 | The post needs approval first (approvals arrive in phase 4) |
| `POST_ALREADY_SENT` | 409 | Scheduling or queueing a post with no target waiting |
| `POST_NOT_SCHEDULED` | 409 | Unscheduling a post with no scheduled target |
| `TARGET_NOT_SCHEDULED` | 409 | Moving a target that is publishing, published, failed or cancelled |
| `SCHEDULE_CHANGED` | 409 | `previousAt` isn't the target's time any more; `details.at` is the current one |
| `ACCOUNT_NOT_AVAILABLE` | 422 | Giving queue slots to a disconnected account |
| `NO_QUEUE_SLOTS` | 422 | Add to queue when some accounts have no free slot in the next year; `details.accountIds` names them |
| `RECURRENCE_NOT_FOUND` | 404 | Stopping a post that doesn't repeat |
| `POST_IS_RECURRING` | 409 | Publishing, scheduling or queueing a repeating post's template (its copies go out) |
| `POST_IS_OCCURRENCE` | 409 | Making a copy of a repeating post repeat on its own |
| `POST_IS_SCHEDULED` | 409 | Making a scheduled post repeat (unschedule it first) |
| `RECURRENCE_ENDED` | 422 | A rule with no dates left |

## Services
- `schedule(postId, at | perTarget)`: every live target must be waiting (`pending` or `scheduled`, so scheduling again moves the whole post); checks each time (now + 2 minutes to a year), the review setting and validation (as publish-now does); then, under the post lock, sets `scheduledAt`, bumps `scheduleVersion` and queues a delayed `publish` job per target (`publish-<targetId>-v<version>`, carrying the version). If queueing fails, the targets go back to their previous time and version, whose jobs are still there. Older versions' jobs are then dropped (best effort: a stale job does nothing anyway).
- `unschedule(postId)`: scheduled targets go back to `pending` (no time), version bumped, jobs dropped; the post becomes a draft.
- `reschedule(targetId, at, previousAt)`: under the post lock, the target must still be `scheduled` (`TARGET_NOT_SCHEDULED`) and at `previousAt` (`SCHEDULE_CHANGED`, with the current time in `details.at`); then a new version and job, and the old job dropped.
- Exactly once: the publish job claims a target only at its own version (see [publishing](publishing.md)), and publish-now bumps the version too, so a post that moved, was unscheduled or was sent now never goes out a second time. A worker dying mid-send never makes a second copy either (publishing, step 3). The restart suite (`pnpm test:chaos`, P2-Q1) schedules 24 posts and kills the api while scheduling and around their times, Valkey while they go out (every job lost; `reconcile` rebuilds them from Postgres) and the worker mid-send twice. Every post reaches the network at most once, all but the two cut off mid-send go out within seconds of their time (4 s at most on 2026-10-05), and those two fail as "lost track" instead of going out twice (before the rule, both went out twice).
- `queue(postId)` ("Add to queue"): the same checks as `schedule`, then, under the post lock and a per-account advisory lock (taken in account id order, so two posts queued at once never take the same slot), each waiting target gets its account's next free slot from now + 2 minutes, within a year. A slot is free when no other post's target on that account is scheduled, publishing or published at that instant. Any account without a free slot refuses the whole request (`NO_QUEUE_SLOTS`, naming the accounts).
- Queue slots: `GET` gives the slots by weekday and time, their timezone (the workspace's while there are none) and the next 14 slot times (from now + 2 minutes, like "Add to queue") with the posts already in each (calendar entries); `PUT` replaces them all in one timezone (disconnected accounts refused: `ACCOUNT_NOT_AVAILABLE`) and emits `queue_slots.updated` (audited).
- The wall-clock maths (`wallClock`, `zonedTime`, `addDays`, `weekdayOf`) lives in `packages/contracts/src/time.ts` since P2-F1, so the browser's schedule picker and the server work out the same instant; `scheduling/time.ts` re-exports it and adds `slotTimes`. Wall-clock times become instants there (`zonedTime`, `slotTimes`) with the runtime's timezone database, applying the daylight-saving rule below; recurring rules (P2-B4) use the same code.
- `setRecurrence(postId, rule)`: the post must be a draft (every live target `pending`; `POST_IS_SCHEDULED` / `POST_ALREADY_SENT` otherwise), not itself an occurrence (`POST_IS_OCCURRENCE`), and pass the same checks as scheduling (accounts, review, validation); the rule must still have a date ahead (`RECURRENCE_ENDED`). It is stored (structured, plus its RRULE), then synced. The answer gives `nextRunAt`, the next occurrence from now.
- `sync(ruleId)` (on set, on template edits, and from the `recurring` job), under the rule's row lock: optionally replaces the waiting copies, then creates a post for every occurrence from now + 2 minutes to 7 days ahead that has none yet (the unique `recurringRuleId` + `occurrenceAt` makes a repeat run harmless): the template's text, media, link, first comment, labels and targets (disconnected accounts left out, overrides kept), each target `scheduled` at the occurrence with its own delayed job. `nextRunAt` in the row is the first occurrence past the window.
- The template never goes out itself: publish-now, schedule and queue refuse it (`POST_IS_RECURRING`) while its rule is active. Its edits (any field) replace the waiting copies through the `post.updated` event; deleting it removes them (`post.deleted` carries the rule's id).
- Occurrences are computed from the structured rule in `scheduling/occurrences.ts` (daily / weekly on weekdays, weeks starting Monday / monthly on a day, a month without it skipped, -1 the last day; ends on a date or after a count from the start) with the same daylight-saving rule as queue slots. Every loop is bounded (a rule that never falls on a day ends instead of spinning), and far dates are reached by jumping, not walking from the start.
- Changing the rule or the template's content replaces the occurrence posts that are still waiting (not yet publishing, and not edited on their own); sent and hand-edited ones stay. Stopping the rule (`DELETE …/recurrence`) removes the waiting occurrences; sent ones stay as history.

## Jobs
| Queue | Runs | Does |
| --- | --- | --- |
| `recurring` | hourly (`:05`, `upsertJobScheduler`) | Sync every active rule whose `nextRunAt` is within 7 days |
| `reconcile` | every 5 min (`*/5`, `upsertJobScheduler`) | Postgres is the source of truth. Every target `scheduled` within the next 48 h (or overdue) must have a live job for its version: a missing one, or one that finished without sending, is queued again (delay to `scheduledAt`, or now when up to an hour late); a target over an hour late is failed instead (`retryable`, "missed its time"), so nothing goes out hours late. A job held back by a rate limit is delayed, so it counts as live. A target `publishing` for over 15 minutes with no live job (its scheduled job, or its publish-now/retry job, looked up under every id it may have been queued with, since one job makes up to 5 tries) is failed with "we lost track of this delivery", its running attempt closed: the network may or may not have the post, so it is never retried blindly. Checking the network for the post first needs an adapter lookup (later). Emits `target.failed` for both |

## Rules
- **Account access (P4-B4):** scheduling, queueing, unscheduling, moving and repeating a post check it as posts does (404 `POST_NOT_FOUND` for a post the member may not see); the calendar and the queue view leave out posts going to any account outside a member's limit, and another account's queue slots are 404 `ACCOUNT_NOT_FOUND`.
- Postgres is the source of truth; Valkey jobs can always be rebuilt.
- Minimum schedule time: now + 2 minutes. Maximum: 1 year ahead (`SCHEDULE_MIN_LEAD_MINUTES`, `SCHEDULE_MAX_AHEAD_DAYS` in contracts, so the date picker uses the same bounds).
- A deleted workspace publishes nothing more: on `workspace.deleted` its scheduled targets are cancelled (jobs dropped) and its repeating rules stopped; the publish job also refuses a deleted workspace, and the `reconcile` and `recurring` jobs skip it. Restoring a workspace (phase 5) doesn't reschedule them.
- Times are stored in UTC. Recurring rules keep their own timezone so they don't drift with daylight saving.
- Wall-clock times that don't exist or happen twice (a recurring rule's or a queue slot's time on a daylight-saving change day): a time skipped by the clock change moves forward by the gap (02:30 on a spring-forward night that jumps 02:00 → 03:00 becomes 03:30); a time that happens twice uses the first. The daylight-saving tests (`pnpm test:dst`, `tests/scheduling`, P2-Q2) check this against a walk of the real clock, not hand-written answers: every clock change in every timezone the runtime knows over two years, every quarter hour of the days it touches (`zonedTime`, daily rules, weekly posting times: one a day, in order, never two, never a day missed); and the real pipeline (rules set through the API, the expansion run on fake dates before, during and after the next change in New York, London, Sydney, Lord Howe Island and Kolkata: daily, weekly and monthly rules at skipped, repeated and ordinary times): every copy made once, at the right instant, its delivery and job due then, and the rule's next run right. The changes are found from the timezone database, so the tests hold in any year.
- Scheduled count respects `checkLimit('scheduledPosts')` when billing is on.
- Emits `post.scheduled` (targets and times), `post.rescheduled` (from, to), `post.unscheduled`, `post.recurrence_set` (RRULE, timezone), `post.recurrence_stopped` (copies removed), `queue_slots.updated`; all are audited.
