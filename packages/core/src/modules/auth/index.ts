// Public surface of the auth module (docs/backend/modules/auth.md). Other modules import only
// from here.
import { toNodeHandler } from 'better-auth/node';
import { Router } from 'express';

import { notFound, type EventBus, type SessionResolver } from '../../platform';
import { createAuth, type Auth, type AuthDeps } from './auth';
import type { AuthEvents } from './events';

export type { Auth } from './auth';
export type { AuthEvents } from './events';
export { workspaceRoles } from './roles';

export interface AuthModule {
  auth: Auth;
  /**
   * Router for /api/auth/*. Mount it before express.json(): Better Auth reads the raw body.
   * Better Auth's organization endpoints are not exposed; workspaces, members and invitations go
   * through our /api/v1 routes so permissions, limits and audit logging stay in one place.
   */
  router: Router;
  /** Reads the signed-in user from the request cookie, for the session middleware. */
  resolveSession: SessionResolver;
}

export function createAuthModule(
  deps: Omit<AuthDeps, 'events'> & { events: EventBus<Record<string, unknown>> },
): AuthModule {
  const auth = createAuth({ ...deps, events: deps.events as unknown as EventBus<AuthEvents> });
  const router = Router();
  router.use('/api/auth/organization', (_req, _res, next) => {
    next(notFound('ROUTE_NOT_FOUND', 'Use the /api/v1/workspaces endpoints'));
  });
  router.all('/api/auth/{*path}', toNodeHandler(auth));

  const resolveSession: SessionResolver = async (headers) => {
    const found = await auth.api.getSession({ headers });
    if (!found) return null;
    const { user, session } = found;
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
        isPlatformAdmin: user.isPlatformAdmin === true,
      },
      session: { id: session.id, activeWorkspaceId: session.activeOrganizationId ?? null },
    };
  };

  return { auth, router, resolveSession };
}
