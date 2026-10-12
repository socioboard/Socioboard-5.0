import { taskRoutes as r } from '@socioboard/contracts';

import type { ApiRouter } from '../../platform';
import type { TaskService } from './service';

/** Mounts the task routes (contracts: taskRoutes). */
export function registerTaskRoutes(api: ApiRouter, tasks: TaskService) {
  api.route(r.listTasks, ({ auth, member, query }) => tasks.list(member, auth.user.id, query));
  api.route(r.createTask, ({ auth, member, body }) => tasks.create(auth, member, body));
  api.route(r.updateTask, ({ auth, member, params, body }) =>
    tasks.update(auth, member, params.taskId, body),
  );
  api.route(r.deleteTask, ({ auth, member, params }) => tasks.remove(auth, member, params.taskId));
}
