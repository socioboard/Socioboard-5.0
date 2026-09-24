# Area: composer

**Phase:** 1 (core + Meta previews), 2 (schedule/queue controls), 3 (all network previews + options), 4 (AI panel, submit for review) · **Folder:** `features/composer` · **Backend:** [posts](../../backend/modules/posts.md), [providers](../../backend/modules/providers.md), [scheduling](../../backend/modules/scheduling.md), [approvals](../../backend/modules/approvals.md), [ai](../../backend/modules/ai.md), [media](../../backend/modules/media.md), [shortlinks](../../backend/modules/shortlinks.md)

The most important screen in the product: write once, tailor per network, see exactly how it will look, then publish, schedule or send for review.

## Screens
| Route | Screen | Permission |
| --- | --- | --- |
| `/w/:slug/compose` | New post | `posts:create` |
| `/w/:slug/compose/:postId` | Edit draft / scheduled post | author or `posts:approve` |

## Layout
```
┌ Account picker (avatars; groups; only accounts I can access) ───────────────┐
├ Editor (left) ─────────────────────────────┬ Live preview (right) ──────────┤
│ Tabs: [All networks] [Facebook] [Instagram]…│ Tabs per selected network      │
│ Text with character counter per network     │ Network-styled mock of the post│
│ Media strip (pick / upload / AI generate)   │ Updates as you type            │
│ Link, first comment, labels                 │ Shows truncation/"see more"    │
│ Network options (board, title, privacy…)    │ Shows validation issues inline │
├ Issues panel: errors (block) / warnings (allow) per network ────────────────┤
└ Footer: [Save draft] [Submit for review] or [Publish now] [Schedule ▾] [Add to queue] ┘
```

## Live preview
- One preview component per network, driven by the adapter's `preview` spec from `GET /api/v1/networks` (name/avatar placement, text truncation length, media grid shape, aspect-ratio crop, link card).
- Uses the connected account's real name and avatar.
- Shows what the network will cut: e.g. Instagram crops to the chosen ratio, X shows the 280-char cut, LinkedIn shows the "…see more" point.
- On mobile the preview is a toggle ("Edit" / "Preview").

## Validation
- Client-side quick checks (length, media count) for instant feedback, plus debounced `POST /posts/validate` (500 ms) for the full adapter rules.
- **Errors block** publishing for that network (e.g. too long, wrong video length); **warnings allow** (e.g. link in Instagram caption isn't clickable; X link posts cost more).

## Per-network tabs
"All networks" edits the shared content. A network tab creates an **override** for that network only; a "Reset to shared" button removes it. Network-specific options live here: Pinterest board + title, YouTube title/description/privacy, TikTok privacy level and comment/duet/stitch toggles + commercial disclosure (required by TikTok's audit), Instagram post type (feed/reel/story/carousel).

## Actions
| Button | Shown when | API |
| --- | --- | --- |
| Save draft | always | `POST/PATCH /posts` |
| Publish now | `posts:publish` and review not required | `POST /posts/:id/publish-now` |
| Schedule (date/time picker, workspace timezone) | `posts:publish` | `POST /posts/:id/schedule` |
| Add to queue | `posts:publish` and slots exist | `POST /posts/:id/queue` |
| Submit for review | review required | `POST /posts/:id/submit` |

## AI panel (phase 4)
"Generate" opens [ai-studio](ai-studio.md) as a side panel: generate a caption into the editor, or an image/video into the media strip. Generated text is always editable.

## Behavior
- Autosave draft every 10 s while editing (debounced); "Saved" indicator.
- Leaving with unsaved changes asks to confirm.
- Editing an approved post warns that it will go back to review (if the user can't approve).
