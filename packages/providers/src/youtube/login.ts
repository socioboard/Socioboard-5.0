import { ProviderError } from '../errors';
import type { HttpClient } from '../http';
import type { LoginAdapter, TokenSet } from '../types';
import { youtubeError } from './errors';

export const YOUTUBE_API = 'https://www.googleapis.com/youtube/v3';
export const GOOGLE_OAUTH_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
export const GOOGLE_OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token';

/**
 * YouTube OAuth 2.0 scopes (developer-apps.md, checked 2026-10-09).
 * Sensitive scopes that require Google OAuth Verification before production.
 */
export const YOUTUBE_SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube.readonly',
] as const;

export interface YouTubeLoginConfig {
  clientId: string;
  clientSecret: string;
  http: HttpClient;
}

interface GoogleTokenResponse {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  token_type?: string;
}

interface ChannelItem {
  id: string;
  snippet?: {
    title: string;
    description?: string;
    customUrl?: string;
    thumbnails?: {
      default?: { url?: string };
      medium?: { url?: string };
      high?: { url?: string };
    };
  };
}

interface ChannelsResponse {
  items?: ChannelItem[];
}

/**
 * Google / YouTube login adapter.
 * Uses Google OAuth 2.0 with offline access (refresh token) and account selection.
 */
export function createYouTubeLogin(config: YouTubeLoginConfig): LoginAdapter {
  const { http } = config;

  async function token(form: Record<string, string>, keepScopes?: string[]): Promise<TokenSet> {
    const res = await http.request<GoogleTokenResponse>({
      method: 'POST',
      url: GOOGLE_OAUTH_TOKEN_URL,
      form: {
        ...form,
        client_id: config.clientId,
        client_secret: config.clientSecret,
      },
    });

    if (!res.ok || !res.body.access_token) {
      const err = youtubeError(res, 'sign-in');
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

  async function getChannels(tokens: TokenSet): Promise<ChannelItem[]> {
    const res = await http.request<ChannelsResponse>({
      url: `${YOUTUBE_API}/channels`,
      query: { part: 'snippet', mine: 'true' },
      headers: { authorization: `Bearer ${tokens.accessToken}` },
    });

    if (!res.ok || !res.body.items) {
      throw youtubeError(res, 'reading channel information');
    }

    return res.body.items;
  }

  return {
    id: 'youtube',
    networks: ['youtube'],
    supportsAccountSelection: true,
    usesPkce: true,
    requiredScopes: [...YOUTUBE_SCOPES],

    getAuthUrl({ state, redirectUri, pkce, forceAccountSelection }) {
      const url = new URL(GOOGLE_OAUTH_AUTH_URL);
      url.searchParams.set('response_type', 'code');
      url.searchParams.set('client_id', config.clientId);
      url.searchParams.set('redirect_uri', redirectUri);
      url.searchParams.set('scope', YOUTUBE_SCOPES.join(' '));
      url.searchParams.set('state', state);
      url.searchParams.set('access_type', 'offline');
      url.searchParams.set('include_granted_scopes', 'true');
      url.searchParams.set('prompt', forceAccountSelection ? 'select_account consent' : 'consent');

      if (pkce) {
        url.searchParams.set('code_challenge', pkce.challenge);
        url.searchParams.set('code_challenge_method', 'S256');
      }

      return url.toString();
    },

    async exchangeCode({ code, redirectUri, pkce }) {
      return token({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        ...(pkce ? { code_verifier: pkce.verifier } : {}),
      });
    },

    async refresh(tokens) {
      if (!tokens.refreshToken) {
        throw new ProviderError({
          kind: 'auth',
          message: 'YouTube gave no refresh token; sign in again',
        });
      }

      const refreshed = await token(
        {
          grant_type: 'refresh_token',
          refresh_token: tokens.refreshToken,
        },
        tokens.scopes,
      );

      // Preserve existing refresh token if Google didn't return a new one
      return {
        ...refreshed,
        refreshToken: refreshed.refreshToken ?? tokens.refreshToken,
      };
    },

    async getIdentity(tokens) {
      const channels = await getChannels(tokens);
      const primary = channels[0];
      if (!primary) {
        throw new ProviderError({
          kind: 'auth',
          message: 'No YouTube channels found for this Google account',
        });
      }

      const title = primary.snippet?.title.trim();
      return {
        externalUserId: primary.id,
        displayName: title && title !== '' ? title : primary.id,
        avatarUrl: primary.snippet?.thumbnails?.default?.url ?? null,
      };
    },

    async listAssets(tokens) {
      const channels = await getChannels(tokens);
      if (channels.length === 0) {
        return [];
      }

      return channels.map((channel) => {
        const title = channel.snippet?.title.trim();
        const displayName = title && title !== '' ? title : channel.id;
        const customUrl = channel.snippet?.customUrl ?? null;
        const avatarUrl = channel.snippet?.thumbnails?.default?.url ?? null;

        return {
          network: 'youtube',
          externalId: channel.id,
          displayName,
          username: customUrl,
          avatarUrl,
          token: null, // Posts with the login token
          meta: { customUrl },
          unavailableReason: null,
        };
      });
    },
  };
}
