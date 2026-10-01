import { apiRoutes, type RouteDefinition } from '@socioboard/contracts';

/**
 * Contract routes defined before their handlers, with the task that builds each. A phase's
 * contracts land first (docs/backend/contracts.md); the task that mounts a route removes it here.
 * The route checks skip only these, and fail when a listed route is already mounted.
 */
export const PENDING_ROUTES: Readonly<Record<string, string>> = {
  setRecurrence: 'P2-B4',
  deleteRecurrence: 'P2-B4',
  getCalendar: 'P2-B9',
  listNotifications: 'P2-B8',
  markAllNotificationsRead: 'P2-B8',
  markNotificationRead: 'P2-B8',
  getNotificationPreferences: 'P2-B8',
  updateNotificationPreferences: 'P2-B8',
  getAdminOverview: 'P2-B10',
  getPublishingHealth: 'P2-B10',
  listProblemTargets: 'P2-B10',
  adminRetryTarget: 'P2-B10',
  adminCancelTarget: 'P2-B10',
  listAttentionAccounts: 'P2-B10',
};

/** Every contract route with its name (route names are unique across modules). */
export function namedRoutes(): [string, RouteDefinition][] {
  return Object.values(apiRoutes).flatMap((m) =>
    Object.entries(m as Record<string, RouteDefinition>),
  );
}
