import { z } from 'zod';

import { Id, IsoDateTime } from './common';
import { Notification } from './notifications';
import { PostStatus, TargetStatus } from './posts';
import { AccountStatus } from './social-accounts';

/**
 * Live updates over Socket.IO (docs/backend/modules/notifications.md#websocket). The server
 * sends; the browser only listens and refreshes what changed. On connect the server checks the
 * session cookie and joins the socket to `user:<id>` and to `workspace:<id>` for each workspace
 * the user belongs to (and leaves a workspace's room when they're removed from it), so nobody
 * receives another workspace's events. Payloads say what changed, not the whole object: the web
 * app refetches through the API, where permissions apply.
 */

/** Socket.IO's path, under /api so the same proxy rules serve it. */
export const REALTIME_PATH = '/api/socket.io';

export const realtimeRooms = {
  user: (userId: string) => `user:${userId}`,
  workspace: (workspaceId: string) => `workspace:${workspaceId}`,
} as const;

export const serverEvents = {
  /** To `user:<id>`: a new notification, and the new unread count for the bell. */
  'notification.new': z.object({
    notification: Notification,
    unreadCount: z.number().int().nonnegative(),
  }),
  /** To `user:<id>`: read in another tab or device; `ids` null means all were marked read. */
  'notification.read': z.object({
    ids: z.array(Id).nullable(),
    unreadCount: z.number().int().nonnegative(),
  }),
  /** To `workspace:<id>`: a post or its targets changed status (scheduled, publishing, sent…). */
  'post.status_changed': z.object({
    workspaceId: Id,
    postId: Id,
    status: PostStatus,
    targets: z.array(
      z.object({
        id: Id,
        status: TargetStatus,
        scheduledAt: IsoDateTime.nullable(),
        publishedAt: IsoDateTime.nullable(),
      }),
    ),
  }),
  /** To `workspace:<id>`: an account became active, needs reconnecting, or was disconnected. */
  'account.status_changed': z.object({
    workspaceId: Id,
    accountId: Id,
    status: AccountStatus,
  }),
};

export type ServerEventName = keyof typeof serverEvents;
export type ServerEventPayload<E extends ServerEventName> = z.infer<(typeof serverEvents)[E]>;

/** For typing the Socket.IO server and client (`Server<{}, ServerToClientEvents>`). */
export type ServerToClientEvents = {
  [E in ServerEventName]: (payload: ServerEventPayload<E>) => void;
};
