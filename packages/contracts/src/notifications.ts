import { z } from 'zod';

import { Id, IsoDateTime, PageQuery } from './common';
import { defineRoute } from './route';

/**
 * What tells people something happened (docs/backend/modules/notifications.md): an in-app feed,
 * live over the socket (events.ts), and email for the important ones. Notifications belong to a
 * user, across workspaces; each says which workspace it came from.
 */

/**
 * Phase 2: publishing and accounts. Phase 4 adds review, comments, tasks and AI jobs.
 * `digest` is a summary email only; it never appears in the feed.
 */
export const NotificationType = z.enum([
  'publish_failed',
  'post_published',
  'account_reauth_required',
  'digest',
]);
export type NotificationType = z.infer<typeof NotificationType>;

/** Types that appear in the feed (everything except email-only ones). */
export const FEED_TYPES = NotificationType.options.filter((t) => t !== 'digest');

/**
 * A path inside the app (e.g. `/w/acme/posts/…`), never a full URL: a notification can't send
 * anyone off-site. `//host` and `/\host` are full URLs to a browser, and browsers drop tabs and
 * newlines (`/\t/host` becomes `//host`), so only URL path characters are allowed.
 */
export const AppPath = z
  .string()
  .max(512)
  .regex(
    /^\/(?![/\\])[A-Za-z0-9\-._~!$&'()*+,;=:@%/?#]*$/,
    'A path inside the app, starting with a single /',
  );

export const Notification = z.object({
  id: Id,
  type: NotificationType,
  /** The workspace it's about; null for ones about the user alone. */
  workspace: z.object({ id: Id, slug: z.string(), name: z.string() }).nullable(),
  /**
   * The UI words a notification from `type` and `params` (i18n); `title` and `body` are the
   * English fallback, also used for email.
   */
  title: z.string(),
  body: z.string(),
  params: z.record(z.string(), z.union([z.string(), z.number()])),
  link: AppPath.nullable(),
  readAt: IsoDateTime.nullable(),
  createdAt: IsoDateTime,
});
export type Notification = z.infer<typeof Notification>;

/** `?unread=true` or `false`: `z.coerce.boolean()` would read "false" as true. */
const QueryBoolean = z.enum(['true', 'false']).transform((v) => v === 'true');

export const ListNotificationsQuery = PageQuery.extend({
  unread: QueryBoolean.optional(),
  type: z
    .union([NotificationType, z.array(NotificationType)])
    .transform((t) => (Array.isArray(t) ? t : [t]))
    .optional(),
});
export type ListNotificationsQuery = z.infer<typeof ListNotificationsQuery>;

/** Newest first. `unreadCount` is across all pages, for the bell. */
export const NotificationPage = z.object({
  items: z.array(Notification),
  nextCursor: z.string().nullable(),
  unreadCount: z.number().int().nonnegative(),
});
export type NotificationPage = z.infer<typeof NotificationPage>;

export const UnreadCount = z.object({ unreadCount: z.number().int().nonnegative() });
export type UnreadCount = z.infer<typeof UnreadCount>;

/**
 * One channel of one type. `null` means the channel isn't offered for that type (a digest is
 * email only), so the preferences screen hides the switch.
 */
export const NotificationPreference = z.object({
  type: NotificationType,
  inApp: z.boolean().nullable(),
  email: z.boolean().nullable(),
});
export type NotificationPreference = z.infer<typeof NotificationPreference>;

/** Every type, with the defaults filled in for types the user never changed. */
export const NotificationPreferences = z.object({ items: z.array(NotificationPreference) });
export type NotificationPreferences = z.infer<typeof NotificationPreferences>;

/**
 * Sets the listed types; types left out keep their setting, and a channel left out of an item
 * keeps its setting too. Turning on a channel the type doesn't offer is NOTIFICATION_CHANNEL_NOT_OFFERED.
 */
export const UpdateNotificationPreferencesBody = z.object({
  items: z
    .array(
      z.object({
        type: NotificationType,
        inApp: z.boolean().optional(),
        email: z.boolean().optional(),
      }),
    )
    .min(1)
    .max(NotificationType.options.length)
    .refine(
      (items) => new Set(items.map((i) => i.type)).size === items.length,
      'A type is listed twice',
    ),
});
export type UpdateNotificationPreferencesBody = z.infer<typeof UpdateNotificationPreferencesBody>;

export const notificationRoutes = {
  listNotifications: defineRoute({
    method: 'GET',
    path: '/api/v1/notifications',
    access: 'user',
    summary: 'My notifications, newest first, with the unread count',
    query: ListNotificationsQuery,
    responses: { 200: NotificationPage },
  }),
  // Declared before `/notifications/:notificationId/read`, though the two can't collide.
  markAllNotificationsRead: defineRoute({
    method: 'POST',
    path: '/api/v1/notifications/read-all',
    access: 'user',
    summary: 'Mark every notification read',
    responses: { 200: UnreadCount },
  }),
  markNotificationRead: defineRoute({
    method: 'POST',
    path: '/api/v1/notifications/:notificationId/read',
    access: 'user',
    summary: 'Mark one notification read (again is fine)',
    params: z.object({ notificationId: Id }),
    responses: { 200: UnreadCount },
  }),
  getNotificationPreferences: defineRoute({
    method: 'GET',
    path: '/api/v1/me/notification-preferences',
    access: 'user',
    summary: 'Which notifications I get in the app and by email',
    responses: { 200: NotificationPreferences },
  }),
  updateNotificationPreferences: defineRoute({
    method: 'PUT',
    path: '/api/v1/me/notification-preferences',
    access: 'user',
    summary: 'Change some notification settings',
    body: UpdateNotificationPreferencesBody,
    responses: { 200: NotificationPreferences },
  }),
};
