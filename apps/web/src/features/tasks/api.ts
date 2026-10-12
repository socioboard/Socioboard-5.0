import { apiRoutes, type TaskStatus } from '@socioboard/contracts';
import { infiniteQueryOptions } from '@tanstack/react-query';

import { api } from '../../lib/api';

export interface TaskFilter {
  /** `me`: assigned to the reader. */
  assignee?: 'me' | undefined;
  status?: TaskStatus[] | undefined;
  postId?: string | undefined;
}

export const taskKeys = {
  /** Every task list in the workspace: a save or a live change refreshes them all. */
  all: (workspaceId: string) => ['workspaces', workspaceId, 'tasks'] as const,
  list: (workspaceId: string, filter: TaskFilter) =>
    ['workspaces', workspaceId, 'tasks', filter] as const,
};

/** Not done first, the soonest due first; done ones last, the latest first. */
export const tasksQuery = (workspaceId: string, filter: TaskFilter) =>
  infiniteQueryOptions({
    queryKey: taskKeys.list(workspaceId, filter),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam, signal }) =>
      api(apiRoutes.tasks.listTasks, {
        params: { workspaceId },
        query: {
          limit: 50,
          ...(filter.assignee ? { assignee: filter.assignee } : {}),
          ...(filter.status ? { status: filter.status } : {}),
          ...(filter.postId ? { postId: filter.postId } : {}),
          ...(pageParam ? { cursor: pageParam } : {}),
        },
        signal,
      }),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });

export const TODO: TaskStatus[] = ['open', 'in_progress'];
export const DONE: TaskStatus[] = ['done'];
