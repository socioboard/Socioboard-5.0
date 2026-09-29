import { apiRoutes, type RouteDefinition } from '@socioboard/contracts';

/**
 * Contract routes defined before their handlers, with the task that builds each. A phase's
 * contracts land first (docs/backend/contracts.md); the task that mounts a route removes it here.
 * The route checks skip only these, and fail when a listed route is already mounted.
 */
export const PENDING_ROUTES: Readonly<Record<string, string>> = {};

/** Every contract route with its name (route names are unique across modules). */
export function namedRoutes(): [string, RouteDefinition][] {
  return Object.values(apiRoutes).flatMap((m) =>
    Object.entries(m as Record<string, RouteDefinition>),
  );
}
