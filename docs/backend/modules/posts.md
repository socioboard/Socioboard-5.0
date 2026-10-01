# Module: posts

**Phase:** 1 (create, validate, publish now), 2 (schedule hooks), 4 (approval hooks) · **Path:** `packages/core/src/modules/posts` · **Depends on:** providers, social-accounts, media, workspaces, shortlinks (3), audit

## Purpose
The content users write once and send to many accounts. A **Post** holds the shared content; each **PostTarget** is its delivery to one social account, with optional per-network overrides. This module owns creating, editing, validating and listing posts. Sending is done by [publishing](publishing.md); timing by [scheduling](scheduling.md); review by [approvals](approvals.md).

## Data
| Table | Key fields | Notes |
| --- | --- | --- |
| `Post` | id, workspaceId, authorId, status, text, mediaIds[], link?, labelIds[], firstComment?, recurringRuleId?, occurrenceAt?, createdAt, updatedAt | status is derived from targets (see below). `recurringRuleId` + `occurrenceAt` (unique together) mark a recurring rule's occurrence post ([scheduling](scheduling.md)); no foreign key, so sent occurrences keep the link after the rule or its template goes |
| `PostLabel` | id, workspaceId, name, color, createdAt | Workspace label list for organizing and filtering posts. `color` is a name (gray, red, orange, amber, green, teal, blue, indigo, violet, pink), not a hex value: the UI maps it to a shade that reads in light and dark. Names are unique per workspace, ignoring case |
| `PostTarget` | id, workspaceId, postId, socialAccountId, override JSON (text, mediaIds, options), scheduledAt?, scheduleVersion, status, externalPostId?, permalink?, attempts, lastError JSON?, publishedAt? | One per selected account |

**Post status:** `draft` → `in_review` → `approved` → `scheduled` → `publishing` → `published` / `partial` / `failed`. Target status: `pending`, `scheduled`, `publishing`, `published`, `failed`, `cancelled`.

`override.options` holds network-specific settings under the network's key, e.g. `{ instagram: { format: 'reel' } }` (Instagram feed/reel/story; a feed post with 2–10 files is a carousel). Phase 3 adds Pinterest board, YouTube title/privacy, TikTok privacy level and toggles. Keys for another network than the target account's are rejected.

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
| GET | `/api/v1/workspaces/:wid/labels` | `posts:read` | Workspace labels by name, each with its `postCount` |
| POST | `/api/v1/workspaces/:wid/labels` | `posts:approve` | Add a label (`name`, `color`) |
| PATCH | `/api/v1/workspaces/:wid/labels/:lid` | `posts:approve` | Rename or recolour |
| DELETE | `/api/v1/workspaces/:wid/labels/:lid` | `posts:approve` | Delete; removed from every post that carried it |

## Services
- `createDraft`, `updatePost`, `deletePost`, `duplicatePost`
- `validate(post)`: runs each target's adapter `validate()` on the merged content (base + override); returns issues per target. Used by the composer on every edit (debounced) and enforced on save.
- `resolveContent(target)`: base content + override → final text/media for a network.
- `publishNow(postId)`: checks permissions and approval state, then hands targets to publishing.
- `recomputeStatus(postId)`: derives the post status from its targets (cancelled targets don't count): any target `publishing`, or some done while others still wait → `publishing`; all done → `published`, `failed`, or `partial` for a mix; every remaining target `scheduled` → `scheduled`; nothing sent yet → the editorial status it had (`draft`, `in_review`, `approved`). It runs after edits and when accounts are disconnected (`account.disconnected`).

## Validation issues
`validate` returns issues per target: ours first, then the network adapter's (providers `IssueCode`: `TEXT_TOO_LONG`, `MEDIA_REQUIRED`, `ASPECT_RATIO`, `LINK_NOT_CLICKABLE`…). Ours: `NO_ACCOUNTS` (post level), `ACCOUNT_NOT_AVAILABLE` (disconnected), `ACCOUNT_NEEDS_RECONNECT`, `ACCOUNT_PAUSED`, `NETWORK_NOT_ENABLED`, `OPTIONS_NOT_FOR_NETWORK`, `MEDIA_NOT_FOUND`, `MEDIA_NOT_READY` (still processing), `MEDIA_FAILED`. Errors block publishing to that network; warnings don't.

## Errors (API)
| Code | Status | When |
| --- | --- | --- |
| `POST_NOT_FOUND`, `ACCOUNT_NOT_FOUND`, `MEDIA_NOT_FOUND` | 404 | Not in this workspace (a body naming another workspace's account or file gets the same 404) |
| `NOT_POST_AUTHOR` | 403 | Changing someone else's post without `posts:approve` |
| `ACCOUNT_NOT_AVAILABLE` | 422 | Adding a disconnected account (one already on the post may stay) |
| `OPTIONS_NOT_FOR_NETWORK` | 422 | `override.options` for another network than the account's |
| `POST_NOT_EDITABLE`, `POST_NOT_DELETABLE` | 422 | A target is publishing or published: the post stays as history |
| `LABEL_NOT_FOUND` | 404 | A label id that isn't this workspace's (in a post body or the path) |
| `LABEL_EXISTS` | 409 | A label name already used in the workspace, whatever its case |
| `POST_HAS_ERRORS` | 422 | Publish-now or retry with validation errors; `details` is the validation report |
| `REVIEW_REQUIRED` | 422 | The workspace reviews every post (approvals arrive in phase 4) |
| `POST_ALREADY_SENT` | 409 | Publish-now on a post whose targets aren't all waiting (retry the failed ones instead) |
| `TARGET_NOT_FOUND` / `TARGET_NOT_FAILED` | 404 / 409 | Retry of a target that isn't on the post / isn't failed |

## Rules
- Only the author (or `posts:approve` roles) can edit or delete a post; once any target is `publishing` or `published`, the post can't be edited or deleted. Edit, delete and publish-now lock the post row (`SELECT … FOR UPDATE`) and check again under the lock, so an edit can't land while a publish starts.
- Labels: posts keep label ids in `labelIds` (at most 20). Labels stay editable after publishing (an update with only `labelIds` isn't locked), since they organise the posts list. Deleting a label removes its id from every post in the same transaction. Saving a post checks its labels under a share lock (`FOR SHARE`) taken before the post's own lock, and deleting a label deletes its row before stripping posts, so a label deleted while a post is being saved with it never stays on that post. `GET /labels` returns each label's `postCount`.
- Updating `targets` replaces the selection: removed accounts' targets go, new ones join as `pending`, kept ones keep their id and history and take the new override.
- Duplicating copies content and overrides as a new draft by the caller, leaving out disconnected accounts and deleted files.
- `pnpm db:seed` adds a sample Facebook login with two **paused** sample accounts (fake tokens), a draft and a post scheduled for the next day.
- A post needs approval before scheduling or publishing if the author lacks `posts:publish` **or** the workspace has `requireReviewForAll`.
- Members only see and target accounts they have access to.
- Media must be `ready`; AI assets must have finished generating.
- Emits `post.created`, `post.updated`, `post.deleted`.
