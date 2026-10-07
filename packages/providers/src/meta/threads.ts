import type { ContentRules, PreviewSpec, ValidationIssue } from '@socioboard/contracts';

import { isProviderError, ProviderError } from '../errors';
import type { HttpClient } from '../http';
import type {
  AccountCredentials,
  ImagePrep,
  LoginAdapter,
  NetworkAdapter,
  PublishInput,
  PublishMedia,
  PublishResult,
  RateLimits,
  TokenSet,
} from '../types';
import { checkRules, issue, IssueCode } from '../validation';
import { classifyGraphError, type GraphClient } from './graph-client';

// Threads API (developers.facebook.com/docs/threads, checked 2026-10-07): a Threads use case on
// the Meta app, with its own app id and secret, signing in at threads.net and calling
// graph.threads.net/v1.0. P3-B10.

export const THREADS_API = 'https://graph.threads.net';
export const THREADS_API_VERSION = 'v1.0';

/** Read the profile, publish, and reply (the first comment is a reply to the post). */
export const THREADS_SCOPES = [
  'threads_basic',
  'threads_content_publish',
  'threads_manage_replies',
] as const;

const MB = 1024 * 1024;

/**
 * Posts: up to 500 characters (emoji count as their UTF-8 bytes: `threadsTextLength`); text
 * alone, or JPEG/PNG images up to 8 MB (aspect ratio up to 10:1) and MOV/MP4 videos up to 5
 * minutes and 1 GB; 2–20 of them make a carousel, images and videos mixed.
 */
export const THREADS_RULES: ContentRules = {
  maxChars: 500,
  maxHashtags: null,
  maxMentions: null,
  media: {
    required: false,
    maxItems: 20,
    kinds: ['image', 'video'],
    mixKinds: true,
    maxImageBytes: 8 * MB,
    imageAspectRatio: { min: 0.1, max: 10 },
    video: { minSec: 0, maxSec: 5 * 60, maxBytes: 1024 * MB },
  },
  links: 'card',
};

/** Images: JPEG or PNG, at most 1440 wide and 8 MB. */
export const THREADS_IMAGE_PREP: ImagePrep = {
  mimes: ['image/jpeg', 'image/png'],
  maxWidth: 1440,
  maxBytes: 8 * MB,
};

/** 250 API-published posts per profile in 24 hours (a carousel counts once). */
export const THREADS_RATE_LIMITS: RateLimits = {
  perAccount: [{ max: 250, perSec: 86_400 }],
  perApp: [],
};

export const THREADS_PREVIEW: PreviewSpec = {
  truncateAt: null,
  truncateLines: null,
  captionPosition: 'above_media',
  mediaLayout: 'carousel',
  cropAspectRatio: null,
  linkCard: true,
};

const REPLY_MAX = 500;

/**
 * Length as Threads counts it for its 500-character limit: one per character, except emoji,
 * which count as their UTF-8 bytes (Threads API posts guide).
 */
export function threadsTextLength(text: string): number {
  let n = 0;
  for (const ch of text) {
    n += /\p{Extended_Pictographic}/u.test(ch) ? Buffer.byteLength(ch, 'utf8') : 1;
  }
  return n;
}

export interface ThreadsOptions {
  /** How often to ask whether Threads has finished processing a container. */
  pollIntervalMs?: number;
  /** Longest wait for Threads to process one publish, then retry later. */
  maxWaitMs?: number;
  sleep?: (ms: number) => Promise<void>;
}

// ---------------------------------------------------------------------------------- login

export interface ThreadsLoginConfig {
  appId: string;
  appSecret: string;
  http: HttpClient;
  /** A graph.threads.net client. */
  graph: GraphClient;
}

interface TokenAnswer {
  access_token?: string;
  expires_in?: number;
  user_id?: string | number;
  error_message?: string;
}

interface Profile {
  id: string;
  username: string;
  name?: string;
  threads_profile_picture_url?: string;
}

/**
 * Threads login: a Threads profile signs in at threads.net; the login is the profile, so it lists
 * exactly one asset. Long-lived tokens last 60 days and refresh once they're a day old. Threads
 * reports no granted permissions: the ones asked for are assumed.
 */
export function createThreadsLogin(config: ThreadsLoginConfig): LoginAdapter {
  const { http, graph } = config;

  function fail(status: number, body: unknown): never {
    const c = classifyGraphError(status, body);
    const message = (body as TokenAnswer | null)?.error_message ?? c.message;
    throw new ProviderError({ ...c, kind: 'auth', message, status });
  }

  async function longLived(path: string, query: Record<string, string>): Promise<TokenSet> {
    const res = await http.request<TokenAnswer>({ url: `${THREADS_API}/${path}`, query });
    if (!res.ok || !res.body.access_token) fail(res.status, res.body);
    return {
      accessToken: res.body.access_token,
      refreshToken: null,
      expiresAt: res.body.expires_in ? new Date(Date.now() + res.body.expires_in * 1000) : null,
      scopes: [...THREADS_SCOPES],
    };
  }

  const profile = (tokens: TokenSet) =>
    graph.get<Profile>('me', tokens.accessToken, {
      fields: 'id,username,name,threads_profile_picture_url',
    });

  return {
    id: 'threads',
    networks: ['threads'],
    supportsAccountSelection: false,
    usesPkce: false,
    requiredScopes: ['threads_basic'],

    getAuthUrl({ state, redirectUri }) {
      const url = new URL('https://threads.net/oauth/authorize');
      url.searchParams.set('client_id', config.appId);
      url.searchParams.set('redirect_uri', redirectUri);
      url.searchParams.set('response_type', 'code');
      url.searchParams.set('scope', THREADS_SCOPES.join(','));
      url.searchParams.set('state', state);
      return url.toString();
    },

    async exchangeCode({ code, redirectUri }) {
      const res = await http.request<TokenAnswer>({
        method: 'POST',
        url: `${THREADS_API}/oauth/access_token`,
        form: {
          client_id: config.appId,
          client_secret: config.appSecret,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
          code,
        },
      });
      if (!res.ok || !res.body.access_token) fail(res.status, res.body);
      return longLived('access_token', {
        grant_type: 'th_exchange_token',
        client_secret: config.appSecret,
        access_token: res.body.access_token,
      });
    },

    refresh(tokens) {
      return longLived('refresh_access_token', {
        grant_type: 'th_refresh_token',
        access_token: tokens.accessToken,
      });
    },

    async getIdentity(tokens) {
      const me = await profile(tokens);
      return {
        externalUserId: me.id,
        displayName: (me.name ?? '').trim() || me.username,
        avatarUrl: me.threads_profile_picture_url ?? null,
      };
    },

    async listAssets(tokens) {
      const me = await profile(tokens);
      return [
        {
          network: 'threads',
          externalId: me.id,
          displayName: (me.name ?? '').trim() || me.username,
          username: me.username,
          avatarUrl: me.threads_profile_picture_url ?? null,
          // Posts with the login's own token.
          token: null,
          meta: { username: me.username },
          unavailableReason: tokens.scopes.includes('threads_content_publish')
            ? null
            : 'missing_permission',
        },
      ];
    },
  };
}

// -------------------------------------------------------------------------------- network

export function createThreads(graph: GraphClient, opts: ThreadsOptions = {}): NetworkAdapter {
  const pollIntervalMs = opts.pollIntervalMs ?? 3000;
  const maxWaitMs = opts.maxWaitMs ?? 10 * 60_000;
  const sleep = opts.sleep ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));

  /** Polls until Threads has processed the container (shared deadline per publish). */
  async function waitUntilReady(token: string, containerId: string, deadline: number) {
    for (;;) {
      const c = await graph.get<{ status?: string; error_message?: string }>(containerId, token, {
        fields: 'status,error_message',
      });
      if (c.status === 'FINISHED' || c.status === 'PUBLISHED') return;
      if (c.status === 'ERROR') {
        throw new ProviderError({
          kind: 'content',
          message: `Threads couldn't process this post${c.error_message ? `: ${c.error_message}` : ''}`,
          networkCode: 'container_error',
        });
      }
      if (c.status === 'EXPIRED' || Date.now() >= deadline) {
        throw new ProviderError({
          kind: 'retryable',
          message: 'Threads is still processing the post; trying again later',
          networkCode: c.status === 'EXPIRED' ? 'container_expired' : 'container_timeout',
        });
      }
      await sleep(pollIntervalMs);
    }
  }

  const create = async (account: AccountCredentials, fields: Record<string, string>) =>
    (await graph.post<{ id: string }>(`${account.externalId}/threads`, account.accessToken, fields))
      .id;

  function mediaFields(m: PublishMedia): Record<string, string> {
    if (!m.publicUrl) {
      throw new ProviderError({
        kind: 'content',
        networkCode: 'media_public_url_missing',
        message:
          'Threads fetches photos and videos from a public address, and this server has none (MEDIA_PUBLIC_URL)',
      });
    }
    return m.kind === 'video'
      ? { media_type: 'VIDEO', video_url: m.publicUrl }
      : {
          media_type: 'IMAGE',
          image_url: m.publicUrl,
          ...(m.altText ? { alt_text: m.altText } : {}),
        };
  }

  /** The text Threads gets: with photos or a video, the link goes at the end of it. */
  const textFor = (input: PublishInput) =>
    input.link && input.media.length > 0
      ? [input.text, input.link].filter((s) => s.trim() !== '').join('\n\n')
      : input.text;

  async function createContainer(input: PublishInput, account: AccountCredentials) {
    const deadline = Date.now() + maxWaitMs;
    const ready = async (id: string) => {
      await waitUntilReady(account.accessToken, id, deadline);
      return id;
    };
    const text = textFor(input);
    const common: Record<string, string> = {
      ...(text.trim() !== '' ? { text } : {}),
      ...(input.options.threads?.replyControl
        ? { reply_control: input.options.threads.replyControl }
        : {}),
    };
    const [first] = input.media;
    if (!first) {
      return ready(
        await create(account, {
          media_type: 'TEXT',
          ...common,
          ...(input.link ? { link_attachment: input.link } : {}),
        }),
      );
    }
    if (input.media.length === 1) {
      return ready(await create(account, { ...mediaFields(first), ...common }));
    }
    // Carousel: every item first (Threads processes them side by side), then the carousel.
    const children: string[] = [];
    for (const m of input.media) {
      children.push(await create(account, { ...mediaFields(m), is_carousel_item: 'true' }));
    }
    for (const child of children) await ready(child);
    return ready(
      await create(account, { media_type: 'CAROUSEL', children: children.join(','), ...common }),
    );
  }

  return {
    id: 'threads',
    displayName: 'Threads',
    capabilities: {
      postTypes: ['text', 'link', 'image', 'carousel', 'video'],
      firstComment: true,
      altText: true,
    },
    rules: THREADS_RULES,
    preview: THREADS_PREVIEW,
    imagePrep: THREADS_IMAGE_PREP,
    rateLimits: THREADS_RATE_LIMITS,

    validate(input) {
      const issues: ValidationIssue[] = checkRules(THREADS_RULES, input, 'Threads', {
        imagesRefitted: true,
      });
      if (input.text.trim() === '' && input.media.length === 0 && !input.link) {
        issues.push(
          issue('error', IssueCode.EMPTY_POST, 'A Threads post needs text, a photo or a video.', {
            field: 'text',
          }),
        );
      }
      // Emoji count as their UTF-8 bytes; the plain character count above can't see that.
      const counted = threadsTextLength(input.text);
      if (
        counted > THREADS_RULES.maxChars &&
        !issues.some((i) => i.code === IssueCode.TEXT_TOO_LONG)
      ) {
        issues.push(
          issue(
            'error',
            IssueCode.TEXT_TOO_LONG,
            `Threads allows ${String(THREADS_RULES.maxChars)} characters (an emoji counts as several); this has ${String(counted)}.`,
            { field: 'text', params: { max: THREADS_RULES.maxChars, actual: counted } },
          ),
        );
      }
      if (input.link && input.media.length > 0) {
        issues.push(
          issue(
            'warning',
            IssueCode.LINK_CARD_DROPPED,
            'Posts with photos or a video show no link preview; the link is added to the text.',
            { field: 'link' },
          ),
        );
      }
      if (input.firstComment && threadsTextLength(input.firstComment) > REPLY_MAX) {
        issues.push(
          issue(
            'error',
            IssueCode.FIRST_COMMENT_TOO_LONG,
            `Threads replies can be up to ${String(REPLY_MAX)} characters.`,
            { field: 'firstComment', params: { max: REPLY_MAX } },
          ),
        );
      }
      return issues;
    },

    async publish(input, account) {
      const token = account.accessToken;
      const creationId = await createContainer(input, account);
      const published = await graph.post<{ id: string }>(
        `${account.externalId}/threads_publish`,
        token,
        { creation_id: creationId },
      );
      const warnings: string[] = [];
      let permalink: string | null = null;
      try {
        permalink =
          (await graph.get<{ permalink?: string }>(published.id, token, { fields: 'permalink' }))
            .permalink ?? null;
      } catch {
        // Published; the link shows up on the next sync.
      }
      if (input.firstComment) {
        // The first comment is a reply to the post: a text container, then publish.
        try {
          const reply = await create(account, {
            media_type: 'TEXT',
            text: input.firstComment,
            reply_to_id: published.id,
          });
          await waitUntilReady(token, reply, Date.now() + maxWaitMs);
          await graph.post(`${account.externalId}/threads_publish`, token, { creation_id: reply });
        } catch (err) {
          warnings.push(
            `The first comment wasn't added: ${isProviderError(err) ? err.message : 'unknown error'}`,
          );
        }
      }
      return { externalId: published.id, permalink, warnings } satisfies PublishResult;
    },
  };
}
