import {
  apiRoutes,
  type Notification,
  type NotificationPage,
  type NotificationType,
} from '@socioboard/contracts';
import {
  infiniteQueryOptions,
  queryOptions,
  type InfiniteData,
  type QueryClient,
} from '@tanstack/react-query';

import { api } from '../../lib/api';

/** Notifications are the user's own, across workspaces: not under a workspace key. */
export const notificationKeys = {
  all: ['notifications'] as const,
  bell: ['notifications', 'bell'] as const,
  lists: ['notifications', 'list'] as const,
  list: (filter: NotificationFilter) => ['notifications', 'list', filter] as const,
  preferences: ['notifications', 'preferences'] as const,
};

export interface NotificationFilter {
  unread: boolean;
  type: NotificationType | null;
}

/** The bell shows the latest 20. */
export const BELL_SIZE = 20;
/**
 * How often the bell asks for news until the socket delivers it (P2-F5); new failures are
 * toasted when they arrive.
 */
export const BELL_POLL_MS = 30_000;
const PAGE_SIZE = 25;

export const bellQuery = queryOptions({
  queryKey: notificationKeys.bell,
  queryFn: ({ signal }) =>
    api(apiRoutes.notifications.listNotifications, { query: { limit: BELL_SIZE }, signal }),
  refetchInterval: BELL_POLL_MS,
});

export const notificationListQuery = (filter: NotificationFilter) =>
  infiniteQueryOptions({
    queryKey: notificationKeys.list(filter),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam, signal }) =>
      api(apiRoutes.notifications.listNotifications, {
        query: {
          limit: PAGE_SIZE,
          ...(pageParam ? { cursor: pageParam } : {}),
          ...(filter.unread ? { unread: 'true' as const } : {}),
          ...(filter.type ? { type: filter.type } : {}),
        },
        signal,
      }),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });

export const preferencesQuery = queryOptions({
  queryKey: notificationKeys.preferences,
  queryFn: ({ signal }) => api(apiRoutes.notifications.getNotificationPreferences, { signal }),
});

/**
 * After marking read (one, or all when `ids` is null): every cached copy shows it read, with the
 * server's unread count, so the bell, the page and other lists agree without refetching.
 */
export function rememberRead(
  client: QueryClient,
  ids: readonly string[] | null,
  unreadCount: number,
  at = new Date().toISOString(),
) {
  const read = (n: Notification): Notification =>
    n.readAt === null && (ids === null || ids.includes(n.id)) ? { ...n, readAt: at } : n;
  client.setQueryData<NotificationPage>(notificationKeys.bell, (old) =>
    old ? { ...old, items: old.items.map(read), unreadCount } : old,
  );
  client.setQueriesData<InfiniteData<NotificationPage>>(
    { queryKey: notificationKeys.lists },
    (old) =>
      old
        ? {
            ...old,
            pages: old.pages.map((p) => ({ ...p, items: p.items.map(read), unreadCount })),
          }
        : old,
  );
  // An "unread" list still holds what was just read; it drops it on its next look.
  void client.invalidateQueries({ queryKey: notificationKeys.lists, refetchType: 'none' });
}

export async function markRead(client: QueryClient, id: string) {
  const { unreadCount } = await api(apiRoutes.notifications.markNotificationRead, {
    params: { notificationId: id },
  });
  rememberRead(client, [id], unreadCount);
}

export async function markAllRead(client: QueryClient) {
  const { unreadCount } = await api(apiRoutes.notifications.markAllNotificationsRead);
  rememberRead(client, null, unreadCount);
}
