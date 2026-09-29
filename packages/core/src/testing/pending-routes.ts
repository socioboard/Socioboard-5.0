import { apiRoutes, type RouteDefinition } from '@socioboard/contracts';

/**
 * Contract routes defined before their handlers, with the task that builds each. A phase's
 * contracts land first (docs/backend/contracts.md); the task that mounts a route removes it here.
 * The route checks skip only these, and fail when a listed route is already mounted.
 */
export const PENDING_ROUTES: Readonly<Record<string, string>> = {
  listNetworks: 'P1-B5',
  startConnect: 'P1-B5',
  listConnections: 'P1-B5',
  listConnectableAssets: 'P1-B5',
  addAssets: 'P1-B5',
  reconnect: 'P1-B5',
  removeConnection: 'P1-B5',
  listAccounts: 'P1-B5',
  getAccount: 'P1-B5',
  disconnectAccount: 'P1-B5',
  validatePost: 'P1-B6',
  createPost: 'P1-B6',
  listPosts: 'P1-B6',
  getPost: 'P1-B6',
  updatePost: 'P1-B6',
  deletePost: 'P1-B6',
  duplicatePost: 'P1-B6',
  publishNow: 'P1-B7',
  retryTarget: 'P1-B7',
};

/** Every contract route with its name (route names are unique across modules). */
export function namedRoutes(): [string, RouteDefinition][] {
  return Object.values(apiRoutes).flatMap((m) =>
    Object.entries(m as Record<string, RouteDefinition>),
  );
}
