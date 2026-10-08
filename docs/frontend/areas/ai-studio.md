# Area: ai-studio

**Phase:** 4 (against the mock AI service first) · **Folder:** `features/ai` · **Backend:** [ai](../../backend/modules/ai.md), [media](../../backend/modules/media.md), [billing](../../backend/modules/billing.md) (credits)

## Screens
| Route | Screen | Permission |
| --- | --- | --- |
| `/w/:slug/ai` | Full-page studio: prompt and settings → target networks → Generate; results gallery (each image with its caption); recent jobs | `ai:generate` |
| (side panel in composer) | Same generator, compact; "Use this" inserts text into the editor or media into the post | `ai:generate` |

## Forms
No templates (decided 2026-10-08): one fixed form, built from the contracts (`packages/contracts/src/ai.ts`, listed in [ai](../../backend/modules/ai.md#inputs-fixed-per-type-in-packagescontractssrcaits)). At launch: **Image** (prompt, post type: post, carousel, quote, story, thumbnail or banner; aspect ratio, starting at what the chosen networks take; how many options; up to 5 reference images from the library), each with a ready-to-post caption, and **Caption** (prompt, how many options, the photos it's for). Video comes later. Results show as options to pick from: each one's images (a carousel's slides in order) with its caption. A result's caption shows in its parts (caption, hashtags, call to action), and "Use this" puts the joined caption in the editor. `GET /api/v1/ai` says whether AI is on.

## States
queued → running (progress when the AI service reports it, else "this can take a few minutes" for video) → succeeded (results) / failed (reason; content-policy refusals explained) / cancelled. Live via socket `ai.job.updated`.

## How results are shown (show, then apply, then undo)
The AI never changes a post or the library silently: every run shows what it understood, where it is, and what it proposes, and nothing lands until the person applies it. Reference: Framer's agent panel (request → "Thinking…" → plan → a list of changes with Undo), reviewed 2026-09-28.

1. **Request:** the prompt and settings stay visible at the top of the run as a chip (type, networks, tone or ratio), so people can see what the AI was asked.
2. **Progress in plain words:** the job state as a sentence ("Writing 3 captions for Instagram and LinkedIn…", "Rendering the video, about 2 minutes"), not just a spinner; cancel is always available while it runs (it stops the wait; the result is then ignored).
3. **Proposal:** results appear as options to choose from, never already in place. In the composer, a caption option shows as a change against the current text (added and removed words marked); media shows as "adds 1 image to the post".
4. **Apply, then undo:** "Use this" applies it and shows a short "Changes" line ("Caption replaced · 1 image added") with **Undo**, which restores exactly what was there before, until the next edit.
5. **Follow-up:** a box under the result refines it ("shorter", "less formal"), and each refinement is a new result in the same run, so earlier options stay available.

## API calls
`GET /ai`, `POST /ai/jobs` (Idempotency-Key), `GET /ai/jobs`, `GET /ai/jobs/:id`, `POST /ai/jobs/:id/cancel`.

## Behavior
- Generate several variations; pick one or regenerate.
- Generated images/videos appear in the media library with an "AI" badge; text is always editable before posting.
- Credit balance shown on the hosted cloud; estimate shown before generating video.
- If AI isn't configured (self-host without the AI service), the studio and "Generate" buttons are hidden.
