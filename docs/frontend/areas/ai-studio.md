# Area: ai-studio

**Phase:** 4 (against the mock AI service first) · **Folder:** `features/ai` · **Backend:** [ai](../../backend/modules/ai.md), [media](../../backend/modules/media.md), [billing](../../backend/modules/billing.md) (credits)

## Screens
| Route | Screen | Permission |
| --- | --- | --- |
| `/w/:slug/ai` | Full-page studio: choose Text / Image / Video → prompt box **or** a template form → target networks → Generate; results gallery; recent jobs | `ai:generate` |
| (side panel in composer) | Same generator, compact; "Use this" inserts text into the editor or media into the post | `ai:generate` |

## Forms
Template forms are rendered automatically from the template's JSON Schema (`GET /api/v1/ai/templates`): text fields, selects (tone, audience), toggles. No hard-coded forms, so the Python team can add templates without frontend releases.

## States
queued → running (progress / "this can take a few minutes" for video) → succeeded (results) / failed (reason; content-policy refusals explained) / cancelled. Live via socket `ai.job.updated`.

## API calls
`GET /ai/templates`, `POST /ai/jobs` (Idempotency-Key), `GET /ai/jobs`, `GET /ai/jobs/:id`, `POST /ai/jobs/:id/cancel`.

## Behavior
- Generate several variations; pick one or regenerate.
- Generated images/videos appear in the media library with an "AI" badge; text is always editable before posting.
- Credit balance shown on the hosted cloud; estimate shown before generating video.
- If AI isn't configured (self-host without the AI service), the studio and "Generate" buttons are hidden.
