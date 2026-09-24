# Module: posts

**Phase:** 1 (create, validate, publish now), 2 (schedule hooks), 4 (approval hooks) · **Path:** `packages/core/src/modules/posts` · **Depends on:** providers, social-accounts, media, workspaces, shortlinks (3), audit

## Purpose
The content users write once and send to many accounts. A **Post** holds the shared content; each **PostTarget** is its delivery to one social account, with optional per-network overrides. This module owns creating, editing, validating and listing posts. Sending is done by [publishing](publishing.md); timing by [scheduling](scheduling.md); review by [approvals](approvals.md).

## Data
| Table | Key fields | Notes |
| --- | --- | --- |
| `Post` | id, workspaceId, authorId, status, text, mediaIds[], link?, labelIds[], firstComment?, createdAt, updatedAt | status is derived from targets (see below) |
| `PostLabel` | id, workspaceId, name, color | Workspace label list for organizing and filtering posts |
| `PostTarget` | id, postId, socialAccountId, override JSON (text, mediaIds, options), scheduledAt?, scheduleVersion, status, externalPostId?, permalink?, attempts, lastError JSON?, publishedAt? | One per selected account |

**Post status:** `draft` → `in_review` → `approved` → `scheduled` → `publishing` → `published` / `partial` / `failed`. Target status: `pending`, `scheduled`, `publishing`, `published`, `failed`, `cancelled`.

`override.options` holds network-specific settings (Pinterest board, YouTube title/privacy, TikTok privacy level and toggles, Instagram post type).

## API
| Method | Path | Permission | Description |
| --- | --- | --- | --- |
| POST | `/api/v1/workspaces/:wid/posts` | `posts:create` | Create a draft with targets |
| GET | `/api/v1/workspaces/:wid/posts` | `posts:read` | List (filter: status, account, author, label, date range) |
| GET | `/api/v1/workspaces/:wid/posts/:pid` | `posts:read` | Post + targets + history |
| PATCH | `/api/v1/workspaces/:wid/posts/:pid` | `posts:update-own` / `posts:approve` | Edit content, targets, overrides (not once publishing) |
| DELETE | `/api/v1/workspaces/:wid/posts/:pid` | `posts:update-own` / `posts:approve` | Delete a draft, or cancel a scheduled post |
| POST | `/api/v1/workspaces/:wid/posts/validate` | `posts:create` | Validate content per target without saving (composer live checks) |
| POST | `/api/v1/workspaces/:wid/posts/:pid/publish-now` | `posts:publish` | Publish immediately (Idempotency-Key) |
| POST | `/api/v1/workspaces/:wid/posts/:pid/duplicate` | `posts:create` | Copy as new draft |
| POST | `/api/v1/workspaces/:wid/posts/:pid/targets/:tid/retry` | `posts:publish` | Retry a failed target |
| CRUD | `/api/v1/workspaces/:wid/labels` | read: `posts:read` · write: `posts:approve` | Workspace post labels |

## Services
- `createDraft`, `updatePost`, `deletePost`, `duplicatePost`
- `validate(post)`: runs each target's adapter `validate()` on the merged content (base + override); returns issues per target. Used by the composer on every edit (debounced) and enforced on save.
- `resolveContent(target)`: base content + override → final text/media for a network.
- `publishNow(postId)`: checks permissions and approval state, then hands targets to publishing.
- `recomputeStatus(postId)`: derives the post status from its targets.

## Rules
- Only the author (or `posts:approve` roles) can edit a post; nobody can edit a target that is `publishing` or `published`.
- A post needs approval before scheduling or publishing if the author lacks `posts:publish` **or** the workspace has `requireReviewForAll`.
- Members only see and target accounts they have access to.
- Media must be `ready`; AI assets must have finished generating.
- Emits `post.created`, `post.updated`, `post.deleted`.
