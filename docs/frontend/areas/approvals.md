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

**Built in P4-F2** (`features/approvals`, route `/w/:slug/approvals?tab=decided&post=<id>`):
- People who approve: **Waiting** (oldest first) and **Decided** tabs; a row opens the review panel (a right-hand panel, a bottom sheet on phones) with the post's live previews (the composer's `PreviewPanel`), the submitter's note, the review so far, and **Approve**, **Approve & schedule** (the composer's schedule dialog) or **Request changes** (a note is required). A post no longer waiting says so instead. "Open in the composer" for the full post.
- Everyone else who writes posts: **My submissions**, their posts in review, approved or scheduled; a row opens the composer.
- The sidebar's **Approvals** link counts posts waiting, for people who approve ("100+" past 100); review steps are status changes, so the count, the queue and open pages follow live.
- Not yet: comments on the review panel (P4-F3), keyboard shortcuts (J/K, A, R), the notification to the author (P4-B3/B11).
