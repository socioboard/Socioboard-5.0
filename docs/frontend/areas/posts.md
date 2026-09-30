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
- **Detail:** status, author and created time; each account's delivery as a card (`TargetCard`): its status, the published time and "View on Facebook/Instagram" link, or for a failure the reason in plain words by kind (sign-in, content, rate limit, unreachable) with what the network said, then the fixes: **Retry** (`posts:publish`), **Reconnect account** (sign-in failures, or a disconnected or expired account; opens the account's details, which has Reconnect) and **Edit post** (content refusals, while the post can still change). Each card's publishing history is a timeline of attempts, oldest first, open when the delivery failed. The content panel shows the shared content (text, files, link, first comment), then each network's own version. Actions: Edit and Delete (author or approver, while nothing is published or publishing), Duplicate (opens the copy in the composer).
- **Live status:** until the socket arrives (P2-F5), the list and the page re-ask every 3 s while a post on screen is being sent.
- Not yet: the sidebar's Failed count badge (with live updates, P2-F5), bulk actions and filters (phase 2), labels (P1-F8), comments, approval history and tasks (phase 4).

## Behavior
- Live status: socket `post.status_changed` refreshes rows while publishing.
- Failed tab shows a count badge in the sidebar; each failure links straight to the fix (edit content or reconnect account).
- Bulk actions: delete drafts, duplicate.
- Labels: filter by label; manage the workspace's label list (name + color).
