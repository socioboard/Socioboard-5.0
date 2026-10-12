import { defineQueue, type Logger } from '../../platform';
import type { TaskService } from './service';

/** `task-reminders`: every 15 minutes, tasks due within a day remind their assignee, once. */
export const taskReminderQueue = (deps: {
  tasks: Pick<TaskService, 'remindDue'>;
  logger: Logger;
}) =>
  defineQueue<Record<string, never>, number>(
    'task-reminders',
    async () => {
      const sent = await deps.tasks.remindDue();
      if (sent > 0) deps.logger.info({ sent }, 'task reminders sent');
      return sent;
    },
    { worker: { concurrency: 1 } },
  );
