import { apiRoutes } from '@socioboard/contracts';
import { queryOptions } from '@tanstack/react-query';

import { api } from '../../lib/api';

export const queueKeys = {
  slots: (workspaceId: string, accountId: string) =>
    ['workspaces', workspaceId, 'accounts', accountId, 'queue-slots'] as const,
};

/** An account's posting times and its next slots, with the posts already in each. */
export const queueSlotsQuery = (workspaceId: string, accountId: string) =>
  queryOptions({
    queryKey: queueKeys.slots(workspaceId, accountId),
    queryFn: ({ signal }) =>
      api(apiRoutes.scheduling.getQueueSlots, { params: { workspaceId, accountId }, signal }),
  });
