import { ProviderError } from '../errors';
import type { HttpClient } from '../http';
import type { LoginAdapter, TokenSet } from '../types';
import { pinterestError } from './errors';

/** Pinterest's API. Apps with Trial access create pins only in the sandbox (its own tokens too). */
export const PINTEREST_API = 'https://api.pinterest.com/v5';
export const PINTEREST_SANDBOX_API = 'https://api-sandbox.pinterest.com/v5';

/**
 * OAuth 2.0 scopes, each one required by a call we make (the `security` of each operation in
 * Pinterest's OpenAPI spec v5.28.0, checked 2026-10-09): `user_accounts:read` for who signed in;
 * `boards:read` for the board picker; creating a pin needs `boards:read`, `boards:write`,
 * `pins:read` and `pins:write` (a pin is a write to its board). No `*_secret` scopes: secret
 * boards aren't offered.
 */
export const PINTEREST_SCOPES = [
  'user_accounts:read',
  'boards:read',
  'boards:write',
  'pins:read',
  'pins:write',
] as const;

export interface PinterestLoginConfig {
  clientId: string;
  clientSecret: string;
  http: HttpClient;
  /** PINTEREST_API, or PINTEREST_SANDBOX_API while the app has Trial access. */
  api: string;
}

interface TokenAnswer {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
}

/** `GET /v5/user_account`: the Pinterest account the token belongs to. */
interface UserAccount {
  id?: string;
  username?: string;
  business_name?: string | null;
  profile_image?: string;
  account_type?: 'PINNER' | 'BUSINESS';
}

/** The trimmed text, or null when there's none (Pinterest's `business_name` may be null). */
function filled(s: string | null | undefined): string | null {
  const trimmed = s?.trim() ?? '';
  return trimmed === '' ? null : trimmed;
}

/**
 * Pinterest login (OAuth 2.0 authorization code, a confidential client: no PKCE, the app id and
 * secret go as HTTP Basic on the token request). Access tokens last 30 days; refresh tokens 60
 * days, and Pinterest hands out a new one on every refresh, so the social-accounts code stores
 * what `refresh` returns. One login is one Pinterest account, and it lists exactly that account:
 * boards are chosen per post (`optionChoices`), not connected as accounts. Pinterest offers no
 * account picker: connecting another account means signing out of Pinterest first.
 */
export function createPinterestLogin(config: PinterestLoginConfig): LoginAdapter {
  const { http, api } = config;
  const basic = `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')}`;

  /** The token endpoint, for both the first exchange and every refresh. */
  async function token(form: Record<string, string>, keep?: TokenSet): Promise<TokenSet> {
    const res = await http.request<TokenAnswer>({
      method: 'POST',
      url: `${api}/oauth/token`,
      form,
      headers: { authorization: basic },
    });
    if (!res.ok || !res.body.access_token) {
      const err = pinterestError(res, 'sign-in');
      // A code or refresh token Pinterest refuses (expired, used, revoked) means signing in again.
      throw res.status === 400 || res.status === 401
        ? new ProviderError({ kind: 'auth', message: err.message, status: res.status })
        : err;
    }
    return {
      accessToken: res.body.access_token,
      // On a refresh, keep the old refresh token if Pinterest didn't send a new one.
      refreshToken: res.body.refresh_token ?? keep?.refreshToken ?? null,
      expiresAt: res.body.expires_in ? new Date(Date.now() + res.body.expires_in * 1000) : null,
      // Pinterest's docs show both commas and spaces between scopes.
      scopes: res.body.scope
        ? res.body.scope.split(/[\s,]+/).filter(Boolean)
        : (keep?.scopes ?? [...PINTEREST_SCOPES]),
    };
  }

  async function me(tokens: TokenSet) {
    const res = await http.request<UserAccount>({
      url: `${api}/user_account`,
      headers: { authorization: `Bearer ${tokens.accessToken}` },
    });
    const user = res.body;
    if (!res.ok || !user.id) throw pinterestError(res, 'reading the account');
    const username = filled(user.username);
    return {
      id: user.id,
      username,
      // A business account's name, else the username, else a placeholder.
      name: filled(user.business_name) ?? username ?? 'Pinterest account',
      picture: user.profile_image ?? null,
      accountType: user.account_type ?? null,
    };
  }

  return {
    id: 'pinterest',
    networks: ['pinterest'],
    supportsAccountSelection: false,
    usesPkce: false,
    // Without these the account can't even be read; missing write scopes mark it unavailable.
    requiredScopes: ['user_accounts:read', 'boards:read'],

    getAuthUrl({ state, redirectUri }) {
      // The consent page is on pinterest.com in the sandbox too; only the API host differs.
      const url = new URL('https://www.pinterest.com/oauth/');
      url.searchParams.set('response_type', 'code');
      url.searchParams.set('client_id', config.clientId);
      url.searchParams.set('redirect_uri', redirectUri);
      url.searchParams.set('state', state);
      url.searchParams.set('scope', PINTEREST_SCOPES.join(','));
      return url.toString();
    },

    exchangeCode({ code, redirectUri }) {
      return token({ grant_type: 'authorization_code', code, redirect_uri: redirectUri });
    },

    async refresh(tokens) {
      if (!tokens.refreshToken) {
        throw new ProviderError({
          kind: 'auth',
          message: 'Pinterest gave no refresh token; sign in again',
        });
      }
      return token({ grant_type: 'refresh_token', refresh_token: tokens.refreshToken }, tokens);
    },

    async getIdentity(tokens) {
      const user = await me(tokens);
      return { externalUserId: user.id, displayName: user.name, avatarUrl: user.picture };
    },

    async listAssets(tokens) {
      const user = await me(tokens);
      return [
        {
          network: 'pinterest',
          externalId: user.id,
          displayName: user.name,
          username: user.username,
          avatarUrl: user.picture,
          // Posts with the login's own token.
          token: null,
          meta: { accountType: user.accountType },
          // Creating a pin needs all three; without them the account is listed but can't post.
          unavailableReason: (['boards:read', 'boards:write', 'pins:write'] as const).every((s) =>
            tokens.scopes.includes(s),
          )
            ? null
            : 'missing_permission',
        },
      ];
    },
  };
}
