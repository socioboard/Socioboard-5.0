# Module: scheduling

**Phase:** 2 · **Path:** `packages/core/src/modules/scheduling` · **Depends on:** posts, publishing, social-accounts, workspaces

## Purpose
When posts go out: one-time schedules, recurring schedules, per-account posting time slots ("add to queue"), the calendar view, and the reconciler that keeps BullMQ in sync with Postgres.

## Data
| Table | Key fields | Notes |
| --- | --- | --- |
| `PostTarget.scheduledAt`, `scheduleVersion` | (owned by posts) | Version bumps on every reschedule |
| `RecurringRule` | id, postId, rrule, timezone, startsAt, endsAt?, nextRunAt, active | RFC 5545 RRULE; replaces 5.0's day-of-week schedules |
| `QueueSlot` | id, socialAccountId, weekday (0–6), time (HH:mm), timezone | Preferred posting times per account |

## API
| Method | Path | Permission | Description |
| --- | --- | --- | --- |
| POST | `/api/v1/workspaces/:wid/posts/:pid/schedule` | `posts:publish` (or approved post) | Schedule all targets at a time (or per-target times) |
| POST | `/api/v1/workspaces/:wid/posts/:pid/queue` | `posts:publish` | Put into each account's next free queue slot |
| POST | `/api/v1/workspaces/:wid/posts/:pid/unschedule` | `posts:publish` | Back to approved/draft; removes jobs |
| PATCH | `/api/v1/workspaces/:wid/targets/:tid/schedule` | `posts:publish` | Move one target (calendar drag-and-drop) |
| PUT | `/api/v1/workspaces/:wid/posts/:pid/recurrence` | `posts:publish` | Set/replace a recurring rule |
| DELETE | `/api/v1/workspaces/:wid/posts/:pid/recurrence` | `posts:publish` | Stop recurring |
| GET | `/api/v1/workspaces/:wid/calendar?from=&to=&accounts=` | `calendar:read` | Targets in a date range, for month/week views |
| GET/PUT | `/api/v1/workspaces/:wid/accounts/:aid/queue-slots` | `accounts:manage` | Read/replace an account's slots |

## Services
- `schedule(postId, at | perTarget)`: validates (future time, approved, accounts active), sets `scheduledAt`, bumps `scheduleVersion`, adds delayed `publish` jobs.
- `reschedule(targetId, at)`: bump version, remove the old job, add a new one.
- `nextFreeSlot(accountId, after)`: finds the next unused QueueSlot.
- `expandRecurring(ruleId, horizon)`: creates PostTargets for occurrences in the horizon.

## Jobs
| Queue | Runs | Does |
| --- | --- | --- |
| `recurring` | hourly | Expand active rules 7 days ahead |
| `reconcile` | every 5 min | For every target `scheduled` in the next 48 h, ensure its delayed job exists (recreate from Postgres if Valkey lost it); fail or verify targets stuck in `publishing` |

## Rules
- Postgres is the source of truth; Valkey jobs can always be rebuilt.
- Minimum schedule time: now + 2 minutes. Maximum: 1 year ahead.
- Times are stored in UTC. Recurring rules keep their own timezone so they don't drift with daylight saving.
- Scheduled count respects `checkLimit('scheduledPosts')` when billing is on.
- Emits `post.scheduled`, `post.rescheduled`, `post.unscheduled`.
