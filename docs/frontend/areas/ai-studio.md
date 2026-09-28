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

## How results are shown (show, then apply, then undo)
The AI never changes a post or the library silently: every run shows what it understood, where it is, and what it proposes, and nothing lands until the person applies it. Reference: Framer's agent panel (request → "Thinking…" → plan → a list of changes with Undo), reviewed 2026-09-28.

1. **Request:** the prompt or filled template stays visible at the top of the run as a chip (template name, networks, tone), so people can see what the AI was asked.
2. **Progress in plain words:** the job state as a sentence ("Writing 3 captions for Instagram and LinkedIn…", "Rendering the video, about 2 minutes"), not just a spinner; cancel is always available while it runs.
3. **Proposal:** results appear as options to choose from, never already in place. In the composer, a caption option shows as a change against the current text (added and removed words marked); media shows as "adds 1 image to the post".
4. **Apply, then undo:** "Use this" applies it and shows a short "Changes" line ("Caption replaced · 1 image added") with **Undo**, which restores exactly what was there before, until the next edit.
5. **Follow-up:** a box under the result refines it ("shorter", "less formal"), and each refinement is a new result in the same run, so earlier options stay available.

## API calls
`GET /ai/templates`, `POST /ai/jobs` (Idempotency-Key), `GET /ai/jobs`, `GET /ai/jobs/:id`, `POST /ai/jobs/:id/cancel`.

## Behavior
- Generate several variations; pick one or regenerate.
- Generated images/videos appear in the media library with an "AI" badge; text is always editable before posting.
- Credit balance shown on the hosted cloud; estimate shown before generating video.
- If AI isn't configured (self-host without the AI service), the studio and "Generate" buttons are hidden.
