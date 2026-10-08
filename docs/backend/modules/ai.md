# Module: ai

**Phase:** 4 (built against a mock first, then the Python team's real API) · **Path:** `packages/core/src/modules/ai` · **Depends on:** media, billing (credits, optional), notifications, platform (queue, realtime, storage)

## Purpose
The only code that talks to the Python AI service (the `AiGateway`). People generate text, images or video from a prompt and a few fixed settings per type; files land in the media library, text returns to the composer.

Decided with the AI team on 2026-10-08: **no templates** (fixed forms per type, owned by us), the AI service exposes **two endpoints** and we expose **two**:

| Who | Endpoint | What |
| --- | --- | --- |
| AI service | `POST /jobs` | Start a job; `202 { jobId }` at once (text may come back in the same reply) |
| AI service | `GET /jobs/{jobId}` | Status and result; our fallback when a result update is missed |
| Socioboard | `POST /api/ai/jobs/{reference}/uploads` | An upload slot for one output file: a URL to PUT it to and the `key` that names it |
| Socioboard | `POST /api/webhooks/ai` | The result update: progress, or the final result naming uploaded files by key |

Our two are specified in [ai-callbacks.openapi.yaml](../ai-callbacks.openapi.yaml) (signing, payloads, errors); theirs in the AI service's repository. Both are HMAC-signed with a shared secret; we call theirs with an API key.

## Data
| Table | Key fields | Notes |
| --- | --- | --- |
| `AiJob` | id (sent as `reference`), workspaceId, userId, type (text/image/video), input JSON, targetNetworks[], refinesJobId? (a follow-up on an earlier job in the same workspace), status (queued/running/succeeded/failed/cancelled), progress?, externalJobId?, text JSON (variations), usage JSON, creditsUsed, errorCode?, errorMessage?, createdAt, finishedAt | Outputs are `MediaAsset` rows with `aiJobId` |

An upload slot is a `MediaAsset` in `uploading` status with `source: ai` and `aiJobId`, created like a browser upload (same storage keys, same presigned PUT on S3 or the NAS upload route). The result update completes the ones it names; ones it doesn't are removed by `media-purge` after a day, as abandoned uploads are.

## Inputs (fixed per type, in `packages/contracts/src/ai.ts`)
| Type | Fields |
| --- | --- |
| text | prompt (1–2,000 characters), tone (friendly, professional, playful, bold), length (short, medium, long), variations (1–5) |
| image | prompt (1–2,000 characters), aspect ratio (1:1, 4:5, 9:16, 16:9), count (1–4), reference image? |
| video | prompt (1–2,000 characters), aspect ratio (9:16, 16:9, 1:1), duration (5–60 seconds), reference image? |

Every job also carries its target networks' `ContentRules` (character limit, sizes, ratios, durations), so outputs fit where they'll be posted.

## API (for the web app)
| Method | Path | Permission | Description |
| --- | --- | --- | --- |
| GET | `/api/v1/ai` | signed in | Whether AI is on (the UI hides it when not) |
| POST | `/api/v1/workspaces/:wid/ai/jobs` | `ai:generate` | Start a job (Idempotency-Key); text may come back at once. A follow-up ("shorter", "less formal") sends `refinesJobId` with the instruction, and the AI service receives the earlier job's results as context |
| GET | `/api/v1/workspaces/:wid/ai/jobs` | `ai:generate` | My recent jobs |
| GET | `/api/v1/workspaces/:wid/ai/jobs/:jid` | `ai:generate` | Status, progress, results |
| POST | `/api/v1/workspaces/:wid/ai/jobs/:jid/cancel` | `ai:generate` | Stop waiting: the job shows as cancelled and its result is ignored (the AI service has no cancel; it still finishes) |

## Calling the AI service
`POST /jobs` with `Authorization: Bearer <AI_SERVICE_KEY>` and an `Idempotency-Key` (the `AiJob` id):

```
{ reference, workspaceId, type, input, targets: [{ network, rules }],
  referenceImageUrl?,            // signed, valid 1 hour; they download it
  context?: { instruction, previous: { text[], files: [{ url, mime }] } },   // follow-ups
  callbacks: { uploads: "<APP_URL>/api/ai/jobs/<reference>/uploads",
               result: "<APP_URL>/api/webhooks/ai" } }
```

## Flow
1. Validate the input against the type's fixed schema; `checkCredits(estimate)` when billing is on (our own estimate per type, count and duration).
2. Create `AiJob` (queued) and call `POST /jobs`. `202 { jobId }` → `running`, `externalJobId` stored; text in the reply → handled as a result update. Live to the web app over WebSocket (`ai.job.updated`).
3. For each file, the AI service asks for an upload slot and PUTs the file to it.
4. Result update (or the fallback poll) → `ai-result` job: complete the named uploads (size and type checked as for browser uploads, then `media-process` for thumbnails), store text, record usage, convert it to credits per model, emit `ai.job.completed`.

## Jobs
- `ai-result`: complete uploads, store text, debit credits, notify.
- `ai-poll` (every minute): `GET /jobs/{id}` for jobs running over 2 minutes without a result update.

## Rules
- Signatures are checked on both endpoints (HMAC-SHA256 over `<t>.<raw body>`, 5-minute window); unknown jobs are 404, updates for jobs that already ended are ignored (204), so their retries are safe.
- An output is accepted only by a `key` issued for **that** job and only once its file has arrived; anything else is 422 `OUTPUT_NOT_UPLOADED`. The AI service never names a storage path itself.
- Upload slots: only while the job runs, at most 20 per job, the same types and size limits as browser uploads (images 20 MB, video 1 GB), valid one hour.
- If the AI service is not configured (self-host without it), AI is off: `GET /api/v1/ai` says so and the UI hides it.
- Content-policy refusals (`error.code: content_policy`) are shown with the AI service's message and use no credits.
- Timeouts: 30 s for `POST /jobs` (5xx, 429 and timeouts retried with the same `Idempotency-Key`); the AI service keeps finished jobs' status 7 days for the fallback poll, and no files.
- Config: `AI_SERVICE_URL`, `AI_SERVICE_KEY` (our calls), `AI_WEBHOOK_SECRET` (their calls).
- **Mock:** `apps/ai-mock` implements the AI service's two endpoints and calls ours back with sample outputs; CI checks it against their OpenAPI file once it's published in `socioboard/socioboard-ai`.
