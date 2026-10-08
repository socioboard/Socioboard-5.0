# Module: approvals

**Phase:** 4 · **Path:** `packages/core/src/modules/approvals` · **Depends on:** posts, workspaces, notifications, audit

## Purpose
The review workflow (draft → in review → approved, or changes requested) and discussion threads on posts. This replaces 5.0's workspace chat.

## Data
| Table | Key fields | Notes |
| --- | --- | --- |
| `PostApproval` | id, workspaceId, postId, actorId?, action (submitted/approved/changes_requested/withdrawn), note?, createdAt | Every review step, so the full history is kept; the post's status says where it is now |
| `PostComment` | id, workspaceId, postId, parentId?, authorId?, body, mentionedUserIds[], editedAt?, deletedAt?, createdAt | Threaded one level; @mentions notify; a deleted comment with replies stays as "Comment deleted" |

## API
| Method | Path | Permission | Description |
| --- | --- | --- | --- |
| POST | `/api/v1/workspaces/:wid/posts/:pid/submit` | `posts:create` (author) | Send for review, with an optional note |
| POST | `/api/v1/workspaces/:wid/posts/:pid/approve` | `posts:approve` | Approve; `schedule` (the schedule body) schedules in the same call |
| POST | `/api/v1/workspaces/:wid/posts/:pid/request-changes` | `posts:approve` | Back to draft with a note (required) |
| POST | `/api/v1/workspaces/:wid/posts/:pid/withdraw` | author | Pull back from review |
| GET | `/api/v1/workspaces/:wid/posts/:pid/review` | `posts:read` | The post's review history |
| GET | `/api/v1/workspaces/:wid/reviews?status=pending\|decided` | `posts:approve` | Review queue: waiting (oldest first) or decided (newest first) |
| GET | `/api/v1/workspaces/:wid/posts/:pid/comments` | `posts:read` | Comments |
| POST | `/api/v1/workspaces/:wid/posts/:pid/comments` | `posts:read` | Add a comment or a reply (`parentId`), with `mentionIds` (user ids of members). Viewers can comment |
| PATCH/DELETE | `/api/v1/workspaces/:wid/comments/:cid` | comment author | Edit/delete own comment |

## Rules
- **Who needs review:** Contributors always; everyone when the workspace has `requireReviewForAll`.
- **Editing resets approval:** changing content or targets of an `approved` or `scheduled` post returns it to `in_review` (and unschedules it) unless the editor has `posts:approve`.
- Authors can't approve their own posts when `requireReviewForAll` is on.
- Approval checks member account access: a reviewer must have access to every target account.
- Emits `post.submitted`, `post.approved`, `post.changes_requested`, `post.commented` (notifications + audit).
