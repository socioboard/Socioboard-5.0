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
| `publish` | `publish-<targetId>-<tries>` | Publish one target. `tries` is the target's attempt count when queued, so publish-now twice or a double click queues it once, and a retry after a failure is a new job. A scheduled target's job is `publish-<targetId>-v<scheduleVersion>`, delayed until `scheduledAt`, with the version in its data (P2-B2) |
| `media-prepare` | (inline in `publish` for now) | Get each file into the form the network takes (the adapter's `imagePrep`: media's `prepareImageVariant` converts, shrinks and re-compresses images once per spec) and give it a read URL and, when configured, a public address. Video transcoding (phase 3 networks) may move this to its own queue |

**Publish processor steps:**
1. Load target; exit if its workspace was deleted, or if its status isn't `pending`/`scheduled`/`publishing` or `externalPostId` is already set (idempotency).
2. **Rate limits** (P2-B6): take a slot in the account's and the app's limits (see Rules). When there is none, the job is moved back to delayed until there is (plus up to 1 s, so jobs held by the same limit don't all wake together), without claiming or using a try. Skipped when the try would fail without calling the network (the account needs reconnecting, the network is off).
3. **Claim the try**: move `attempts` from n to n+1 only if it is still n, so two runs of the same target can't both publish. Record a `PublishAttempt` (`running`).
4. Check the account is `active` (else an `auth` failure without calling the network) and the network is enabled. A scheduled job only runs if its schedule version is still the target's (checked on load and again in the atomic claim, so a reschedule committing at the same moment wins or loses as a whole); a job without a version never sends a `scheduled` target. Phase 4 adds: the post is still approved.
5. Resolve content (shared content + override); prepare media; get the token (`getCredentials`: the asset's own, else its login's).
6. Call `adapter.publish()`.
7. Success → `published`, save externalId/permalink **at once** (a re-run then exits at step 1), clear `lastError`, attempt `published` (warnings such as a refused first comment go in the attempt's message), emit `target.published`.
8. Error → classify (anything that isn't a `ProviderError` counts as `retryable` and is logged):
   - `retryable` / `rate_limited` with tries left → attempt `will_retry`, target stays `publishing` with `lastError`, BullMQ retries (5 tries in all; waits the network's `retryAfter`, else 30 s, 1 min, 2 min, 4 min)
   - `auth` → target `failed`, the login and its accounts `reauth_required`, no retry
   - `content`, or the last try → target `failed` with the network's message, no retry
   - `rate_limited` also pauses the limit the network named (the account, or the whole app for Meta code 4) for as long as this target waits, so other posts on it wait too instead of using their tries
9. Recompute the post status; emit `target.failed` after the final failure.

**Publish now** (`POST /posts/:pid/publish-now`, in posts): refuses when the workspace reviews everything (`REVIEW_REQUIRED` until approvals, phase 4), when a target isn't waiting (`pending` or `scheduled`; `POST_ALREADY_SENT`, 409), or when validation finds errors (`POST_HAS_ERRORS`, 422, with the full validation report in `details`). Under the post lock it moves the waiting targets to `publishing` and bumps their schedule version (a scheduled post's delayed jobs go stale and are dropped), then queues them; if queuing fails they go back to `pending`, or to `scheduled` at their previous version, so the delayed job they already had is valid again. An `Idempotency-Key` is claimed atomically (Valkey `INCR`, 24 hours): of requests with the same key, even ones arriving at the same moment, only the first publishes and the others answer with the post as it is; if the first fails (e.g. validation errors), the key is released so it works again once the problem is fixed. **Retry** (`…/targets/:tid/retry`) does the same for one `failed` target (`TARGET_NOT_FAILED`, 409, otherwise).

**Media:** files are uploaded to the network where it allows (Facebook photos and videos, Instagram videos via a Page) and fetched from a signed public address (`MEDIA_PUBLIC_URL`, `media.<domain>`) where it doesn't (Instagram images). See [media](media.md#delivering-media-to-networks-p1-b8).

## Rules
- **Rate limits** (P2-B6): each network adapter declares `rateLimits` (`perAccount` and `perApp` moving windows). BullMQ's group limiter is a paid (Pro) feature, so the limits are our own, shared by every worker in Valkey (`platform/queue` `RateLimiter`): two buckets per try, `publish:account:<accountId>` and `publish:app:<login provider>` (every account signed in through that OAuth app). A try takes a slot in both or neither; each try counts once however often its job runs. Today: Facebook Pages 60 an hour each (Meta sets no fixed number; a guard against a runaway queue), Instagram 50 per account in any 24 hours (Meta's content publishing limit), no fixed app windows (Meta's move with usage). When a network answers "slow down", that bucket is paused (`retryAfter`, else the try's backoff), the account's or, for Meta code 4, the app's. A post held back keeps its status (`scheduled` or `publishing`); its delayed job counts as live for `reconcile`. Admin-tunable limits come in phase 3; showing "waiting for the network's limit" on the post is a later UI task.
- **Timeouts:** 60 s per API call; video uploads use resumable sessions with their own timeout.
- **Never double-post:** the job ID is deterministic, `externalPostId` is checked first, and network idempotency keys are used where supported.
- **Stuck jobs:** targets in `publishing` for over 15 minutes with no live job behind them (a job waiting to retry counts as live) are stopped by the `reconcile` job ([scheduling](scheduling.md)): failed with a message asking to check the account before publishing again, never retried blindly, since the network may already have the post. Looking the post up on the network first arrives when adapters can.
- **AI labels:** if any media has `source = ai`, set the network's AI-disclosure flag where the adapter supports it.
