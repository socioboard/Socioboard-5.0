import { apiRoutes } from '@socioboard/contracts';
import { queryOptions } from '@tanstack/react-query';

import { api } from '../../lib/api';

export const workspaceKeys = {
  detail: (workspaceId: string) => ['workspaces', workspaceId] as const,
  members: (workspaceId: string) => ['workspaces', workspaceId, 'members'] as const,
  invitations: (workspaceId: string) => ['workspaces', workspaceId, 'invitations'] as const,
};

export const workspaceQuery = (workspaceId: string) =>
  queryOptions({
    queryKey: workspaceKeys.detail(workspaceId),
    queryFn: ({ signal }) =>
      api(apiRoutes.workspaces.getWorkspace, { params: { workspaceId }, signal }),
  });

export const membersQuery = (workspaceId: string) =>
  queryOptions({
    queryKey: workspaceKeys.members(workspaceId),
    queryFn: async ({ signal }) =>
      (await api(apiRoutes.workspaces.listMembers, { params: { workspaceId }, signal })).items,
  });

export const invitationsQuery = (workspaceId: string) =>
  queryOptions({
    queryKey: workspaceKeys.invitations(workspaceId),
    queryFn: async ({ signal }) =>
      (await api(apiRoutes.workspaces.listInvitations, { params: { workspaceId }, signal })).items,
  });
