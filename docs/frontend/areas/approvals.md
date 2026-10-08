# Area: approvals

**Phase:** 4 · **Folder:** `features/approvals` · **Backend:** [approvals](../../backend/modules/approvals.md), [posts](../../backend/modules/posts.md)

## Screens
| Route | Screen | Permission |
| --- | --- | --- |
| `/w/:slug/approvals` | Review queue: posts waiting for review, oldest first; author, accounts, requested time | `posts:approve` |
| `/w/:slug/approvals` (Contributor view) | "My submissions": waiting, approved, changes requested | author |
| (panel) | Review panel: full live previews per network, comments thread, **Approve**, **Approve & schedule**, **Request changes** (note required) | `posts:approve` |

## Comments
Shown on the review panel and on post detail. Threaded one level; @mention members (autocomplete); edit/delete own comments. Viewers can comment.

## API calls
`GET /reviews?status=pending|decided` (the queue, `posts:approve`), `GET /posts?status=in_review,approved&authorId=<me>` (a contributor's "My submissions"), `GET /posts/:id/review` (history), `POST /posts/:id/approve | request-changes | submit | withdraw`, comments CRUD.

## Behavior
- Sidebar badge shows pending count (updated via socket).
- Keyboard: J/K to move between posts, A to approve, R to request changes.
- After "Request changes", the author gets a notification linking back to the composer with the note shown at the top.
