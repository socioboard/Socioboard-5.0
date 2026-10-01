import {
  FEED_TYPES,
  Notification,
  NotificationType,
  realtimeRooms,
  type ListNotificationsQuery,
  type NotificationPreference,
  type UpdateNotificationPreferencesBody,
} from '@socioboard/contracts';
import type { Prisma } from '@socioboard/db';

import {
  afterCursor,
  decodeCursor,
  notFound,
  toPage,
  unprocessable,
  type Clock,
  type Db,
  type Logger,
  type Realtime,
} from '../../platform';

/**
 * Each type's channels when the user never changed them; `null` means the type doesn't offer that
 * channel (docs/backend/modules/notifications.md, "Event → notification map").
 */
export const DEFAULT_CHANNELS: Record<
  NotificationType,
  { inApp: boolean | null; email: boolean | null }
> = {
  publish_failed: { inApp: true, email: true },
  post_published: { inApp: true, email: false },
  account_reauth_required: { inApp: true, email: true },
  // A summary email (P2-B12); off until the user turns it on.
  digest: { inApp: null, email: false },
};

/** One notification as its email needs it (no tokens or private data: it links to the app). */
export interface EmailItem {
  type: NotificationType;
  title: string;
  body: string;
  link: string | null;
  workspace: string;
}

/** Notifications are kept this long (docs: 90 days), then the nightly purge deletes them. */
export const NOTIFICATION_RETENTION_DAYS = 90;

export interface NotificationServiceDeps {
  db: Db;
  clock: Clock;
  logger: Logger;
  realtime: Realtime;
  /** Adds an item to the user's next email of this group (emails.ts: one email per burst). */
  queueEmail(userId: string, group: string, item: EmailItem): Promise<void>;
}

/** What happened, for whom: one notification per user, through the channels each user chose. */
export interface NotifyInput {
  workspace: { id: string; slug: string; name: string };
  userIds: string[];
  type: NotificationType;
  title: string;
  body: string;
  link: string | null;
  params: Record<string, string | number>;
  /** Notifications sharing a group within a few minutes become one email (e.g. `post:<id>`). */
  group: string;
}

const withWorkspace = { workspace: { select: { id: true, slug: true, name: true } } } as const;
type Row = Prisma.NotificationGetPayload<{ include: typeof withWorkspace }>;

const Params = Notification.shape.params.catch({});

export function createNotificationService(deps: NotificationServiceDeps) {
  const { db, clock, realtime } = deps;

  /**
   * The user's notifications they may still see: their own, and those of workspaces they still
   * belong to (removed from one, or it was deleted: its notifications leave the feed and count).
   */
  const visible = (userId: string): Prisma.NotificationWhereInput => ({
    userId,
    type: { in: FEED_TYPES },
    OR: [{ workspaceId: null }, { workspace: { deletedAt: null, members: { some: { userId } } } }],
  });

  const toNotification = (row: Row): Notification => ({
    id: row.id,
    type: NotificationType.catch('publish_failed').parse(row.type),
    workspace: row.workspace,
    title: row.title,
    body: row.body,
    params: Params.parse(row.params),
    link: row.link,
    readAt: row.readAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  });

  const unreadCount = (userId: string) =>
    db.client.notification.count({ where: { ...visible(userId), readAt: null } });

  // ---------------------------------------------------------------- preferences

  async function preferencesOf(userId: string): Promise<NotificationPreference[]> {
    const rows = await db.client.notificationPreference.findMany({ where: { userId } });
    return NotificationType.options.map((type) => {
      const offered = DEFAULT_CHANNELS[type];
      const row = rows.find((r) => r.type === type);
      return {
        type,
        inApp: offered.inApp === null ? null : (row?.inApp ?? offered.inApp),
        email: offered.email === null ? null : (row?.email ?? offered.email),
      };
    });
  }

  async function getPreferences(userId: string) {
    return { items: await preferencesOf(userId) };
  }

  async function updatePreferences(userId: string, body: UpdateNotificationPreferencesBody) {
    for (const item of body.items) {
      const offered = DEFAULT_CHANNELS[item.type];
      for (const channel of ['inApp', 'email'] as const) {
        if (item[channel] === true && offered[channel] === null) {
          throw unprocessable(
            'NOTIFICATION_CHANNEL_NOT_OFFERED',
            `${item.type} notifications can’t be sent ${channel === 'email' ? 'by email' : 'in the app'}`,
            { type: item.type, channel },
          );
        }
      }
    }
    const current = await preferencesOf(userId);
    for (const item of body.items) {
      const now = current.find((p) => p.type === item.type);
      const inApp = item.inApp ?? now?.inApp ?? false;
      const email = item.email ?? now?.email ?? false;
      await db.client.notificationPreference.upsert({
        where: { userId_type: { userId, type: item.type } },
        create: { userId, type: item.type, inApp, email },
        update: { inApp, email },
      });
    }
    return getPreferences(userId);
  }

  // ---------------------------------------------------------------- feed

  async function list(userId: string, query: ListNotificationsQuery) {
    const types = query.type?.filter((t) => (FEED_TYPES as readonly string[]).includes(t));
    const rows = await db.client.notification.findMany({
      where: {
        AND: [
          visible(userId),
          query.unread === undefined ? {} : { readAt: query.unread ? null : { not: null } },
          types ? { type: { in: types } } : {},
          query.cursor ? afterCursor(decodeCursor(query.cursor)) : {},
        ],
      },
      include: withWorkspace,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: query.limit + 1,
    });
    const page = toPage(rows, query.limit);
    return {
      items: page.items.map(toNotification),
      nextCursor: page.nextCursor,
      unreadCount: await unreadCount(userId),
    };
  }

  async function markRead(userId: string, notificationId: string) {
    const found = await db.client.notification.findFirst({
      where: { AND: [visible(userId), { id: notificationId }] },
      select: { id: true, readAt: true },
    });
    if (!found) throw notFound('NOTIFICATION_NOT_FOUND', 'Notification not found');
    let changed = 0;
    if (!found.readAt) {
      ({ count: changed } = await db.client.notification.updateMany({
        where: { id: found.id, readAt: null },
        data: { readAt: clock.now() },
      }));
    }
    const count = await unreadCount(userId);
    // Other tabs and devices update their bell.
    if (changed > 0) {
      realtime.emit(realtimeRooms.user(userId), 'notification.read', {
        ids: [found.id],
        unreadCount: count,
      });
    }
    return { unreadCount: count };
  }

  async function markAllRead(userId: string) {
    const { count: changed } = await db.client.notification.updateMany({
      where: { AND: [visible(userId), { readAt: null }] },
      data: { readAt: clock.now() },
    });
    const count = await unreadCount(userId);
    if (changed > 0) {
      realtime.emit(realtimeRooms.user(userId), 'notification.read', {
        ids: null,
        unreadCount: count,
      });
    }
    return { unreadCount: count };
  }

  // ---------------------------------------------------------------- sending

  /**
   * One notification per user, through the channels each chose: in the app (saved, and sent live
   * with the new unread count) and by email (grouped, sent by the `notifications` job).
   */
  async function notify(input: NotifyInput) {
    for (const userId of new Set(input.userIds)) {
      const prefs = (await preferencesOf(userId)).find((p) => p.type === input.type);
      if (prefs?.inApp) {
        const row = await db.forWorkspace(input.workspace.id).notification.create({
          data: {
            userId,
            workspaceId: input.workspace.id,
            type: input.type,
            title: input.title,
            body: input.body,
            link: input.link,
            params: input.params,
          },
          include: withWorkspace,
        });
        realtime.emit(realtimeRooms.user(userId), 'notification.new', {
          notification: toNotification(row),
          unreadCount: await unreadCount(userId),
        });
      }
      if (prefs?.email) {
        await deps.queueEmail(userId, input.group, {
          type: input.type,
          title: input.title,
          body: input.body,
          link: input.link,
          workspace: input.workspace.name,
        });
      }
    }
  }

  /** Deletes notifications older than the retention period; returns how many. */
  async function purgeExpired(retentionDays = NOTIFICATION_RETENTION_DAYS) {
    const before = new Date(clock.now().getTime() - retentionDays * 86_400_000);
    const { count } = await db.client.notification.deleteMany({
      where: { createdAt: { lt: before } },
    });
    return count;
  }

  return {
    list,
    markRead,
    markAllRead,
    getPreferences,
    updatePreferences,
    preferencesOf,
    notify,
    purgeExpired,
  };
}

export type NotificationService = ReturnType<typeof createNotificationService>;
