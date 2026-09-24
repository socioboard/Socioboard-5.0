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

## Behavior
- Live status: socket `post.status_changed` refreshes rows while publishing.
- Failed tab shows a count badge in the sidebar; each failure links straight to the fix (edit content or reconnect account).
- Bulk actions: delete drafts, duplicate.
- Labels: filter by label; manage the workspace's label list (name + color).
