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
- **X** (P3-B2): the name, @handle and "now"; the text as X will post it (the link added after it unless the text has it); photos in X's layouts (one in its own shape, a wide one whole and a tall one trimmed to 3:4, two side by side, one tall beside two, 2 × 2); a link card ("From <host>") when there's no media; X's action row. Posts with a link get the `X_LINK_COST` note, since X charges more for them.
- On mobile the preview is a toggle ("Edit" / "Preview").

## Validation
- Client-side quick checks (length, media count) for instant feedback, plus debounced `POST /posts/validate` (500 ms) for the full adapter rules.
- **Errors block** publishing for that network (e.g. too long, wrong video length); **warnings allow** (e.g. link in Instagram caption isn't clickable; X link posts cost more).

## Per-network tabs
"All networks" edits the shared content. A network tab creates an **override** for that network only; a "Reset to shared" button removes it. Network-specific options live here: Pinterest board + title, YouTube title/description/privacy, TikTok privacy level and comment/duet/stitch toggles + commercial disclosure (required by TikTok's audit), Instagram format (feed, reel or story; a feed post with 2–10 files is a carousel). The choices a panel offers (Pinterest boards, TikTok's privacy levels and locked toggles, YouTube's allowed privacy) come from `GET /accounts/:aid/options`, asked when the network's tab opens (TikTok: again before each post).

## Actions
| Button | Shown when | API |
| --- | --- | --- |
| Save draft | always | `POST/PATCH /posts` |
| Publish now | `posts:publish` and review not required | `POST /posts/:id/publish-now` |
| Schedule (date/time picker, workspace timezone) | `posts:publish` | `POST /posts/:id/schedule` |
| Add to queue | `posts:publish` and slots exist | `POST /posts/:id/queue` |
| Submit for review | review required and not yet approved, for the author | `POST /posts/:id/submit` |

**Built in P4-F1** (review): a saved post's details carry `review` (`needed`, and the latest step), and a new post needs review when the workspace reviews every post or its author can't publish. While review is needed and the post isn't approved, Publish now, Schedule and Add to queue give way to **Submit for review** (save, then submit). Banners: waiting for review (the author can **Take back**; approvers get **Review it**, to the review panel), changes requested (with the reviewer's note), and approved ("Changing it sends it back for review", for people who can't approve).

**Built in P1-F2** (`features/composer`, routes `/w/:slug/compose` for `posts:create`, `/w/:slug/compose/:postId`):
- Draft model (`draft.ts`): the shared content (text, media, link, first comment) plus **one override per network**. The API keeps overrides per account; saving gives every selected account its network's override, and loading a post rebuilds the per-network overrides from its targets (cancelled deliveries ignored). Overrides of networks no longer selected are left out when saving.
- A network's own settings live in its override's `options`, under the key that applies to it (`optionKeysFor`): the `options` action merges values into one key (`undefined` clears a setting; `null` is a choice, e.g. TikTok's "not commercial"), so each options panel (P3-F2) sets only its fields. Settings aren't content: "Reset to shared" keeps them, and an override with only settings doesn't mark the text or media as the network's own. Saving sends each account only the keys that apply to its network (`toPostBody`), and loading a post brings them back (`fromPost`); Instagram's format is the `instagram` key's `format` (P3-B9).
- **Account settings** (P3-F2): a setting whose choices come from the account itself (`ACCOUNT_OPTION_FIELDS`: Pinterest `boardId`, TikTok `privacy`) is kept per account in `draft.accountOptions` (the `accountOptions` action), since two accounts of one network have different boards and privacy levels. Saving puts each account's own settings over its network's; loading a post splits them back; taking an account off the post drops its settings.
- **Options panels** (P3-F2, `features/composer/options`): `OPTION_PANELS` (`registry.ts`) gives each network with settings a panel, shown in its tab. The frame (`panels.tsx`) asks every selected account of the network for its choices when the panel needs them (`needsChoices`, `GET …/accounts/:id/options`, asked fresh each time), shows a skeleton while waiting and a banner with "Try again" for an account whose choices failed (the other accounts stay usable), then hands the panel `accounts` (each with its `choices`, `own` settings and `setOwn`), the network's `options` and `set`. `PerAccount` draws an account-specific field once for one account, or a row per account with its name. Threads has its panel too (`threads-panel.tsx`: who can reply, P3-B10). To add a network: write its panel next to `instagram-panel.tsx` and add it to `OPTION_PANELS`; issues on `options` already jump to the panel (`data-field="options"`).
- "Post to": the design-system `AccountPicker` over the workspace's accounts (paused or needs-reconnecting ones shown but not pickable); with no accounts, a line pointing admins to the accounts page.
- Tabs: "All networks" plus one per selected network (arrow keys, Home/End); a dot marks a network with its own content, and a deselected network's tab goes away. On "All networks", character counters for every network using the shared text, and a note naming the networks that have their own. A network tab shows that network's text (typing there makes it its own, starting from the shared text) and counter, the shared media with "Use different media for <network>", and "Reset to shared" for each part it overrides. Instagram's tab adds feed / reel / story (feed is the default and stores nothing).
- Media strip: thumbnails in order with remove and "move earlier", "processing" until ready, "This file was deleted" for a file that's gone; Upload attaches each file as soon as it's stored (progress, retry and dismiss inline); "Choose from library" picks files in order, showing what's already attached.
- Link (checked to be an http(s) address when the field is left) and an optional first comment, on "All networks".
- Editing: a post with a publishing or published delivery opens read-only with a notice; so does someone else's post for a person who can't approve posts.

**Built in P1-F3** (`features/composer/previews`):
- The preview sits beside the editor from 1024 px (sticky), with a tab per selected network; below that, an "Edit / Preview" switch shows one at a time. Choosing a network's tab in the editor switches the preview to it; the preview's own tabs don't move the editor. With several accounts of one network selected, "Preview as" picks which account's name and avatar to show.
- A pure model (`previews/model.ts`) decides what each network shows from its `PreviewSpec`: the cut before "See more" (after `truncateLines` lines, e.g. Facebook 5 and Instagram 2, then at `truncateAt` characters counted in code points, as networks count, and made between words when a word straddles the limit), the crop (a file kept within `cropAspectRatio`), Facebook's grid (one in its own shape but no taller than 4:5; two side by side; one above two; 2 × 2 with "+N"), Instagram's frame (a feed post or carousel takes the first file's shape within 4:5–1.91:1; reels and stories are 9:16), link-card hosts, and hashtags/mentions/links.
- Facebook: the Page's name and avatar, "Just now" and the public globe, text cut at about 480 characters with "See more" (which expands), the photo grid or a link card (the site's host and the address) when there are no photos, the Like / Comment / Share bar, and the first comment as a reply from the Page.
- Instagram: the username, the media first in one frame, a carousel with its "n/N" count, arrows and dots, the action row, and the caption after the bold username, cut at about 125 characters with "more". Web addresses stay plain (Instagram doesn't make them links). Reels and stories are drawn in a narrower phone-shaped card; stories show no caption and say so. A post with no media says Instagram needs a photo or video.
- A lone picture up to 2 MB shows its full file; otherwise (larger, or several in a grid or carousel) the 480 px thumbnail, so a post of big photos stays light; videos show their poster, and once processed its play button plays the video in place with the browser's controls; a picture that won't load falls back to a placeholder. Text is always rendered as plain React text, never as HTML.
- Uploading several files at once keeps the order they were picked in, whichever finishes uploading first.

**Built in P1-F4** (`features/composer/validation.ts`, `use-validation.ts`, `issue-wording.ts`):
- Quick checks on every change, from the networks' own rules: no accounts chosen, a link that isn't a web address, text over a network's limit (counted as networks count), too many files, media a network requires. Instagram reels and stories have their own limits, so those are left to the server.
- The server's full check (`POST /posts/validate`) once typing pauses for 500 ms; a link that isn't a web address is reported at once and not sent. The last answer stays on screen while the next is on its way. For the quick checks' own codes the instant result always wins (the server's copy may be a keystroke old); the server adds everything else. Content issues show once per network; account issues (disconnected, needs reconnecting, paused) name the account.
- Issues panel under the editor ("Before you publish"), shown once there's something to check and then kept: errors (they block that network) before warnings, each worded from its code and details (network, account, file, limits, sizes, ratios like 4:5, durations), with the server's wording for codes the composer doesn't know. "Checking…" while the server looks; if it can't be reached, the quick checks stay and a note says so. "Ready to publish" when nothing's left.
- An issue jumps to what needs fixing: the tab that holds it (a network's own text or media, or its options), then the field (text, media, link, first comment, the account picker). Editor tabs of networks with an error carry a red mark (read out as "has problems to fix"), and the text box is marked invalid when its text breaks a rule. Read-only posts aren't checked.

- The server check also follows the attached files: when one finishes processing (the composer re-reads a processing file every 3 s), the check runs again without any edit, so "still being processed" clears on its own (found by P1-Q1).

**Built in P1-F5** (`use-save.ts`, `components/composer-footer.tsx`):
- One route, `/w/:slug/compose/{-$postId}`: saving a new post puts its id in the address without leaving the composer (same screen, focus and typing). Opening another post, or "New post" again, starts a fresh composer.
- Save draft: the first save creates the draft (`POST /posts`), later ones update it (`PATCH`, the whole content and targets). Saves run one at a time; whatever is typed while one is under way stays "Unsaved changes" and goes in the next. The footer says where it stands: Saving…, Saved at 14:05, Unsaved changes, or "Didn't save." with the reason and "Try saving again".
- Autosave: at most 10 s after the first unsaved change (the timer isn't reset by typing, so steady typing is still saved every 10 s); an empty new post isn't created.
- Publish now (people with `posts:publish`, when the workspace doesn't review every post): saves first if needed, then `POST /posts/:id/publish-now` with an `Idempotency-Key`. The key is kept for a retry after a dropped connection (the server then answers without publishing twice) and replaced after any real answer. Disabled while no account is chosen or a network has a problem, with the reason beside it. The server's refusals are explained (problems to fix, review required, already sent, no longer editable). After it starts, a toast says how many accounts it's going to and the post's page (`/w/:slug/posts/:postId`, [posts](posts.md)) replaces the composer, to follow each account's delivery. Opening a post that was sent shows it read-only, with a link to that page.
- People who can't publish, and workspaces that review every post, get Save draft and a line saying who sends it out; sending for review arrives with approvals (phase 4).
- Leaving with unsaved changes (in the app, or closing the tab) asks "Leave without saving?"; moving within the composer route (a new post getting its id) never asks.
- Labels (P1-F8): a "Labels" picker under the shared content ([posts](posts.md)), saved with the draft.

**Built in P2-F1** (`schedule.ts`, `components/schedule-dialog.tsx`, `use-save.ts`, `components/composer-footer.tsx`):
- Footer, for people with `posts:publish` in a workspace that doesn't review every post: **Save draft**, **Add to queue**, **Schedule**, **Publish now**. Like Publish now, the others need an account and no network with a problem, and save the post first when it has unsaved changes. After any of them, a toast says when it goes out and the post's page replaces the composer.
- **Schedule** opens a dialog with the design system's `DateTimePicker`: a month to pick the day from and a time field, both on the workspace's clock ("Times are in Lisbon time, this workspace's time zone"), starting an hour from now on the next quarter of an hour. Days before today and more than a year ahead are off. A sentence under it says what will happen ("Goes out Tue, 6 Oct 2026, 09:00", plus the reader's own time when their clock is on another timezone); a time less than 2 minutes away is refused there, before the server would (`SCHEDULE_TOO_SOON`). The instant is worked out with the same code the server uses (`zonedTime` in the contracts), so both apply one daylight-saving rule.
- **Repeat** (the recurrence picker, in the same dialog): Doesn't repeat, Daily, Weekly, Monthly; every 1–12 days, weeks or months; weekly on chosen weekdays (the picked day's weekday to start with; at least one stays on); monthly on the picked day's number (with a note that shorter months are skipped for 29–31) or the last day of the month; ends never, on a date (not before the start) or after 1–365 times. The sentence reads the rule back ("Every 2 weeks on Monday and Thursday at 09:00, 8 times"). The rule is sent in the workspace's timezone, starting on the picked day (`PUT /posts/:id/recurrence`).
- **Add to queue** is shown once a chosen account has posting times (`GET /accounts/:id/queue-slots` per chosen account). When another chosen account has none, it is disabled and names that account, since the server refuses the whole post (`NO_QUEUE_SLOTS`).
- **A scheduled post** opened in the composer says when it goes out, with **Unschedule** (back to a draft; what's being typed stays, unsaved). The footer becomes **Save changes** (the main action), **Reschedule** (the dialog starts from the post's time; when its accounts were moved to different times on the calendar, it says they all move to one) and Publish now. A copy made by a repeating post says so, and is offered no Repeat.
- **A post that repeats** says how and when next, with **Stop repeating** (asks first: copies that haven't gone out are removed). The footer is Save changes and **Change repeat** (the dialog starts from its rule); Publish now and Add to queue aren't offered, as the server refuses them (`POST_IS_RECURRING`).
- Moving between the two takes two requests, in the order the server asks for: scheduling a repeating post once stops the repeat first; making a scheduled post repeat unschedules it first. If the second is refused, the post is re-read so the screen shows where the server left it.
- **No autosave on a scheduled or repeating post**: what is saved there goes out (and on a repeating post replaces its waiting copies), so it is saved when the person presses Save changes. Leaving with unsaved changes still asks.
- The server's refusals are explained in plain words (too soon, too far, no free posting time, already sent, repeats, a copy can't repeat, review required, no dates left).
- Not yet: per-account times (the calendar's drag-and-drop moves one account, P2-F2), and editing posting times (P2-F3).

- Since P2-F3, `?account=<id>` (a queue slot's "Write a post") starts a new post with that account chosen, when it can post.

## AI panel (phase 4)
"Generate" opens [ai-studio](ai-studio.md) as a side panel: generate a caption into the editor, or an image/video into the media strip. Generated text is always editable. Results follow the studio's show → apply → undo pattern: options are proposed (a caption as a change against the current text), nothing enters the post until "Use this", and every applied change can be undone.

## Behavior
- Autosave draft every 10 s while editing (debounced); "Saved" indicator.
- Leaving with unsaved changes asks to confirm.
- Editing an approved post warns that it will go back to review (if the user can't approve).
