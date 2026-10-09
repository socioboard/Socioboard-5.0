import { ProviderError } from '../errors';
import type { HttpClient } from '../http';
import type {
  AuthUrlInput,
  ExchangeCodeInput,
  LoginAdapter,
  LoginIdentity,
  ProviderAsset,
  TokenSet,
} from '../types';
import { tumblrError } from './errors';

export const TUMBLR_API = 'https://api.tumblr.com';
export const TUMBLR_AUTH_URL = 'https://www.tumblr.com/oauth2/authorize';

/**
 * OAuth 2.0 scopes for Tumblr:
 * - basic: read user and blog info
 * - write: create, edit, and delete posts
 * - offline_access: refresh tokens
 */
export const TUMBLR_SCOPES = ['basic', 'write', 'offline_access'] as const;

export interface TumblrLoginConfig {
  clientId: string;
  clientSecret: string;
  http: HttpClient;
}

interface TokenAnswer {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  token_type?: string;
}

interface TumblrBlog {
  name: string;
  title?: string;
  url?: string;
  uuid?: string;
  primary?: boolean;
  type?: string;
  avatar?: { width: number; height: number; url: string }[];
}

interface TumblrUser {
  name: string;
  likes?: number;
  following?: number;
  default_post_format?: string;
  blogs?: TumblrBlog[];
}

interface UserInfoResponse {
  meta?: { status: number; msg: string };
  response?: {
    user?: TumblrUser;
  };
}

export function createTumblrLogin(config: TumblrLoginConfig): LoginAdapter {
  const { http } = config;

  async function token(form: Record<string, string>, keepScopes?: string[]): Promise<TokenSet> {
    const res = await http.request<TokenAnswer>({
      method: 'POST',
      url: `${TUMBLR_API}/v2/oauth2/token`,
      form: {
        client_id: config.clientId,
        client_secret: config.clientSecret,
        ...form,
      },
    });

    if (!res.ok || !res.body.access_token) {
      const err = tumblrError(res, 'sign-in');
      throw res.status === 400 || res.status === 401
        ? new ProviderError({
            kind: 'auth',
            message: err.message,
            status: res.status,
            networkCode: err.networkCode,
          })
        : err;
    }

    return {
      accessToken: res.body.access_token,
      refreshToken: res.body.refresh_token ?? null,
      expiresAt: res.body.expires_in ? new Date(Date.now() + res.body.expires_in * 1000) : null,
      scopes: res.body.scope ? res.body.scope.split(/[\s,]+/).filter(Boolean) : (keepScopes ?? []),
    };
  }

  async function getUserInfo(tokens: TokenSet): Promise<TumblrUser> {
    const res = await http.request<UserInfoResponse>({
      method: 'GET',
      url: `${TUMBLR_API}/v2/user/info`,
      headers: { authorization: `Bearer ${tokens.accessToken}` },
    });

    if (!res.ok || !res.body.response?.user) {
      throw tumblrError(res, 'reading user info');
    }

    return res.body.response.user;
  }

  return {
    id: 'tumblr',
    networks: ['tumblr'],
    supportsAccountSelection: false,
    usesPkce: false,
    requiredScopes: ['basic', 'write'],

    getAuthUrl({ state, redirectUri }: AuthUrlInput): string {
      const url = new URL(TUMBLR_AUTH_URL);
      url.searchParams.set('client_id', config.clientId);
      url.searchParams.set('response_type', 'code');
      url.searchParams.set('scope', TUMBLR_SCOPES.join(' '));
      url.searchParams.set('state', state);
      url.searchParams.set('redirect_uri', redirectUri);
      return url.toString();
    },

    async exchangeCode({ code, redirectUri }: ExchangeCodeInput): Promise<TokenSet> {
      return token(
        {
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
        },
        [...TUMBLR_SCOPES],
      );
    },

    async refresh(tokens: TokenSet): Promise<TokenSet> {
      if (!tokens.refreshToken) {
        throw new ProviderError({
          kind: 'auth',
          message: 'Tumblr: No refresh token available to renew credentials',
        });
      }
      return token(
        {
          grant_type: 'refresh_token',
          refresh_token: tokens.refreshToken,
        },
        tokens.scopes,
      );
    },

    async getIdentity(tokens: TokenSet): Promise<LoginIdentity> {
      const user = await getUserInfo(tokens);
      const primaryBlog = user.blogs?.find((b) => b.primary) ?? user.blogs?.[0];
      const avatarUrl =
        primaryBlog?.avatar?.[0]?.url ??
        (primaryBlog?.name
          ? `${TUMBLR_API}/v2/blog/${primaryBlog.name}.tumblr.com/avatar/512`
          : null);

      return {
        externalUserId: user.name,
        displayName: user.name,
        avatarUrl,
      };
    },

    async listAssets(tokens: TokenSet): Promise<ProviderAsset[]> {
      const user = await getUserInfo(tokens);
      const blogs = user.blogs ?? [];

      return blogs.map((blog) => {
        const displayName = (
          blog.title && blog.title.trim().length > 0 ? blog.title : blog.name
        ).trim();
        const avatarUrl =
          blog.avatar?.[0]?.url ?? `${TUMBLR_API}/v2/blog/${blog.name}.tumblr.com/avatar/512`;

        return {
          network: 'tumblr',
          externalId: blog.name,
          displayName,
          username: blog.name,
          avatarUrl,
          token: null,
          meta: {
            blogName: blog.name,
            uuid: blog.uuid,
            url: blog.url,
            primary: Boolean(blog.primary),
          },
          unavailableReason: null,
        };
      });
    },
  };
}
