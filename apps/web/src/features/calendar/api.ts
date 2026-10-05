import { apiRoutes, type CalendarQuery } from '@socioboard/contracts';
import { queryOptions } from '@tanstack/react-query';

import { api } from '../../lib/api';

export const calendarKeys = {
  all: (workspaceId: string) => ['workspaces', workspaceId, 'calendar'] as const,
  range: (workspaceId: string, query: CalendarQuery) =>
    [...calendarKeys.all(workspaceId), query] as const,
};

export const calendarQuery = (workspaceId: string, query: CalendarQuery) =>
  queryOptions({
    queryKey: calendarKeys.range(workspaceId, query),
    queryFn: ({ signal }) =>
      api(apiRoutes.scheduling.getCalendar, { params: { workspaceId }, query, signal }),
    // P2-F5 replaces polling with realtime invalidation. Due cards must still advance today.
    refetchInterval: 30_000,
  });

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
