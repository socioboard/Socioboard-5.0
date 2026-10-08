import { ProviderError } from '../errors';
import type { HttpClient } from '../http';
import type { LoginAdapter, TokenSet } from '../types';
import { linkedinError } from './errors';

export const LINKEDIN_API = 'https://api.linkedin.com';
const LINKEDIN_OAUTH = 'https://www.linkedin.com/oauth/v2';

/**
 * OAuth 2.0 scopes (learn.microsoft.com/linkedin, checked 2026-10-08): `openid` and `profile` from
 * "Sign In with LinkedIn using OpenID Connect" (who signed in, their name and photo),
 * `w_member_social` from "Share on LinkedIn" (post as them). No `email`: we don't use it, and
 * LinkedIn asks apps to request as few scopes as they need.
 */
export const LINKEDIN_SCOPES = ['openid', 'profile', 'w_member_social'] as const;

export interface LinkedInLoginConfig {
  clientId: string;
  clientSecret: string;
  http: HttpClient;
}

interface TokenAnswer {
  access_token?: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
}

/** OpenID Connect userinfo: `sub` is the member id, the `<id>` of `urn:li:person:<id>`. */
interface UserInfo {
  sub?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}

/**
 * LinkedIn login (OAuth 2.0 authorization code, a confidential client: no PKCE, the secret goes in
 * the token request). Tokens last 60 days and can't be refreshed by apps outside LinkedIn's partner
 * programs, so there's no `refresh`: the social-accounts jobs mark the login for reconnecting when
 * it expires. One login is one member; it lists their own profile (company pages: P3-B1 part 2).
 * LinkedIn offers no account picker: connecting another member means signing out of LinkedIn first.
 */
export function createLinkedInLogin(config: LinkedInLoginConfig): LoginAdapter {
  const { http } = config;

  async function me(tokens: TokenSet) {
    const res = await http.request<UserInfo>({
      url: `${LINKEDIN_API}/v2/userinfo`,
      headers: { authorization: `Bearer ${tokens.accessToken}` },
    });
    const user = res.body;
    const { sub } = user;
    if (!res.ok || !sub) throw linkedinError(res, 'reading the profile');
    // The full name, else first + last (both come with the `profile` scope), else a placeholder.
    const name =
      [user.name, [user.given_name, user.family_name].filter(Boolean).join(' ')]
        .map((s) => (s ?? '').trim())
        .find((s) => s !== '') ?? 'LinkedIn member';
    return { id: sub, name, picture: user.picture ?? null };
  }

  return {
    id: 'linkedin',
    networks: ['linkedin_person'],
    supportsAccountSelection: false,
    usesPkce: false,
    requiredScopes: ['openid', 'profile', 'w_member_social'],

    getAuthUrl({ state, redirectUri }) {
      const url = new URL(`${LINKEDIN_OAUTH}/authorization`);
      url.searchParams.set('response_type', 'code');
      url.searchParams.set('client_id', config.clientId);
      url.searchParams.set('redirect_uri', redirectUri);
      url.searchParams.set('state', state);
      url.searchParams.set('scope', LINKEDIN_SCOPES.join(' '));
      return url.toString();
    },

    async exchangeCode({ code, redirectUri }) {
      const res = await http.request<TokenAnswer>({
        method: 'POST',
        url: `${LINKEDIN_OAUTH}/accessToken`,
        form: {
          grant_type: 'authorization_code',
          code,
          client_id: config.clientId,
          client_secret: config.clientSecret,
          redirect_uri: redirectUri,
        },
      });
      if (!res.ok || !res.body.access_token) {
        const err = linkedinError(res, 'sign-in');
        // A code LinkedIn refuses (expired after 30 minutes, used, wrong redirect) means signing in again.
        throw res.status === 400 || res.status === 401
          ? new ProviderError({ kind: 'auth', message: err.message, status: res.status })
          : err;
      }
      return {
        accessToken: res.body.access_token,
        refreshToken: res.body.refresh_token ?? null,
        expiresAt: res.body.expires_in ? new Date(Date.now() + res.body.expires_in * 1000) : null,
        // Documented as space-delimited, seen comma-delimited; a member can't untick single
        // scopes, so an answer without `scope` granted what we asked for.
        scopes: res.body.scope
          ? res.body.scope.split(/[\s,]+/).filter(Boolean)
          : [...LINKEDIN_SCOPES],
      };
    },

    async getIdentity(tokens) {
      const user = await me(tokens);
      return { externalUserId: user.id, displayName: user.name, avatarUrl: user.picture };
    },

    async listAssets(tokens) {
      const user = await me(tokens);
      return [
        {
          network: 'linkedin_person',
          // The member id; publishing posts as `urn:li:person:<externalId>`.
          externalId: user.id,
          displayName: user.name,
          // LinkedIn's API doesn't give the public profile handle with these scopes.
          username: null,
          avatarUrl: user.picture,
          // Posts with the login's own token.
          token: null,
          meta: {},
          unavailableReason: tokens.scopes.includes('w_member_social')
            ? null
            : 'missing_permission',
        },
      ];
    },
  };
}
