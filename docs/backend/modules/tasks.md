# Module: tasks

**Phase:** 4 · **Path:** `packages/core/src/modules/tasks` · **Depends on:** workspaces, posts, notifications

## Purpose
Simple work assignments inside a workspace, usually tied to a post ("write copy for launch", "fix image"). Covers 5.0's task feature.

## Data
| Table | Key fields | Notes |
| --- | --- | --- |
| `Task` | id, workspaceId, title, description, postId?, assigneeId?, createdById, dueAt?, status (open/in_progress/done), completedAt? | |

## API
| Method | Path | Permission | Description |
| --- | --- | --- | --- |
| GET | `/api/v1/workspaces/:wid/tasks?assignee=me&status=&postId=` | `posts:read` | List tasks |
| POST | `/api/v1/workspaces/:wid/tasks` | `tasks:manage` | Create |
| PATCH | `/api/v1/workspaces/:wid/tasks/:tid` | `tasks:manage` or assignee | Update, change status |
| DELETE | `/api/v1/workspaces/:wid/tasks/:tid` | creator or admin | Delete |

## Rules
- The assignee must be a workspace member.
- Due-date reminder 24 hours before `dueAt` (via `notifications`).
- Emits `task.assigned`, `task.completed`.
