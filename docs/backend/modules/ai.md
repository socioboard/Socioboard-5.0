# Module: ai

**Phase:** 4 (built against a mock first, then the Python team's real API) · **Path:** `packages/core/src/modules/ai` · **Depends on:** media, billing (credits, optional), notifications, platform (queue, realtime, storage)

## Purpose
The only code that talks to the Python AI service (the `AiGateway`). People generate images from a prompt and a few fixed settings, each with a ready-to-post caption; images land in the media library, the caption goes to the composer.

**Launch scope (agreed with the AI team, 2026-10-08):** images only, each with its caption. Text on its own (a caption for a photo someone already has) and video come later: they stay job types, without inputs until the AI service supports them (asked of the AI team: when text-only can follow).

Decided with the AI team on 2026-10-08: **no templates** (fixed forms per type, owned by us), the AI service exposes **two endpoints** and we expose **two**:

| Who | Endpoint | What |
| --- | --- | --- |
| AI service | `POST /v1/jobs` | Start a job; `202 { jobId, reference, status }` at once |
| AI service | `GET /v1/jobs/{jobId}` | Status, progress and result, the same shape as the final result update; our fallback when a result update is missed |
| Socioboard | `POST /api/v1/ai/callbacks/jobs/{reference}/uploads` | An upload slot for one output file: a URL to PUT it to and the `key` that names it |
| Socioboard | `POST /api/v1/ai/callbacks/result` | The result update: progress, or the final result naming uploaded files by key |

Our two are specified in [ai-callbacks.openapi.yaml](../ai-callbacks.openapi.yaml) (signing, payloads, errors); theirs in the AI service's API reference (2026-10-08, to be published as OpenAPI in its repository). Both are HMAC-signed with a shared secret; we call theirs with an API key.

## Data
| Table | Key fields | Notes |
| --- | --- | --- |
| `AiJob` | id (sent as `reference`), workspaceId, userId, type (text/image/video), input JSON, targetNetworks[], refinesJobId? (a follow-up on an earlier job in the same workspace), status (queued/running/succeeded/failed/cancelled), progress?, externalJobId?, text[] (joined captions), copies JSON (their parts; the column comes with P4-B7), usage JSON, creditsUsed, errorCode?, errorMessage?, createdAt, finishedAt | Outputs are `MediaAsset` rows with `aiJobId` |

An upload slot is a `MediaAsset` in `uploading` status with `source: ai` and `aiJobId`, created like a browser upload (same storage keys, same presigned PUT on S3 or the NAS upload route). The result update completes the ones it names; ones it doesn't are removed by `media-purge` after a day, as abandoned uploads are.

## Inputs (fixed per type, in `packages/contracts/src/ai.ts`)
| Type | Fields |
| --- | --- |
| image | prompt (1–2,000 characters); post type (`post`, `carousel`, `quote`, `story`, `thumbnail`, `banner`; default `post`); aspect ratio (1:1, 4:5, 9:16, 16:9; optional, else the AI service picks it from the networks and post type); count (1–4, default 1); up to 5 reference images from the library |
| text, video | Later, when the AI service supports them |

Being confirmed with the AI team: the post type values (`story` is our addition), and `count`, which their API has no field for yet.

Every job also carries its target networks' `ContentRules` (character limit, hashtags, sizes, ratios), so outputs fit where they'll be posted. The AI service keeps its own table of limits as a fallback; ours decide whether a post can publish, so we asked it to fit to ours when present.

## API (for the web app)
| Method | Path | Permission | Description |
| --- | --- | --- | --- |
| GET | `/api/v1/ai` | signed in | Whether AI is on (the UI hides it when not) |
| POST | `/api/v1/workspaces/:wid/ai/jobs` | `ai:generate` | Start a job (Idempotency-Key). A follow-up ("shorter", "less formal") sends `refinesJobId` with the instruction, and the AI service receives the earlier job's results as context |
| GET | `/api/v1/workspaces/:wid/ai/jobs` | `ai:generate` | My recent jobs |
| GET | `/api/v1/workspaces/:wid/ai/jobs/:jid` | `ai:generate` | Status, progress, results |
| POST | `/api/v1/workspaces/:wid/ai/jobs/:jid/cancel` | `ai:generate` | Stop waiting: the job shows as cancelled and its result is ignored (the AI service has no cancel; it still finishes) |

## Calling the AI service
`POST /v1/jobs` with `Authorization: Bearer <AI_SERVICE_KEY>` and an `Idempotency-Key` (the `AiJob` id; the same key and body return the first `202`, a different body is 409 `idempotency_conflict`):

```
{ reference, workspaceId, type: "image", prompt, aspectRatio?,
  targets: [{ network, postType, rules }],   // rules: ours, asked to be used when present
  referenceImageUrls: [],                    // up to 5, signed, valid 1 hour; they download them
  context?: { instruction, previous: { text[], files: [{ url, mime }] } },   // follow-ups
  callbacks: { uploads: "<APP_URL>/api/v1/ai/callbacks/jobs/<reference>/uploads",
               result: "<APP_URL>/api/v1/ai/callbacks/result" } }
```

Their network names: `facebook` (our `facebook_page`), `linkedin` (`linkedin_person` and `linkedin_org`), `instagram`, `x`, `youtube`, `pinterest`; asked to add `threads`, `tiktok` and `tumblr`. Their errors carry `code`, `label` (shown to people), `message` (logged) and `retryable`: 400/422 `invalid_input` or `unsupported` (show the label), 401 (alert operators), 409, 429 with `Retry-After`, 5xx (retry with the same key). They only call allowlisted callback hosts (asked to make the list a setting, for self-hosters).

The final result carries `outputs` (the files by key; for a carousel, the slides in order), `text` (each caption ready to post, with hashtags and call to action joined) and `copies` (the same in parts: `caption`, `hashtags` without `#`, `cta`), and `usage`. A job they cancel or that fails arrives as `failed`; a retry from our side is a new job with a new reference.

## Flow
1. Validate the input against the type's fixed schema; `checkCredits(estimate)` when billing is on (our own estimate per type, count and duration).
2. Create `AiJob` (queued) and call `POST /v1/jobs`. `202 { jobId }` → `running`, `externalJobId` stored. Live to the web app over WebSocket (`ai.job.updated`).
3. For each file, the AI service asks for an upload slot and PUTs the file to it.
4. Result update (or the fallback poll) → `ai-result` job: complete the named uploads (size and type checked as for browser uploads, then `media-process` for thumbnails), store the text and copies, record usage, convert it to credits per model, emit `ai.job.completed`.

## Jobs
- `ai-result`: complete uploads, store text, debit credits, notify.
- `ai-poll` (every minute): `GET /v1/jobs/{id}` for jobs running over 2 minutes without a result update.

## Rules
- Signatures are checked on both endpoints (HMAC-SHA256 over `<t>.<raw body>`, 5-minute window); unknown jobs are 404, updates for jobs that already ended are ignored (204), so their retries are safe.
- An output is accepted only by a `key` issued for **that** job and only once its file has arrived; anything else is 422 `OUTPUT_NOT_UPLOADED`. The AI service never names a storage path itself.
- Upload slots: only while the job runs, at most 20 per job, the same types and size limits as browser uploads (images 20 MB, video 1 GB), valid one hour.
- If the AI service is not configured (self-host without it), AI is off: `GET /api/v1/ai` says so and the UI hides it.
- Content-policy refusals (`error.code: content_policy`) are shown with the AI service's `label` and use no credits; its `message` is only logged.
- Progress: `running` updates with `progress` (0 to 1, never going down) at most every 5 seconds, best effort (never retried, no `usage`); one arriving after the final update is ignored. Only the final update is retried, until a 2xx, for up to 24 hours.
- Timeouts: 30 s for `POST /v1/jobs` (5xx, 429 and timeouts retried with the same `Idempotency-Key`); the AI service keeps finished jobs' status 7 days for the fallback poll, and no files.
- Config: `AI_SERVICE_URL`, `AI_SERVICE_KEY` (our calls), `AI_WEBHOOK_SECRET` (their calls).
- **Mock:** `apps/ai-mock` implements the AI service's two endpoints and calls ours back with sample outputs; CI checks it against their OpenAPI file once it's published in `socioboard/socioboard-ai`.
