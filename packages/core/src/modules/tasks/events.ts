/** Events the tasks module emits (audit; notifications for assigned, completed and due). */
export interface TaskEvents extends Record<string, unknown> {
  'task.created': { workspaceId: string; taskId: string; userId: string; title: string };
  'task.updated': { workspaceId: string; taskId: string; userId: string; fields: string[] };
  'task.deleted': { workspaceId: string; taskId: string; userId: string; title: string };
  /** Given to someone (on create, or a new assignee); `userId` is who assigned it. */
  'task.assigned': { workspaceId: string; taskId: string; userId: string; assigneeId: string };
  /** Set to done; `createdById` is who made the task (they hear of it). */
  'task.completed': {
    workspaceId: string;
    taskId: string;
    userId: string;
    createdById: string | null;
  };
  /** Due within a day, sent once by the `task-reminders` job. */
  'task.due': { workspaceId: string; taskId: string; assigneeId: string; dueAt: string };
}
