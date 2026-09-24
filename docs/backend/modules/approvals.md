# Module: approvals

**Phase:** 4 · **Path:** `packages/core/src/modules/approvals` · **Depends on:** posts, workspaces, notifications, audit

## Purpose
The review workflow (draft → in review → approved, or changes requested) and discussion threads on posts. This replaces 5.0's workspace chat.

## Data
| Table | Key fields | Notes |
| --- | --- | --- |
| `PostApproval` | id, postId, reviewerId, decision (approved/changes_requested), note, createdAt | Full history kept |
| `PostComment` | id, postId, authorId, body, parentId?, mentions[], editedAt?, deletedAt? | Threaded one level; @mentions notify |

## API
| Method | Path | Permission | Description |
| --- | --- | --- | --- |
| POST | `/api/v1/workspaces/:wid/posts/:pid/submit` | `posts:create` (author) | Send for review |
| POST | `/api/v1/workspaces/:wid/posts/:pid/approve` | `posts:approve` | Approve (optionally schedule in the same call) |
| POST | `/api/v1/workspaces/:wid/posts/:pid/request-changes` | `posts:approve` | Back to draft with a note |
| POST | `/api/v1/workspaces/:wid/posts/:pid/withdraw` | author | Pull back from review |
| GET | `/api/v1/workspaces/:wid/approvals?status=pending` | `posts:approve` | Review queue |
| GET | `/api/v1/workspaces/:wid/posts/:pid/comments` | `posts:read` | Comments |
| POST | `/api/v1/workspaces/:wid/posts/:pid/comments` | `posts:read` | Add a comment (Viewers can comment) |
| PATCH/DELETE | `/api/v1/workspaces/:wid/comments/:cid` | comment author | Edit/delete own comment |

## Rules
- **Who needs review:** Contributors always; everyone when the workspace has `requireReviewForAll`.
- **Editing resets approval:** changing content or targets of an `approved` or `scheduled` post returns it to `in_review` (and unschedules it) unless the editor has `posts:approve`.
- Authors can't approve their own posts when `requireReviewForAll` is on.
- Approval checks member account access: a reviewer must have access to every target account.
- Emits `post.submitted`, `post.approved`, `post.changes_requested`, `post.commented` (notifications + audit).
