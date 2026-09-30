# Module: scheduling

**Phase:** 2 · **Path:** `packages/core/src/modules/scheduling` · **Depends on:** posts, publishing, social-accounts, workspaces

## Purpose
When posts go out: one-time schedules, recurring schedules, per-account posting time slots ("add to queue"), the calendar view, and the reconciler that keeps BullMQ in sync with Postgres.

## Data
| Table | Key fields | Notes |
| --- | --- | --- |
| `PostTarget.scheduledAt`, `scheduleVersion` | (owned by posts) | Version bumps on every reschedule |
| `RecurringRule` | id, postId, rrule, timezone, startsAt, endsAt?, nextRunAt, active | RFC 5545 RRULE, built from the structured rule the API takes; replaces 5.0's day-of-week schedules. `postId` is the **template** post |
| `Post.recurringRuleId`, `occurrenceAt` | (owned by posts) | Set on each occurrence post: which rule made it, and for which occurrence (unique together, so an occurrence is created once) |

**Recurring posts are a template plus one ordinary post per occurrence** (decided 2026-09-30). The post the rule is set on becomes the template: it holds the content, accounts and rule, and is never published itself. The `recurring` job creates a normal post for each occurrence in the horizon, copying the template's content, overrides and labels, scheduled at the occurrence's time. An occurrence then behaves like any other post: its own targets, status, history and retry; it can be edited, moved or deleted alone, and it appears in the posts list and on the calendar (`recurring: true`). Why not many targets on one post: a target is one account's delivery of one post (unique per post and account), and everything that reads posts (status, editing, retry, history, tenant checks) would have to learn about occurrences.
| `QueueSlot` | id, socialAccountId, weekday (0–6), time (HH:mm), timezone | Preferred posting times per account |

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
- **Calendar** entries are one per target: account, status, `at` (published time, else due time, else the last attempt of a failed publish-now), the first 280 characters of the text the account gets, a thumbnail, labels, whether a rule made it, the permalink and the last error. At most 1000 per response; `truncated` says there were more. The UI groups a post's targets at the same time into one card.

## Errors (API)
| Code | Status | When |
| --- | --- | --- |
| `POST_NOT_FOUND`, `TARGET_NOT_FOUND`, `ACCOUNT_NOT_FOUND` | 404 | Not in this workspace (or a `targets[].targetId` that isn't on the post) |
| `SCHEDULE_TOO_SOON` / `SCHEDULE_TOO_FAR` | 422 | A time before now + 2 minutes / more than a year ahead |
| `POST_HAS_ERRORS` | 422 | Validation finds errors; `details` is the validation report |
| `REVIEW_REQUIRED` | 422 | The post needs approval first (approvals arrive in phase 4) |
| `POST_ALREADY_SENT` | 409 | Scheduling or queueing a post with no target waiting |
| `POST_NOT_SCHEDULED` | 409 | Unscheduling a post with no scheduled target |
| `TARGET_NOT_SCHEDULED` | 409 | Moving a target that is publishing, published, failed or cancelled |
| `SCHEDULE_CHANGED` | 409 | `previousAt` isn't the target's time any more; `details.at` is the current one |
| `NO_QUEUE_SLOTS` | 422 | Add to queue when some accounts have no free slot in the next year; `details.accountIds` names them |
| `RECURRENCE_NOT_FOUND` | 404 | Stopping a post that doesn't repeat |

## Services
- `schedule(postId, at | perTarget)`: validates (future time, approved, accounts active), sets `scheduledAt`, bumps `scheduleVersion`, adds delayed `publish` jobs.
- `reschedule(targetId, at)`: bump version, remove the old job, add a new one.
- `nextFreeSlot(accountId, after)`: finds the next unused QueueSlot.
- `expandRecurring(ruleId, horizon)`: creates an occurrence post for each occurrence in the horizon that doesn't have one yet (the unique `recurringRuleId` + `occurrenceAt` makes a repeat run harmless).
- Changing the rule or the template's content replaces the occurrence posts that are still waiting (not yet publishing, and not edited on their own); sent and hand-edited ones stay. Stopping the rule (`DELETE …/recurrence`) removes the waiting occurrences; sent ones stay as history.

## Jobs
| Queue | Runs | Does |
| --- | --- | --- |
| `recurring` | hourly | Expand active rules 7 days ahead |
| `reconcile` | every 5 min | For every target `scheduled` in the next 48 h, ensure its delayed job exists (recreate from Postgres if Valkey lost it); fail or verify targets stuck in `publishing` |

## Rules
- Postgres is the source of truth; Valkey jobs can always be rebuilt.
- Minimum schedule time: now + 2 minutes. Maximum: 1 year ahead (`SCHEDULE_MIN_LEAD_MINUTES`, `SCHEDULE_MAX_AHEAD_DAYS` in contracts, so the date picker uses the same bounds).
- Times are stored in UTC. Recurring rules keep their own timezone so they don't drift with daylight saving.
- Scheduled count respects `checkLimit('scheduledPosts')` when billing is on.
- Emits `post.scheduled`, `post.rescheduled`, `post.unscheduled`.
