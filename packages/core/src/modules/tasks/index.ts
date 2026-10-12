// Public surface of the tasks module (docs/backend/modules/tasks.md).
export type { TaskEvents } from './events';
export { taskReminderQueue } from './jobs';
export { registerTaskRoutes } from './routes';
export {
  createTaskService,
  TASK_REMINDER_BEFORE_MS,
  type TaskService,
  type TaskServiceDeps,
} from './service';
