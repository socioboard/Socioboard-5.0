import type { NotificationPage, PostDetails, ServerEventPayload } from '@socioboard/contracts';
import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import {
  connectRealtime,
  defaultSocket,
  type RealtimeHandlers,
  type SocketFactory,
} from '../../lib/realtime';
import { BELL_SIZE, notificationKeys, rememberRead } from '../notifications';
import { postKeys } from '../posts';

const workspaceKey = (workspaceId: string, area: string) => ['workspaces', workspaceId, area];

/**
 * A post's targets changed (scheduled, publishing, sent, failed): the post's page shows the new
 * statuses at once and then re-reads the post (attempts, links and errors came with it); lists, the
 * calendar, the queue and the failed count refresh.
 */
function postChanged(client: QueryClient, p: ServerEventPayload<'post.status_changed'>) {
  const detail = postKeys.detail(p.workspaceId, p.postId);
  client.setQueryData<PostDetails>(detail, (old) =>
    old
      ? {
          ...old,
          status: p.status,
          targets: old.targets.map((t) => {
            const now = p.targets.find((x) => x.id === t.id);
            return now
              ? {
                  ...t,
                  status: now.status,
                  scheduledAt: now.scheduledAt,
                  publishedAt: now.publishedAt,
                }
              : t;
          }),
        }
      : old,
  );
  void client.invalidateQueries({ queryKey: detail });
  void client.invalidateQueries({ queryKey: postKeys.lists(p.workspaceId) });
  void client.invalidateQueries({ queryKey: workspaceKey(p.workspaceId, 'calendar') });
  // Review steps change a post's status too: the review queue and its count follow.
  void client.invalidateQueries({ queryKey: workspaceKey(p.workspaceId, 'reviews') });
  void client.invalidateQueries({
    queryKey: workspaceKey(p.workspaceId, 'accounts'),
    predicate: (q) => q.queryKey.at(-1) === 'queue-slots',
  });
}

/** The handlers, apart from React so tests can call them directly. */
export function liveHandlers(client: QueryClient): RealtimeHandlers {
  return {
    'notification.new': ({ notification, unreadCount }) => {
      const had = client.getQueryData<NotificationPage>(notificationKeys.bell);
      if (had) {
        client.setQueryData<NotificationPage>(notificationKeys.bell, {
          ...had,
          items: [notification, ...had.items.filter((n) => n.id !== notification.id)].slice(
            0,
            BELL_SIZE,
          ),
          unreadCount,
        });
      } else {
        void client.invalidateQueries({ queryKey: notificationKeys.bell });
      }
      void client.invalidateQueries({ queryKey: notificationKeys.lists });
    },
    'notification.read': ({ ids, unreadCount }) => {
      rememberRead(client, ids, unreadCount);
    },
    'post.status_changed': (p) => {
      postChanged(client, p);
    },
    'account.status_changed': ({ workspaceId }) => {
      // Accounts (list, details, posting times) and what shows an account's state on a post.
      void client.invalidateQueries({ queryKey: workspaceKey(workspaceId, 'accounts') });
      void client.invalidateQueries({ queryKey: workspaceKey(workspaceId, 'posts') });
    },
    // Back after a drop: anything may have changed meanwhile.
    resync: () => {
      void client.invalidateQueries({ queryKey: notificationKeys.all });
      void client.invalidateQueries({ queryKey: ['workspaces'] });
    },
    // Live or not, the screens that ask on a timer re-plan (refetchInterval reads isLive()).
    status: (status) => {
      if (status === 'connecting') return;
      void client.refetchQueries({ queryKey: notificationKeys.bell, type: 'active' });
      void client.refetchQueries({
        type: 'active',
        predicate: (q) => q.queryKey[0] === 'workspaces' && q.queryKey[2] === 'calendar',
      });
    },
  };
}

/** Mounted once by the app shell, for as long as someone is signed in. */
export function useLiveUpdates(factory: SocketFactory = defaultSocket) {
  const client = useQueryClient();
  useEffect(() => connectRealtime(liveHandlers(client), factory), [client, factory]);
}
