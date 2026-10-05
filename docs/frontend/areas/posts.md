# Area: posts

**Phase:** 1 (list, detail, history), 2 (retry, filters), 4 (tasks, comments tab) · **Folder:** `features/posts`, `features/tasks` · **Backend:** [posts](../../backend/modules/posts.md), [publishing](../../backend/modules/publishing.md), [approvals](../../backend/modules/approvals.md), [tasks](../../backend/modules/tasks.md)

## Screens
| Route | Screen | Permission |
| --- | --- | --- |
| `/w/:slug/posts` | Posts table: content snippet, accounts (avatars), status chip, scheduled/published time, author. Tabs: Drafts, Scheduled, Published, Failed | `posts:read` |
| `/w/:slug/posts/:postId` | Post detail: content, per-account targets with status, permalinks, publishing history (attempts + network error messages), comments, approval history, tasks | `posts:read` |
| `/w/:slug/tasks` | My tasks / all tasks: title, linked post, assignee, due date, status | `posts:read` |

## Components
- `StatusChip`: draft, in review, approved, scheduled, publishing, published, partial, failed; consistent colors across the app.
- `TargetRow`: account, status, published link, error with a plain-language explanation + "Retry" / "Reconnect account" actions.
- `HistoryTimeline`: created → submitted → approved → scheduled → attempts → published/failed.

## API calls
`GET /posts` (filters, cursor pagination), `GET /posts/:id`, `POST /posts/:id/duplicate`, `DELETE /posts/:id`, `POST /posts/:id/targets/:tid/retry`, tasks CRUD.

**Built in P1-F6** (`features/posts`, routes `/w/:slug/posts` and `/w/:slug/posts/:postId`, "Posts" in the sidebar after Calendar):
- **List:** tabs All, Drafts (draft, in review, approved), Scheduled, Published (publishing, published) and Failed (failed and partly published: something on it still needs fixing), kept in the address as `?tab=`. Columns: the text's first two lines and file count, accounts (avatars with the network's mark, names on hover), status, when (published, scheduled for, or created) and author; narrow screens keep the post and its status, with the time under the text. A row opens the post. 25 per page with "Load more"; each tab has its own empty state.
- **Detail:** status, author and created time; each account's delivery as a card (`TargetCard`): its status, the published time and "View on Facebook/Instagram" link, or for a failure the reason in plain words by kind (sign-in, content, rate limit, unreachable) with what the network said, then the fixes (the network's own words are quoted only when it sent them, with its error code: a timeout or an unreadable answer isn't presented as Facebook's): **Retry** (`posts:publish`), **Reconnect account** (sign-in failures, or a disconnected or expired account; opens the account's details, which has Reconnect) and **Edit post** (content refusals, while the post can still change). Each card's publishing history is a timeline of attempts, oldest first, open when the delivery failed. The content panel shows the shared content (text, files, link, first comment), then each network's own version. Actions: Edit and Delete (author or approver, while nothing is published or publishing), Duplicate (opens the copy in the composer).
- **Live status:** since P2-F5, `post.status_changed` shows a post's new statuses on its page at once and refreshes the lists; while a post on screen is being sent, the screens still look every 15 s (attempts that don't change a status), or every 3 s while the socket is down.
- **Failed count:** the sidebar's Posts link carries how many posts need fixing (failed or partly published, up to "50+"; a dot when the sidebar is collapsed and on the phone tab), refreshed by every live change.
- Not yet: bulk actions and the other filters (phase 2), comments, approval history and tasks (phase 4).

**Built in P2-F1** (with the composer's scheduling):
- **Times on the workspace's clock:** when a post is due, went out or was created, and each attempt's time, are shown in the workspace's timezone (`WorkspaceTime` in `lib/workspace-time.tsx`); hovering shows the reader's own time when their clock is on another timezone.
- **Repeating posts:** the list marks the post that repeats ("Repeats") and the copies it made ("From a repeating post"), from the post's `recurring`. The page of a post that repeats says how ("Every week on Friday at 09:00, Lisbon time"), when next, and that each date gets its own copy; a copy's page says it is one. Changing or stopping the repeat is done in the composer (Edit).

**Built in P1-F8** (labels; `features/posts/labels.ts`, `LabelPicker`, `ManageLabelsDialog`):
- **List:** each row shows its labels under the text. A label filter ("All labels" or one label, `?label=`) sits in the header once the workspace has labels; it's kept when switching tabs, and a filtered empty list offers "Show all labels". **Manage labels** (`posts:approve`) opens the workspace's list: add one (colours are offered in turn), rename in place (Enter or leaving the field saves, Escape undoes), recolour from a menu of the ten colours, delete with a confirmation that says how many posts carry it. A name already in use is explained.
- **Picker** (`LabelPicker`): the chosen labels as removable chips and a "Label" button opening a searchable list of checkboxes; people with `posts:approve` can create a label by typing a new name. At most 20 per post.
- **Composer:** "Labels" under the shared content, saved with the draft (`labelIds`); a label change doesn't re-run the networks' checks.
- **Post page:** the labels next to the author, saved as soon as they change, also on a post that went out (the API allows label-only edits then). The author (or an approver) can change them; viewers see them.

## Behavior
- Live status: socket `post.status_changed` refreshes rows while publishing.
- Failed tab shows a count badge in the sidebar; each failure links straight to the fix (edit content or reconnect account).
- Bulk actions: delete drafts, duplicate.
- Labels: filter by label; manage the workspace's label list (name + color).
