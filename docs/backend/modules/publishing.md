# Module: publishing

**Phase:** 1 (publish now), 2 (hardening: rate limits, reconcile) · **Path:** `packages/core/src/modules/publishing` (processors run in `apps/worker`) · **Depends on:** posts, social-accounts, providers, media, notifications, audit

## Purpose
Actually sends each PostTarget to its network. Runs only in the worker. Handles media preparation, retries, rate limits and recording results.

## Data
Writes to `PostTarget` (status, externalPostId, permalink, attempts, lastError, publishedAt). Adds:

| Table | Key fields | Notes |
| --- | --- | --- |
| `PublishAttempt` | id, workspaceId, postTargetId, attemptNo, startedAt, finishedAt, outcome, errorKind, networkCode, message, costUnits? | Full history shown to users and admins; `costUnits` tracks X per-post cost |

## API
None directly (triggered via posts and scheduling). Read access to attempts is through `GET /posts/:pid` (history).

## Jobs
| Queue | Job | Behavior |
| --- | --- | --- |
| `media-prepare` | `prepare:<targetId>` | Resize/transcode media to the target network's rules; produce public URLs |
| `publish` | `publish:<targetId>:v<scheduleVersion>` | Publish one target. Delayed until `scheduledAt` for scheduled posts |

**Publish processor steps:**
1. Load target; exit if status isn't `scheduled`/`pending` or `externalPostId` is already set (idempotency).
2. Check the account is `active`, the post is still approved, and the schedule version matches.
3. Set `publishing`; resolve content; get tokens; run `media-prepare` if needed.
4. Call `adapter.publish()`.
5. Success → `published`, save externalId/permalink, emit `target.published`.
6. Error → classify:
   - `retryable` / `rate_limited` → retry with backoff (max 5; respect `retryAfter`)
   - `auth` → mark account `reauth_required`, target `failed`, no retry
   - `content` → target `failed` with the network's message, no retry
7. Record a `PublishAttempt`; recompute post status; emit `target.failed` after the final failure.

## Rules
- **Rate limits:** BullMQ group limiter keyed by `network:account` and `network:app`, tuned per network.
- **Timeouts:** 60 s per API call; video uploads use resumable sessions with their own timeout.
- **Never double-post:** the job ID is deterministic, `externalPostId` is checked first, and network idempotency keys are used where supported.
- **Stuck jobs:** targets in `publishing` for over 15 minutes are picked up by the `reconcile` job ([scheduling](scheduling.md)), which checks the network before retrying.
- **AI labels:** if any media has `source = ai`, set the network's AI-disclosure flag where the adapter supports it.
