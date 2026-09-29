import { ProviderError } from '../errors';
import type { HttpClient } from '../http';
import type { LoginAdapter, ProviderAsset, TokenSet } from '../types';
import { classifyGraphError, DEFAULT_GRAPH_VERSION, type GraphClient } from './graph-client';

/**
 * Permissions asked for when no Login for Business configuration is set (META_LOGIN_CONFIG_ID
 * holds the same list on Meta's side). docs/developer-apps.md#meta-facebook-pages--instagram.
 */
export const FACEBOOK_SCOPES = [
  'pages_show_list',
  'pages_read_engagement',
  'pages_manage_posts',
  'pages_manage_engagement',
  'business_management',
  'instagram_basic',
  'instagram_content_publish',
  'instagram_manage_comments',
] as const;

/** Page tasks that allow posting as the Page. */
const POSTING_TASKS = new Set(['CREATE_CONTENT', 'MANAGE']);

interface PageNode {
  id: string;
  name: string;
  username?: string;
  picture?: { data?: { url?: string } };
  access_token?: string;
  tasks?: string[];
  instagram_business_account?: {
    id: string;
    username?: string;
    name?: string;
    profile_picture_url?: string;
  };
}

const PAGE_FIELDS =
  'id,name,username,picture.width(200).height(200){url},access_token,tasks,' +
  'instagram_business_account{id,username,name,profile_picture_url}';

export interface FacebookLoginConfig {
  appId: string;
  appSecret: string;
  /** Facebook Login for Business configuration (User access token type); else `scope` is sent. */
  configId?: string | undefined;
  version?: string | undefined;
  http: HttpClient;
  graph: GraphClient;
}

/**
 * Facebook Login for Business: signs in a Facebook user, trades the code for a 60-day user token
 * and lists their Pages (with Page tokens, which don't expire when made from a long-lived user
 * token) and the Instagram professional accounts linked to those Pages.
 */
export function createFacebookLogin(config: FacebookLoginConfig): LoginAdapter {
  const version = config.version ?? DEFAULT_GRAPH_VERSION;
  const { http, graph } = config;

  async function tokenCall(query: Record<string, string>) {
    const res = await http.request<{ access_token?: string; expires_in?: number }>({
      url: `https://graph.facebook.com/${version}/oauth/access_token`,
      query: { client_id: config.appId, client_secret: config.appSecret, ...query },
    });
    if (!res.ok || !res.body.access_token) {
      const c = classifyGraphError(res.status, res.body);
      // A code that can't be exchanged means signing in again, whatever Meta's code says.
      throw new ProviderError({ ...c, kind: 'auth', status: res.status });
    }
    return { token: res.body.access_token, expiresIn: res.body.expires_in ?? null };
  }

  return {
    id: 'facebook',
    networks: ['facebook_page', 'instagram'],
    // Facebook has no account picker: a second login means signing out of Facebook first.
    supportsAccountSelection: false,
    usesPkce: false,
    // Without it Meta lists no Pages at all; per-asset permissions show in the picker.
    requiredScopes: ['pages_show_list'],

    getAuthUrl({ state, redirectUri }) {
      const url = new URL(`https://www.facebook.com/${version}/dialog/oauth`);
      url.searchParams.set('client_id', config.appId);
      url.searchParams.set('redirect_uri', redirectUri);
      url.searchParams.set('state', state);
      url.searchParams.set('response_type', 'code');
      if (config.configId) url.searchParams.set('config_id', config.configId);
      else url.searchParams.set('scope', FACEBOOK_SCOPES.join(','));
      // Ask again for permissions the person declined last time.
      url.searchParams.set('auth_type', 'rerequest');
      return url.toString();
    },

    async exchangeCode({ code, redirectUri }) {
      const short = await tokenCall({ code, redirect_uri: redirectUri });
      const long = await tokenCall({
        grant_type: 'fb_exchange_token',
        fb_exchange_token: short.token,
      });
      const granted = await graph.getAll<{ permission: string; status: string }>(
        'me/permissions',
        long.token,
      );
      return {
        accessToken: long.token,
        refreshToken: null,
        expiresAt: long.expiresIn ? new Date(Date.now() + long.expiresIn * 1000) : null,
        scopes: granted.filter((p) => p.status === 'granted').map((p) => p.permission),
      };
    },

    async getIdentity(tokens) {
      const me = await graph.get<{
        id: string;
        name: string;
        picture?: { data?: { url?: string } };
      }>('me', tokens.accessToken, { fields: 'id,name,picture.width(200).height(200){url}' });
      return {
        externalUserId: me.id,
        displayName: me.name,
        avatarUrl: me.picture?.data?.url ?? null,
      };
    },

    async listAssets(tokens) {
      const pages = await graph.getAll<PageNode>('me/accounts', tokens.accessToken, {
        fields: PAGE_FIELDS,
        limit: 100,
      });
      return pages.flatMap((page) => pageAssets(page, tokens));
    },
  };
}

function pageAssets(page: PageNode, tokens: TokenSet): ProviderAsset[] {
  const has = (scope: string) => tokens.scopes.includes(scope);
  const token = page.access_token ? { accessToken: page.access_token, expiresAt: null } : null;
  // No `tasks` in the answer means unknown: allow it, and let publishing report a real refusal.
  const canPost = page.tasks === undefined || page.tasks.some((t) => POSTING_TASKS.has(t));
  const assets: ProviderAsset[] = [
    {
      network: 'facebook_page',
      externalId: page.id,
      displayName: page.name,
      username: page.username ?? null,
      avatarUrl: page.picture?.data?.url ?? null,
      token,
      meta: {},
      unavailableReason:
        canPost && token && has('pages_manage_posts') ? null : 'missing_permission',
    },
  ];
  const ig = page.instagram_business_account;
  if (ig) {
    assets.push({
      network: 'instagram',
      externalId: ig.id,
      displayName: ig.name ?? ig.username ?? ig.id,
      username: ig.username ?? null,
      avatarUrl: ig.profile_picture_url ?? null,
      // Instagram accounts reached through a Page publish with that Page's token.
      token,
      meta: { via: 'facebook', pageId: page.id },
      unavailableReason:
        token && has('instagram_basic') && has('instagram_content_publish')
          ? null
          : 'missing_permission',
    });
  }
  return assets;
}
