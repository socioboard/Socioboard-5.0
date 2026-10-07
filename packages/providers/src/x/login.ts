import { ProviderError } from '../errors';
import type { HttpClient } from '../http';
import type { LoginAdapter, TokenSet } from '../types';
import { xError } from './errors';

export const X_API = 'https://api.x.com';

/**
 * OAuth 2.0 scopes (docs.x.com, checked 2026-10-06): read the account, post, upload media, and
 * `offline.access` for a refresh token (access tokens last two hours).
 */
export const X_SCOPES = [
  'tweet.read',
  'tweet.write',
  'users.read',
  'media.write',
  'offline.access',
] as const;

export interface XLoginConfig {
  clientId: string;
  clientSecret: string;
  http: HttpClient;
}

interface TokenAnswer {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
}

interface Me {
  data?: { id: string; name: string; username: string; profile_image_url?: string };
}

/**
 * X login (OAuth 2.0 authorization code with PKCE, a confidential client). One login is one X
 * account, so it lists exactly that account. X offers no account picker: connecting a second
 * account means signing out of X in the browser first.
 */
export function createXLogin(config: XLoginConfig): LoginAdapter {
  const { http } = config;
  const basic = `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')}`;

  async function token(form: Record<string, string>, keepScopes?: string[]): Promise<TokenSet> {
    const res = await http.request<TokenAnswer>({
      method: 'POST',
      url: `${X_API}/2/oauth2/token`,
      form: { ...form, client_id: config.clientId },
      headers: { authorization: basic },
    });
    if (!res.ok || !res.body.access_token) {
      const err = xError(res, 'sign-in');
      // A code or refresh token X refuses (expired, used, revoked) means signing in again.
      throw res.status === 400 || res.status === 401
        ? new ProviderError({ kind: 'auth', message: err.message, status: res.status })
        : err;
    }
    return {
      accessToken: res.body.access_token,
      refreshToken: res.body.refresh_token ?? null,
      expiresAt: res.body.expires_in ? new Date(Date.now() + res.body.expires_in * 1000) : null,
      scopes: res.body.scope ? res.body.scope.split(' ').filter(Boolean) : (keepScopes ?? []),
    };
  }

  async function me(tokens: TokenSet) {
    const res = await http.request<Me>({
      url: `${X_API}/2/users/me`,
      query: { 'user.fields': 'profile_image_url' },
      headers: { authorization: `Bearer ${tokens.accessToken}` },
    });
    if (!res.ok || !res.body.data) throw xError(res, 'reading the account');
    return res.body.data;
  }

  return {
    id: 'x',
    networks: ['x'],
    supportsAccountSelection: false,
    usesPkce: true,
    requiredScopes: ['users.read', 'tweet.write'],

    getAuthUrl({ state, redirectUri, pkce }) {
      if (!pkce) throw new Error('X sign-in needs PKCE');
      const url = new URL('https://x.com/i/oauth2/authorize');
      url.searchParams.set('response_type', 'code');
      url.searchParams.set('client_id', config.clientId);
      url.searchParams.set('redirect_uri', redirectUri);
      url.searchParams.set('scope', X_SCOPES.join(' '));
      url.searchParams.set('state', state);
      url.searchParams.set('code_challenge', pkce.challenge);
      url.searchParams.set('code_challenge_method', 'S256');
      return url.toString();
    },

    async exchangeCode({ code, redirectUri, pkce }) {
      if (!pkce) throw new Error('X sign-in needs PKCE');
      return token({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        code_verifier: pkce.verifier,
      });
    },

    async refresh(tokens) {
      if (!tokens.refreshToken) {
        throw new ProviderError({
          kind: 'auth',
          message: 'X gave no refresh token; sign in again',
        });
      }
      // X hands out a new refresh token each time; the old one stops working.
      return token(
        { grant_type: 'refresh_token', refresh_token: tokens.refreshToken },
        tokens.scopes,
      );
    },

    async getIdentity(tokens) {
      const user = await me(tokens);
      return {
        externalUserId: user.id,
        displayName: user.name.trim() || user.username,
        avatarUrl: user.profile_image_url ?? null,
      };
    },

    async listAssets(tokens) {
      const user = await me(tokens);
      return [
        {
          network: 'x',
          externalId: user.id,
          displayName: user.name.trim() || user.username,
          username: user.username,
          avatarUrl: user.profile_image_url ?? null,
          // Posts with the login's own token.
          token: null,
          meta: { username: user.username },
          unavailableReason:
            tokens.scopes.includes('tweet.write') && tokens.scopes.includes('media.write')
              ? null
              : 'missing_permission',
        },
      ];
    },
  };
}
