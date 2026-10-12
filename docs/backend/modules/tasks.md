# Module: tasks

**Phase:** 4 · **Path:** `packages/core/src/modules/tasks` · **Depends on:** workspaces, posts, notifications

## Purpose
Simple work assignments inside a workspace, usually tied to a post ("write copy for launch", "fix image"). Covers 5.0's task feature.

## Data
| Table | Key fields | Notes |
| --- | --- | --- |
| `Task` | id, workspaceId, title, description, postId?, assigneeId? (a user), createdById?, dueAt?, status (open/in_progress/done), completedAt?, reminderSentAt? | `postId` has no foreign key (a deleted post shows as gone); `reminderSentAt` makes the due reminder go out once |

## API
| Method | Path | Permission | Description |
| --- | --- | --- | --- |
| GET | `/api/v1/workspaces/:wid/tasks?assignee=me&status=&postId=` | `posts:read` | List tasks |
| POST | `/api/v1/workspaces/:wid/tasks` | `tasks:manage` | Create |
| PATCH | `/api/v1/workspaces/:wid/tasks/:tid` | `tasks:manage`, or the assignee for `status` only | Update, change status |
| DELETE | `/api/v1/workspaces/:wid/tasks/:tid` | creator or `members:manage` | Delete |

## Errors (API)
| Code | Status | When |
| --- | --- | --- |
| `TASK_NOT_FOUND` | 404 | A task that's gone, in another workspace, or about a post the member can't see |
| `ASSIGNEE_NOT_MEMBER` | 422 | Giving a task to someone who isn't a member |
| `ASSIGNEE_CANNOT_SEE_POST` | 422 | Giving a task about a post to a member limited to other accounts |
| `TASK_STATUS_ONLY` | 403 | Without `tasks:manage`: changing anything but the status, or another person's task |
| `NOT_TASK_CREATOR` | 403 | Deleting a task you didn't make, without `members:manage` |
| `POST_NOT_FOUND` | 404 | A post you can't see, given as `postId` |
| `INVALID_CURSOR` | 400 | A page cursor that isn't one the list gave |

## How it's built (P4-B5)
- `packages/core/src/modules/tasks`: the service, routes, events and the `task-reminders` job.
- **Who sees what:** everyone who reads posts sees the workspace's tasks, except tasks about a post they can't see (a member limited to some accounts, P4-B4): hidden from their list, 404 for anything else. A task about a deleted post stays, its `post` marked `gone`.
- **Who changes what:** `tasks:manage` (contributors and up) creates and edits; the assignee, whatever their role (a viewer too), moves their own task between statuses; its creator, or `members:manage`, deletes it. Done stamps `completedAt`, reopening clears it.
- **The list:** not done first, by due date with undated ones last, then done, the latest first. Pages are counted (`cursor` is an offset), since that order has no single key. Filters: `assignee` (`me` or a user id), `status` (any of them), `postId`.
- **Reminders:** the `task-reminders` job runs every 15 minutes: a task not done, with an assignee, due within 24 hours and not reminded yet gets `reminderSentAt` (claimed first, so two runs never send one twice) and `task.due`. A new due date clears `reminderSentAt`, so it reminds again.
- Every change sends `task.changed` (task id) to the workspace's room; open task lists refetch.
- Audited: `task.created`, `task.updated` (fields), `task.deleted`.

## Rules
- The assignee must be a workspace member, and for a task about a post, able to see it.
- Due-date reminder 24 hours before `dueAt` (via `notifications`), once per due date.
- Emits `task.created`, `task.updated`, `task.deleted`, `task.assigned` (on create or a new assignee), `task.completed`, `task.due`.
- Notifications ([notifications](notifications.md)): `task_assigned` to the assignee (email too), `task_completed` to its creator when someone else finishes it (in the app), `task_due` to the assignee (email too); only if they're still a member and can see the post. Their English text (the email's) leaves the task's title out; the app shows it.
