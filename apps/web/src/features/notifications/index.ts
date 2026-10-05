// Public surface of the notifications area (docs/frontend/areas/notifications.md).
export { BELL_SIZE, bellQuery, notificationKeys, rememberRead } from './api';
export { NotificationBell, UnreadBadge } from './components/notification-bell';
export { NotificationsPage, type NotificationsSearch } from './components/notifications-page';
export { useNotificationToasts, useUnreadTitle } from './hooks';
