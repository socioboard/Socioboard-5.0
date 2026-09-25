// Public surface of the auth module (docs/backend/modules/auth.md). Other modules import only
// from here.
import { isAPIError } from 'better-auth/api';
import { toNodeHandler } from 'better-auth/node';
import { Router } from 'express';

import {
  conflict,
  notFound,
  typedEvents,
  type AuthContext,
  type EventBus,
  type SessionResolver,
} from '../../platform';
import { createAuth, type Auth, type AuthDeps } from './auth';
import type { AuthEvents } from './events';

export type { Auth } from './auth';
export type { AuthEvents } from './events';
export { promoteFirstUser } from './bootstrap';
export { registerAuthRoutes } from './routes';
export { workspaceRoles } from './roles';
export { createMeService, type MeService } from './service';

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
  const auth = createAuth({ ...deps, events: typedEvents<AuthEvents>(deps.events) });
  const router = Router();
  router.use('/api/auth/organization', (_req, _res, next) => {
    next(notFound('ROUTE_NOT_FOUND', 'Use the /api/v1/workspaces endpoints'));
  });
  const handler = toNodeHandler(auth);
  router.all('/api/auth/{*path}', (req, res) => {
    // Better Auth reads the client IP (for its rate limits and session records) from
    // X-Forwarded-For. Hand it the one Express already resolved under TRUST_PROXY, so there is a
    // single rule for who the client is and a client can't spoof it.
    req.headers['x-forwarded-for'] = req.ip ?? '';
    return handler(req, res);
  });

  const resolveSession: SessionResolver = async (headers) => {
    const { headers: responseHeaders, response: found } = await auth.api.getSession({
      headers,
      returnHeaders: true,
    });
    const setCookies = responseHeaders.getSetCookie();
    if (!found) return { auth: null, setCookies };
    const { user, session } = found;
    const context: AuthContext = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
        isPlatformAdmin: user.isPlatformAdmin === true,
      },
      session: { id: session.id, activeWorkspaceId: session.activeOrganizationId ?? null },
    };
    return { auth: context, setCookies };
  };

  return { auth, router, resolveSession };
}

/** Better Auth calls the workspaces module needs (its WorkspaceAuthPort). */
export function createWorkspaceAuthPort(auth: Auth) {
  return {
    async createWorkspace(input: {
      headers: Headers;
      name: string;
      slug: string;
      timezone: string;
    }) {
      try {
        const { headers, response } = await auth.api.createOrganization({
          body: { name: input.name, slug: input.slug, timezone: input.timezone },
          headers: input.headers,
          returnHeaders: true,
        });
        return { id: response.id, setCookies: headers.getSetCookie() };
      } catch (err) {
        // Two requests racing for the same slug: our check passed for both, Better Auth caught one.
        const code = isAPIError(err)
          ? (err.body as { code?: string } | undefined)?.code
          : undefined;
        if (code === 'ORGANIZATION_SLUG_ALREADY_TAKEN' || code === 'ORGANIZATION_ALREADY_EXISTS') {
          throw conflict('SLUG_TAKEN', 'That address is already taken');
        }
        throw err;
      }
    },
    async setActiveWorkspace(headers: Headers, workspaceId: string) {
      const result = await auth.api.setActiveOrganization({
        body: { organizationId: workspaceId },
        headers,
        returnHeaders: true,
      });
      return result.headers.getSetCookie();
    },
  };
}
