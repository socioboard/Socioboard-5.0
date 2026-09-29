import { networkRoutes, socialAccountRoutes as r } from '@socioboard/contracts';
import { Router } from 'express';

import type { ApiRouter } from '../../platform';
import type { SocialAccountService } from './service';

/** Mounts GET /networks and the social-accounts routes (contracts: networkRoutes, socialAccountRoutes). */
export function registerSocialAccountRoutes(api: ApiRouter, accounts: SocialAccountService) {
  api.route(networkRoutes.listNetworks, () => ({ items: accounts.listNetworks() }));

  api.route(r.startConnect, ({ auth, member, params, body }) =>
    accounts.startConnect(auth, member, params.provider, body.forceAccountSelection),
  );
  api.route(r.listConnections, async ({ member, query }) => ({
    items: await accounts.listConnections(member, query.provider),
  }));
  api.route(r.listConnectableAssets, ({ member, params }) =>
    accounts.listConnectableAssets(member, params.connectionId),
  );
  api.route(r.addAssets, ({ auth, member, params, body }) =>
    accounts.addAssets(auth, member, params.connectionId, body.externalIds),
  );
  api.route(r.reconnect, ({ auth, member, params }) =>
    accounts.reconnect(auth, member, params.connectionId),
  );
  api.route(r.removeConnection, ({ auth, member, params }) =>
    accounts.removeConnection(auth, member, params.connectionId),
  );

  api.route(r.listAccounts, async ({ member, query }) => ({
    items: await accounts.listAccounts(member, query.network),
  }));
  api.route(r.getAccount, ({ member, params }) => accounts.getAccount(member, params.accountId));
  api.route(r.disconnectAccount, ({ auth, member, params }) =>
    accounts.disconnectAccount(auth, member, params.accountId),
  );
}

/**
 * `GET /api/oauth/:provider/callback`: where networks send the browser after sign-in. Not a JSON
 * API route (the browser follows redirects), so it lives outside /api/v1; it needs the session
 * middleware in front so the callback is tied to the person who started it.
 */
export function createOAuthCallbackRouter(accounts: SocialAccountService): Router {
  const router = Router();
  router.get('/api/oauth/:provider/callback', async (req, res) => {
    const target = await accounts.handleCallback(
      req.params.provider,
      req.query,
      res.locals.auth ?? null,
    );
    // The URL carried a one-time code: don't cache it or pass it on as a referrer.
    res.set('Cache-Control', 'no-store');
    res.set('Referrer-Policy', 'no-referrer');
    res.redirect(303, target);
  });
  return router;
}
