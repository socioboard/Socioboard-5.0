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
- One preview component per network, driven by the adapter's `preview` spec from `GET /api/v1/networks` (name/avatar placement, text truncation length and line limit, media grid shape, aspect-ratio crop, link card).
- Uses the connected account's real name and avatar.
- Shows what the network will cut: e.g. Instagram crops to the chosen ratio, X shows the 280-char cut, LinkedIn shows the "…see more" point.
- On mobile the preview is a toggle ("Edit" / "Preview").

## Validation
- Client-side quick checks (length, media count) for instant feedback, plus debounced `POST /posts/validate` (500 ms) for the full adapter rules.
- **Errors block** publishing for that network (e.g. too long, wrong video length); **warnings allow** (e.g. link in Instagram caption isn't clickable; X link posts cost more).

## Per-network tabs
"All networks" edits the shared content. A network tab creates an **override** for that network only; a "Reset to shared" button removes it. Network-specific options live here: Pinterest board + title, YouTube title/description/privacy, TikTok privacy level and comment/duet/stitch toggles + commercial disclosure (required by TikTok's audit), Instagram format (feed, reel or story; a feed post with 2–10 files is a carousel).

## Actions
| Button | Shown when | API |
| --- | --- | --- |
| Save draft | always | `POST/PATCH /posts` |
| Publish now | `posts:publish` and review not required | `POST /posts/:id/publish-now` |
| Schedule (date/time picker, workspace timezone) | `posts:publish` | `POST /posts/:id/schedule` |
| Add to queue | `posts:publish` and slots exist | `POST /posts/:id/queue` |
| Submit for review | review required | `POST /posts/:id/submit` |

**Built in P1-F2** (`features/composer`, routes `/w/:slug/compose` for `posts:create`, `/w/:slug/compose/:postId`):
- Draft model (`draft.ts`): the shared content (text, media, link, first comment) plus **one override per network**. The API keeps overrides per account; saving gives every selected account its network's override, and loading a post rebuilds the per-network overrides from its targets (cancelled deliveries ignored). Overrides of networks no longer selected are left out when saving.
- "Post to": the design-system `AccountPicker` over the workspace's accounts (paused or needs-reconnecting ones shown but not pickable); with no accounts, a line pointing admins to the accounts page.
- Tabs: "All networks" plus one per selected network (arrow keys, Home/End); a dot marks a network with its own content, and a deselected network's tab goes away. On "All networks", character counters for every network using the shared text, and a note naming the networks that have their own. A network tab shows that network's text (typing there makes it its own, starting from the shared text) and counter, the shared media with "Use different media for <network>", and "Reset to shared" for each part it overrides. Instagram's tab adds feed / reel / story (feed is the default and stores nothing).
- Media strip: thumbnails in order with remove and "move earlier", "processing" until ready, "This file was deleted" for a file that's gone; Upload attaches each file as soon as it's stored (progress, retry and dismiss inline); "Choose from library" picks files in order, showing what's already attached.
- Link (checked to be an http(s) address when the field is left) and an optional first comment, on "All networks".
- Editing: a post with a publishing or published delivery opens read-only with a notice; so does someone else's post for a person who can't approve posts.
- The issues panel (P1-F4) and Save / Publish / autosave (P1-F5) join this screen next; the sidebar's Compose button arrives with saving.

**Built in P1-F3** (`features/composer/previews`):
- The preview sits beside the editor from 1024 px (sticky), with a tab per selected network; below that, an "Edit / Preview" switch shows one at a time. Choosing a network's tab in the editor switches the preview to it; the preview's own tabs don't move the editor. With several accounts of one network selected, "Preview as" picks which account's name and avatar to show.
- A pure model (`previews/model.ts`) decides what each network shows from its `PreviewSpec`: the cut before "See more" (after `truncateLines` lines, e.g. Facebook 5 and Instagram 2, then at `truncateAt` characters counted in code points, as networks count, and made between words when a word straddles the limit), the crop (a file kept within `cropAspectRatio`), Facebook's grid (one in its own shape but no taller than 4:5; two side by side; one above two; 2 × 2 with "+N"), Instagram's frame (a feed post or carousel takes the first file's shape within 4:5–1.91:1; reels and stories are 9:16), link-card hosts, and hashtags/mentions/links.
- Facebook: the Page's name and avatar, "Just now" and the public globe, text cut at about 480 characters with "See more" (which expands), the photo grid or a link card (the site's host and the address) when there are no photos, the Like / Comment / Share bar, and the first comment as a reply from the Page.
- Instagram: the username, the media first in one frame, a carousel with its "n/N" count, arrows and dots, the action row, and the caption after the bold username, cut at about 125 characters with "more". Web addresses stay plain (Instagram doesn't make them links). Reels and stories are drawn in a narrower phone-shaped card; stories show no caption and say so. A post with no media says Instagram needs a photo or video.
- A lone picture up to 2 MB shows its full file; otherwise (larger, or several in a grid or carousel) the 480 px thumbnail, so a post of big photos stays light; videos show their poster with a play mark; a picture that won't load falls back to a placeholder. Text is always rendered as plain React text, never as HTML.
- Uploading several files at once keeps the order they were picked in, whichever finishes uploading first.

## AI panel (phase 4)
"Generate" opens [ai-studio](ai-studio.md) as a side panel: generate a caption into the editor, or an image/video into the media strip. Generated text is always editable. Results follow the studio's show → apply → undo pattern: options are proposed (a caption as a change against the current text), nothing enters the post until "Use this", and every applied change can be undone.

## Behavior
- Autosave draft every 10 s while editing (debounced); "Saved" indicator.
- Leaving with unsaved changes asks to confirm.
- Editing an approved post warns that it will go back to review (if the user can't approve).
