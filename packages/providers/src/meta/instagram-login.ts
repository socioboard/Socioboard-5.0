import { ProviderError } from '../errors';
import type { HttpClient } from '../http';
import type { LoginAdapter, TokenSet } from '../types';
import { classifyGraphError, type GraphClient } from './graph-client';

/** Instagram API with Instagram Login (developers.facebook.com, checked 2026-09-29). */
export const INSTAGRAM_SCOPES = [
  'instagram_business_basic',
  'instagram_business_content_publish',
  'instagram_business_manage_comments',
] as const;

export interface InstagramLoginConfig {
  appId: string;
  appSecret: string;
  http: HttpClient;
  /** A graph.instagram.com client. */
  graph: GraphClient;
}

interface IgTokenAnswer {
  access_token?: string;
  expires_in?: number;
  user_id?: string | number;
  permissions?: string | string[];
  data?: { access_token?: string; user_id?: string | number; permissions?: string | string[] }[];
  error_message?: string;
}

const list = (p: string | string[] | undefined) =>
  Array.isArray(p) ? p : (p ?? '').split(',').filter(Boolean);

/**
 * Instagram Login: an Instagram professional account signs in directly (no Facebook Page
 * needed). The login is the account, so it lists exactly one asset. Tokens last 60 days and can
 * be refreshed once they're a day old.
 */
export function createInstagramLogin(config: InstagramLoginConfig): LoginAdapter {
  const { http, graph } = config;

  function fail(status: number, body: unknown): never {
    const c = classifyGraphError(status, body);
    const message = (body as IgTokenAnswer | null)?.error_message ?? c.message;
    throw new ProviderError({ ...c, kind: 'auth', message, status });
  }

  async function longLived(query: Record<string, string>, path: string, scopes: string[]) {
    const res = await http.request<IgTokenAnswer>({
      url: `https://graph.instagram.com/${path}`,
      query,
    });
    if (!res.ok || !res.body.access_token) fail(res.status, res.body);
    return {
      accessToken: res.body.access_token,
      refreshToken: null,
      expiresAt: res.body.expires_in ? new Date(Date.now() + res.body.expires_in * 1000) : null,
      scopes,
    } satisfies TokenSet;
  }

  return {
    id: 'instagram',
    networks: ['instagram'],
    // force_reauth makes Instagram ask for credentials instead of reusing the signed-in account.
    supportsAccountSelection: true,
    usesPkce: false,
    requiredScopes: ['instagram_business_basic'],

    getAuthUrl({ state, redirectUri, forceAccountSelection }) {
      const url = new URL('https://www.instagram.com/oauth/authorize');
      url.searchParams.set('client_id', config.appId);
      url.searchParams.set('redirect_uri', redirectUri);
      url.searchParams.set('response_type', 'code');
      url.searchParams.set('scope', INSTAGRAM_SCOPES.join(','));
      url.searchParams.set('state', state);
      if (forceAccountSelection) url.searchParams.set('force_reauth', 'true');
      return url.toString();
    },

    async exchangeCode({ code, redirectUri }) {
      const res = await http.request<IgTokenAnswer>({
        method: 'POST',
        url: 'https://api.instagram.com/oauth/access_token',
        form: {
          client_id: config.appId,
          client_secret: config.appSecret,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
          code,
        },
      });
      // Answered either flat or wrapped in `data`, depending on the API generation.
      const short = res.body.data?.[0] ?? res.body;
      if (!res.ok || !short.access_token) fail(res.status, res.body);
      return longLived(
        {
          grant_type: 'ig_exchange_token',
          client_secret: config.appSecret,
          access_token: short.access_token,
        },
        'access_token',
        list(short.permissions),
      );
    },

    refresh(tokens) {
      return longLived(
        { grant_type: 'ig_refresh_token', access_token: tokens.accessToken },
        'refresh_access_token',
        tokens.scopes,
      );
    },

    async getIdentity(tokens) {
      const me = await igMe(graph, tokens);
      return {
        externalUserId: me.user_id,
        displayName: me.name ?? me.username,
        avatarUrl: me.profile_picture_url ?? null,
      };
    },

    async listAssets(tokens) {
      const me = await igMe(graph, tokens);
      return [
        {
          network: 'instagram',
          externalId: me.user_id,
          displayName: me.name ?? me.username,
          username: me.username,
          avatarUrl: me.profile_picture_url ?? null,
          // Posts with the login's own token.
          token: null,
          meta: { via: 'instagram' },
          unavailableReason: tokens.scopes.includes('instagram_business_content_publish')
            ? null
            : 'missing_permission',
        },
      ];
    },
  };
}

async function igMe(graph: GraphClient, tokens: TokenSet) {
  const me = await graph.get<{
    user_id: string | number;
    username: string;
    name?: string;
    profile_picture_url?: string;
  }>('me', tokens.accessToken, { fields: 'user_id,username,name,profile_picture_url' });
  // user_id is the professional account id used for publishing; ids can arrive as numbers.
  return { ...me, user_id: String(me.user_id) };
}
