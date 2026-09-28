# Module: ai

**Phase:** 4 (built against a mock first, then the Python team's real API) · **Path:** `packages/core/src/modules/ai` · **Depends on:** media, billing (credits, optional), notifications, platform (queue, realtime)

## Purpose
The only code that talks to the Python AI service (the `AiGateway`). Users generate text, images or video from a prompt or a form; results land in the media library (images/video) or return as text for the composer.

## Data
| Table | Key fields | Notes |
| --- | --- | --- |
| `AiJob` | id, workspaceId, userId, type (text/image/video), templateId?, refinesJobId? (a follow-up on an earlier job in the same workspace), input JSON, targetNetworks[], status (queued/running/succeeded/failed/cancelled), externalJobId?, outputs JSON, creditsUsed, errorCode?, errorMessage?, createdAt, finishedAt | |
| `AiTemplate` | id, key, name, type, inputSchema JSON, active | Form definitions synced from the AI service (JSON Schema) |

## API
| Method | Path | Permission | Description |
| --- | --- | --- | --- |
| GET | `/api/v1/ai/templates` | signed in | Available generation forms (drives the UI) |
| POST | `/api/v1/workspaces/:wid/ai/jobs` | `ai:generate` | Start a job (Idempotency-Key); text may return synchronously. A follow-up ("shorter", "less formal") sends `refinesJobId` with the instruction, and the AI service receives the earlier job's outputs as context |
| GET | `/api/v1/workspaces/:wid/ai/jobs` | `ai:generate` | My recent jobs |
| GET | `/api/v1/workspaces/:wid/ai/jobs/:jid` | `ai:generate` | Status + outputs |
| POST | `/api/v1/workspaces/:wid/ai/jobs/:jid/cancel` | `ai:generate` | Cancel if still running |
| POST | `/api/webhooks/ai` | HMAC signature | Completion callback from the AI service |

## Flow
1. Validate input against the template schema; check `checkCredits(estimate)` (billing on).
2. Create `AiJob`, call the AI service with `workspaceId`, `Idempotency-Key`, callback URL and the target networks' `ContentRules`.
3. AI service replies `202 { jobId }`; status goes to `running`; UI is updated over WebSocket.
4. Webhook arrives (or the fallback poller finds it done) → enqueue `ai-result`.
5. `ai-result` job imports outputs via `media.importFromUrl` (source = ai), records usage, debits credits, emits `ai.job.completed`.

## Jobs
- `ai-result`: import outputs, debit credits.
- `ai-poll` (every minute): polls `GET /jobs/{id}` for jobs running over 2 minutes without a webhook.

## Rules
- Webhook signature (HMAC) is verified; unknown or duplicate job IDs are ignored.
- If the AI service is not configured (self-host without it), AI features are hidden (`GET /ai/templates` returns empty).
- Content-policy refusals are shown to the user with the AI service's message and don't use credits.
- **Waiting on:** the Python team's API spec, published as OpenAPI in their repo `socioboard/socioboard-ai`. The mock (`apps/ai-mock`) implements the contract listed in [architecture.md](../../architecture.md#ai-content-integration) until then, and that spec afterwards; CI checks the mock against it.
