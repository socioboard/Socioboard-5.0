import { apiRoutes } from '@socioboard/contracts';
import { queryOptions } from '@tanstack/react-query';

import { api } from '../../lib/api';
import { membersKey, membersQuery } from '../../lib/members';

export { membersQuery };

export const workspaceKeys = {
  detail: (workspaceId: string) => ['workspaces', workspaceId] as const,
  members: membersKey,
  invitations: (workspaceId: string) => ['workspaces', workspaceId, 'invitations'] as const,
};

export const workspaceQuery = (workspaceId: string) =>
  queryOptions({
    queryKey: workspaceKeys.detail(workspaceId),
    queryFn: ({ signal }) =>
      api(apiRoutes.workspaces.getWorkspace, { params: { workspaceId }, signal }),
  });

export const invitationsQuery = (workspaceId: string) =>
  queryOptions({
    queryKey: workspaceKeys.invitations(workspaceId),
    queryFn: async ({ signal }) =>
      (await api(apiRoutes.workspaces.listInvitations, { params: { workspaceId }, signal })).items,
  });
