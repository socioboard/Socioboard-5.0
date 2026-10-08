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

## Errors (API)
| Code | Status | When |
| --- | --- | --- |
| `NOT_POST_AUTHOR` | 403 | Submitting or withdrawing someone else's post |
| `POST_IN_REVIEW` / `POST_NOT_DRAFT` | 409 | Submitting a post already in review / not a draft (approved, scheduled, sent) |
| `POST_NOT_IN_REVIEW` | 409 | Approving, requesting changes on or withdrawing a post that isn't waiting for review (another reviewer acted first) |
| `CANNOT_APPROVE_OWN` | 403 | Approving your own post when the workspace reviews every post |
| `NO_ACCOUNTS`, `POST_HAS_ERRORS` | 422 | Submitting a post with no accounts, or with errors (`details` is the validation report) |
| `REVIEW_REQUIRED` | 422 | Publishing, scheduling, queueing or repeating a post that needs review and isn't approved (posts module) |

## How it's built (P4-B2)
- `packages/core/src/modules/approvals`: each step locks the post row (`SELECT … FOR UPDATE`), checks the status is still the one expected, moves it and records the `PostApproval` step, so two reviewers can't both act on one submission.
- The gate is the posts module's `assertReviewed`: a post needs review when the workspace has `requireReviewForAll` or its author can't publish (a contributor, or someone no longer a member); it may then go out only if its latest step is `approved`. Publish-now, schedule, queue and repeat call it.
- "Approve & schedule" approves, then schedules with the schedule body; if scheduling fails (a time in the past), the approval stands and the error says why.
- An approved post that is unscheduled goes back to `approved`, not `draft` (`deriveStatus` falls back to where the review left it).
- The queue: `pending` is the posts in review, the longest-waiting first (by their last submission); `decided` is the approval and changes-requested steps, newest first. Both leave out posts a member limited to some accounts may not see.

## Rules
- **Who needs review:** Contributors always; everyone when the workspace has `requireReviewForAll`.
- **Editing resets approval:** changing content or targets of an `approved` or `scheduled` post returns it to `in_review` (and unschedules it, in the same transaction as the edit, with a `submitted` step and `post.submitted` with `afterEdit`) unless the editor has `posts:approve`. Changing only labels doesn't.
- Authors can't approve their own posts when `requireReviewForAll` is on.
- Approval checks member account access: a reviewer must have access to every target account.
- Emits `post.submitted`, `post.approved`, `post.changes_requested`, `post.withdrawn` (audited; notifications with P4-B3 and P4-B11) and `post.commented` (P4-B3).
