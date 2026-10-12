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

**Built in P4-F3** (`features/comments`, `PostComments`, on the design system's `CommentThread` and `MentionInput`): under the review panel's actions, and in a card under the deliveries on the post's page. Comments oldest first, replies indented under theirs (a reply's **Reply** goes to the same thread); each with its author's avatar, name, how long ago, and "edited". Your own have a menu with **Edit** (in place) and **Delete** (asks first; one with replies stays as "Comment deleted"). Typing "@" lists the members who can see the post (`GET …/mentionable`), matched by the start of their names; arrows and Enter or Tab pick, and the name goes in as "@Name", marked in the posted comment. Ctrl/⌘+Enter sends. A refused comment shows why and keeps the text. Others' comments arrive live (`post.comments_changed`). A notification's link (`/w/:slug/posts/:id?comment=<id>`) scrolls to its comment and marks it.

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
- Notifications (P4-B3): approvers hear of a post sent for review, the author of an approval or a request for changes; the bell words them from who acted.
- Not yet: keyboard shortcuts (J/K, A, R), the review emails' own designs (P4-B11).
