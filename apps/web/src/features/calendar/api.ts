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
