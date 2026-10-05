import { apiRoutes, type CalendarQuery } from '@socioboard/contracts';
import { queryOptions } from '@tanstack/react-query';

import { api } from '../../lib/api';
import { isLive } from '../../lib/realtime';

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
    // Live, the socket says when a post changes; without it, ask every 30 s.
    refetchInterval: () => (isLive() ? false : 30_000),
  });
