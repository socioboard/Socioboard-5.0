import { z } from 'zod';

import { Id, IsoDateTime } from './common';
import { defineRoute } from './route';
import { ConnectErrorCode, StartConnectResponse } from './social-accounts';

// Link shortening (docs/backend/modules/shortlinks.md): a workspace connects its own Bitly
// account; links are shortened on demand from the composer or automatically at publish time.

/** Shorteners a workspace can connect. Bitly first; others plug in behind the same interface. */
export const ShortenerProvider = z.enum(['bitly']);
export type ShortenerProvider = z.infer<typeof ShortenerProvider>;

/** The workspace's shortener connection. */
export const Shortener = z.object({
  provider: ShortenerProvider,
  /** The connected account, as the shortener names it (a Bitly login). */
  accountName: z.string(),
  /** Short links are made on this domain (e.g. bit.ly, or the account's own). */
  domain: z.string(),
  /** Shorten every link when a post goes out, each network getting its own short link. */
  autoShorten: z.boolean(),
  connectedBy: z.object({ id: Id, name: z.string() }).nullable(),
  connectedAt: IsoDateTime,
});
export type Shortener = z.infer<typeof Shortener>;

export const GetShortenerResponse = z.object({
  /** Whether this server can connect a shortener at all (it has the Bitly app's keys). */
  available: z.boolean(),
  shortener: Shortener.nullable(),
});
export type GetShortenerResponse = z.infer<typeof GetShortenerResponse>;

export const UpdateShortenerBody = z.object({ autoShorten: z.boolean() });

/**
 * Where the OAuth callback (`/api/oauth/bitly/callback`) sends the browser: the accounts page's
 * shortener tab, `/w/:slug/accounts/shortener`, with `?result=<ShortenerConnectResult>` on
 * success or `?error=<ConnectErrorCode>`.
 */
export const ShortenerConnectResult = z.enum(['connected', 'reconnected']);
export type ShortenerConnectResult = z.infer<typeof ShortenerConnectResult>;
export const ShortenerConnectError = ConnectErrorCode.extract([
  'ACCESS_DENIED',
  'OAUTH_STATE_INVALID',
  'NETWORK_NOT_ENABLED',
  'NETWORK_ERROR',
]);
export type ShortenerConnectError = z.infer<typeof ShortenerConnectError>;

export const ShortenLinkBody = z.object({
  url: z.url({ protocol: /^https?$/ }).max(2048),
});

/** A shortened link. Shortening the same address again returns the same one. */
export const ShortLink = z.object({
  id: Id,
  longUrl: z.url(),
  shortUrl: z.url(),
  provider: ShortenerProvider,
  createdAt: IsoDateTime,
});
export type ShortLink = z.infer<typeof ShortLink>;

const workspaceParams = z.object({ workspaceId: Id });

export const shortlinkRoutes = {
  getShortener: defineRoute({
    method: 'GET',
    path: '/api/v1/workspaces/:workspaceId/shortener',
    access: 'member',
    summary: 'The connected link shortener, if any, and whether one can be connected',
    params: workspaceParams,
    responses: { 200: GetShortenerResponse },
  }),
  connectShortener: defineRoute({
    method: 'POST',
    path: '/api/v1/workspaces/:workspaceId/shortener/connect/:provider',
    access: 'accounts:connect',
    summary: 'Start connecting a link shortener: returns its sign-in URL',
    params: workspaceParams.extend({ provider: ShortenerProvider }),
    responses: { 200: StartConnectResponse },
  }),
  updateShortener: defineRoute({
    method: 'PATCH',
    path: '/api/v1/workspaces/:workspaceId/shortener',
    access: 'accounts:manage',
    summary: 'Turn shortening links at publish time on or off',
    params: workspaceParams,
    body: UpdateShortenerBody,
    responses: { 200: Shortener },
  }),
  disconnectShortener: defineRoute({
    method: 'DELETE',
    path: '/api/v1/workspaces/:workspaceId/shortener',
    access: 'accounts:manage',
    summary: 'Disconnect the link shortener (links already shortened keep working)',
    params: workspaceParams,
    responses: { 204: null },
  }),
  shortenLink: defineRoute({
    method: 'POST',
    path: '/api/v1/workspaces/:workspaceId/shortlinks',
    access: 'posts:create',
    summary: 'Shorten a link now (the same address gives the same short link)',
    params: workspaceParams,
    body: ShortenLinkBody,
    responses: { 200: ShortLink },
  }),
};
