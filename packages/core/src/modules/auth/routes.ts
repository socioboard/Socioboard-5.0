import { authRoutes, type AuthOptions } from '@socioboard/contracts';

import { toHeaders, type ApiRouter } from '../../platform';
import type { MeService } from './service';

/** Mounts /api/v1/auth/options and the /api/v1/me routes (contracts: authRoutes). */
export function registerAuthRoutes(api: ApiRouter, me: MeService, options: AuthOptions) {
  api.route(authRoutes.getAuthOptions, () => options);

  api.route(authRoutes.getMe, ({ auth }) => me.getMe(auth));

  api.route(authRoutes.updateMe, async ({ auth, body, req, res }) => {
    const { value, setCookies } = await me.updateMe(auth, toHeaders(req.headers), body);
    for (const cookie of setCookies) res.append('Set-Cookie', cookie);
    return value;
  });

  api.route(authRoutes.createAvatarUpload, ({ auth, body }) => me.createAvatarUpload(auth, body));

  api.route(authRoutes.setActiveWorkspace, async ({ auth, body, req, res }) => {
    const setCookies = await me.setActiveWorkspace(auth, toHeaders(req.headers), body.workspaceId);
    for (const cookie of setCookies) res.append('Set-Cookie', cookie);
  });

  api.route(authRoutes.listSessions, async ({ auth }) => ({
    items: await me.listSessions(auth),
  }));

  api.route(authRoutes.revokeSession, ({ auth, params, req }) =>
    me.revokeSession(auth, toHeaders(req.headers), params.sessionId),
  );
}
