import { z } from 'zod';

import { Id, IsoDateTime, page, PageQuery } from './common';
import { defineRoute } from './route';

// Tasks: work assignments in a workspace, often about a post (P4-C1, docs/backend/modules/tasks.md).

const Person = z.object({ id: Id, name: z.string(), avatarUrl: z.url().nullable() });

export const TaskStatus = z.enum(['open', 'in_progress', 'done']);
export type TaskStatus = z.infer<typeof TaskStatus>;

export const TASK_TITLE_MAX = 200;
export const TASK_DESCRIPTION_MAX = 5_000;

export const Task = z.object({
  id: Id,
  title: z.string(),
  description: z.string(),
  status: TaskStatus,
  /** The post it is about, with the start of its text to show; null when not about a post. */
  post: z.object({ id: Id, excerpt: z.string() }).nullable(),
  assignee: Person.nullable(),
  createdBy: Person.nullable(),
  dueAt: IsoDateTime.nullable(),
  completedAt: IsoDateTime.nullable(),
  createdAt: IsoDateTime,
  updatedAt: IsoDateTime,
});
export type Task = z.infer<typeof Task>;

const Title = z.string().trim().min(1).max(TASK_TITLE_MAX);
const Description = z.string().trim().max(TASK_DESCRIPTION_MAX);

export const CreateTaskBody = z.object({
  title: Title,
  description: Description.default(''),
  postId: Id.optional(),
  /** A user id; must be a member of the workspace. */
  assigneeId: Id.optional(),
  dueAt: IsoDateTime.optional(),
});
export type CreateTaskBody = z.infer<typeof CreateTaskBody>;

/** An assignee can change only `status`; `tasks:manage` can change everything. Null clears. */
export const UpdateTaskBody = z
  .object({
    title: Title,
    description: Description,
    status: TaskStatus,
    postId: Id.nullable(),
    assigneeId: Id.nullable(),
    dueAt: IsoDateTime.nullable(),
  })
  .partial()
  .refine((b) => Object.keys(b).length > 0, 'Nothing to update');
export type UpdateTaskBody = z.infer<typeof UpdateTaskBody>;

export const ListTasksQuery = PageQuery.extend({
  /** `me`, or a user id. */
  assignee: z.union([z.literal('me'), Id]).optional(),
  status: z
    .union([TaskStatus, z.array(TaskStatus)])
    .transform((s) => (Array.isArray(s) ? s : [s]))
    .optional(),
  postId: Id.optional(),
});

const workspaceParams = z.object({ workspaceId: Id });
const taskParams = workspaceParams.extend({ taskId: Id });

export const taskRoutes = {
  listTasks: defineRoute({
    method: 'GET',
    path: '/api/v1/workspaces/:workspaceId/tasks',
    access: 'posts:read',
    summary: 'Tasks, open ones first by due date (filter by assignee, status, post)',
    params: workspaceParams,
    query: ListTasksQuery,
    responses: { 200: page(Task) },
  }),
  createTask: defineRoute({
    method: 'POST',
    path: '/api/v1/workspaces/:workspaceId/tasks',
    access: 'tasks:manage',
    summary: 'Create a task; its assignee is notified',
    params: workspaceParams,
    body: CreateTaskBody,
    responses: { 201: Task },
  }),
  updateTask: defineRoute({
    method: 'PATCH',
    path: '/api/v1/workspaces/:workspaceId/tasks/:taskId',
    // `tasks:manage`, or its assignee changing the status: checked in the service.
    access: 'member',
    summary: 'Edit a task or change its status',
    params: taskParams,
    body: UpdateTaskBody,
    responses: { 200: Task },
  }),
  deleteTask: defineRoute({
    method: 'DELETE',
    path: '/api/v1/workspaces/:workspaceId/tasks/:taskId',
    // Its creator, or `members:manage`: checked in the service.
    access: 'member',
    summary: 'Delete a task',
    params: taskParams,
    responses: { 204: null },
  }),
};
