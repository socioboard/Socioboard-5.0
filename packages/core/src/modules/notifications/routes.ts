import { notificationRoutes as r } from '@socioboard/contracts';

import type { ApiRouter } from '../../platform';
import type { NotificationService } from './service';

/** Mounts the notification feed and preferences (contracts: notificationRoutes). */
export function registerNotificationRoutes(api: ApiRouter, notifications: NotificationService) {
  api.route(r.listNotifications, ({ auth, query }) => notifications.list(auth.user.id, query));
  api.route(r.markAllNotificationsRead, ({ auth }) => notifications.markAllRead(auth.user.id));
  api.route(r.markNotificationRead, ({ auth, params }) =>
    notifications.markRead(auth.user.id, params.notificationId),
  );
  api.route(r.getNotificationPreferences, ({ auth }) => notifications.getPreferences(auth.user.id));
  api.route(r.updateNotificationPreferences, ({ auth, body }) =>
    notifications.updatePreferences(auth.user.id, body),
  );
}
