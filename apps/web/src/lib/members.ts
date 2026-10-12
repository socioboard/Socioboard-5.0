import { apiRoutes } from '@socioboard/contracts';
import { queryOptions } from '@tanstack/react-query';

import { api } from './api';

/**
 * The workspace's members, shared by the areas that pick people (settings' members page, task
 * assignees), so they read one cached list.
 */
export const membersKey = (workspaceId: string) => ['workspaces', workspaceId, 'members'] as const;

export const membersQuery = (workspaceId: string) =>
  queryOptions({
    queryKey: membersKey(workspaceId),
    queryFn: async ({ signal }) =>
      (await api(apiRoutes.workspaces.listMembers, { params: { workspaceId }, signal })).items,
  });
