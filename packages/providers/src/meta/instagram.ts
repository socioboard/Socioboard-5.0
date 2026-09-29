import type { ContentRules, PreviewSpec, ValidationIssue } from '@socioboard/contracts';

import { isProviderError, ProviderError } from '../errors';
import type {
  AccountCredentials,
  ContentInput,
  NetworkAdapter,
  PublishInput,
  PublishMedia,
  PublishResult,
} from '../types';
import { checkRules, issue, IssueCode } from '../validation';
import type { GraphClient } from './graph-client';

const MB = 1024 * 1024;

type Format = 'feed' | 'reel' | 'story';

/**
 * Instagram feed posts (IG User Media reference, checked 2026-09-29): JPEG images up to 8 MB
 * between 4:5 and 1.91:1, up to 10 files in a carousel, caption up to 2,200 characters with 30
 * hashtags and 20 mentions. Videos are reels: 3 s to 15 min, up to 300 MB. PNG and WebP are
 * turned into JPEG before publishing (media-prepare).
 */
export const INSTAGRAM_RULES: ContentRules = {
  maxChars: 2200,
  maxHashtags: 30,
  maxMentions: 20,
  media: {
    required: true,
    maxItems: 10,
    kinds: ['image', 'video'],
    mixKinds: true,
    maxImageBytes: 8 * MB,
    imageAspectRatio: { min: 0.8, max: 1.91 },
    video: { minSec: 3, maxSec: 15 * 60, maxBytes: 300 * MB },
  },
  links: 'not_clickable',
};

/** Stories: one file; images any shape (9:16 fits best), videos 3–60 s up to 100 MB. */
const STORY_RULES: ContentRules = {
  ...INSTAGRAM_RULES,
  media: {
    ...INSTAGRAM_RULES.media,
    maxItems: 1,
    imageAspectRatio: null,
    video: { minSec: 3, maxSec: 60, maxBytes: 100 * MB },
  },
};

/** Reels: one video (any shape between 0.01:1 and 10:1; 9:16 fits best). */
const REEL_RULES: ContentRules = {
  ...INSTAGRAM_RULES,
  media: { ...INSTAGRAM_RULES.media, maxItems: 1, imageAspectRatio: null },
};

const RULES_BY_FORMAT: Record<Format, ContentRules> = {
  feed: INSTAGRAM_RULES,
  reel: REEL_RULES,
  story: STORY_RULES,
};

export const INSTAGRAM_PREVIEW: PreviewSpec = {
  // The feed shows about 125 characters before "more".
  truncateAt: 125,
  captionPosition: 'below_media',
  mediaLayout: 'carousel',
  cropAspectRatio: { min: 0.8, max: 1.91 },
  linkCard: false,
};

const COMMENT_MAX = 2200;

export interface InstagramGraphs {
  /** For accounts reached through a Facebook Page (graph.facebook.com). */
  facebook?: GraphClient | undefined;
  /** For accounts that signed in with Instagram Login (graph.instagram.com). */
  instagram?: GraphClient | undefined;
}

export interface InstagramOptions {
  /** How often to ask whether Instagram has finished processing a container. */
  pollIntervalMs?: number;
  /** Give up (and retry the whole target later) after this long; videos can take minutes. */
  maxWaitMs?: number;
  sleep?: (ms: number) => Promise<void>;
}

const formatOf = (input: ContentInput): Format => input.options.instagram?.format ?? 'feed';

export function createInstagram(
  graphs: InstagramGraphs,
  opts: InstagramOptions = {},
): NetworkAdapter {
  const pollIntervalMs = opts.pollIntervalMs ?? 3000;
  const maxWaitMs = opts.maxWaitMs ?? 10 * 60_000;
  const sleep = opts.sleep ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));

  /** The account's API: Instagram Login accounts use graph.instagram.com. */
  function graphFor(account: AccountCredentials): GraphClient {
    const graph = account.meta.via === 'instagram' ? graphs.instagram : graphs.facebook;
    if (!graph) {
      throw new ProviderError({
        kind: 'auth',
        message: 'This Instagram account was connected through a login that is no longer set up.',
      });
    }
    return graph;
  }

  async function waitUntilReady(graph: GraphClient, token: string, containerId: string) {
    const deadline = Date.now() + maxWaitMs;
    for (;;) {
      const c = await graph.get<{ status_code?: string; status?: string }>(containerId, token, {
        fields: 'status_code,status',
      });
      if (c.status_code === 'FINISHED' || c.status_code === 'PUBLISHED') return;
      if (c.status_code === 'ERROR') {
        throw new ProviderError({
          kind: 'content',
          message: `Instagram couldn't process this file${c.status ? `: ${c.status}` : ''}`,
          networkCode: 'container_error',
        });
      }
      if (c.status_code === 'EXPIRED' || Date.now() >= deadline) {
        throw new ProviderError({
          kind: 'retryable',
          message: 'Instagram is still processing the media; trying again later',
          networkCode: c.status_code === 'EXPIRED' ? 'container_expired' : 'container_timeout',
        });
      }
      await sleep(pollIntervalMs);
    }
  }

  async function container(
    graph: GraphClient,
    account: AccountCredentials,
    fields: Record<string, string>,
  ): Promise<string> {
    const res = await graph.post<{ id: string }>(
      `${account.externalId}/media`,
      account.accessToken,
      fields,
    );
    await waitUntilReady(graph, account.accessToken, res.id);
    return res.id;
  }

  const mediaFields = (m: PublishMedia): Record<string, string> =>
    m.kind === 'video'
      ? { video_url: m.url }
      : { image_url: m.url, ...(m.altText ? { alt_text: m.altText } : {}) };

  async function createContainer(
    input: PublishInput,
    account: AccountCredentials,
    graph: GraphClient,
  ) {
    const format = formatOf(input);
    const [first] = input.media;
    if (!first) {
      throw new ProviderError({
        kind: 'content',
        message: 'Instagram posts need a photo or video.',
      });
    }
    const caption = input.text === '' ? {} : { caption: input.text };
    if (format === 'story') {
      return container(graph, account, { media_type: 'STORIES', ...mediaFields(first) });
    }
    if (format === 'reel' || (input.media.length === 1 && first.kind === 'video')) {
      // Single feed videos are reels; share_to_feed keeps them in the profile grid too.
      return container(graph, account, {
        media_type: 'REELS',
        video_url: first.url,
        share_to_feed: 'true',
        ...caption,
      });
    }
    if (input.media.length === 1) {
      return container(graph, account, { ...mediaFields(first), ...caption });
    }
    const children: string[] = [];
    for (const m of input.media) {
      children.push(
        await container(graph, account, {
          is_carousel_item: 'true',
          ...(m.kind === 'video' ? { media_type: 'VIDEO' } : {}),
          ...mediaFields(m),
        }),
      );
    }
    return container(graph, account, {
      media_type: 'CAROUSEL',
      children: children.join(','),
      ...caption,
    });
  }

  return {
    id: 'instagram',
    displayName: 'Instagram',
    capabilities: {
      postTypes: ['image', 'carousel', 'reel', 'story'],
      firstComment: true,
      altText: true,
    },
    rules: INSTAGRAM_RULES,
    preview: INSTAGRAM_PREVIEW,

    validate(input) {
      const format = formatOf(input);
      const issues: ValidationIssue[] = checkRules(RULES_BY_FORMAT[format], input, 'Instagram');
      if (format === 'reel' && input.media.some((m) => m.kind !== 'video')) {
        issues.push(
          issue('error', IssueCode.FORMAT_NEEDS_VIDEO, 'A reel is one video.', {
            field: 'media',
            params: { format },
          }),
        );
      }
      if (format === 'story' && input.text.trim() !== '') {
        issues.push(
          issue(
            'warning',
            IssueCode.STORY_NO_CAPTION,
            "Stories don't show text; it won't be posted.",
            {
              field: 'text',
            },
          ),
        );
      }
      if (format === 'story' && input.firstComment) {
        issues.push(
          issue(
            'warning',
            IssueCode.STORY_NO_COMMENT,
            "Stories can't have comments; it won't be added.",
            {
              field: 'firstComment',
            },
          ),
        );
      }
      if (input.link) {
        issues.push(
          issue(
            'warning',
            IssueCode.LINK_NOT_CLICKABLE,
            "Links in Instagram captions aren't clickable; the link isn't added.",
            { field: 'link' },
          ),
        );
      }
      if (input.firstComment && input.firstComment.length > COMMENT_MAX) {
        issues.push(
          issue(
            'error',
            IssueCode.FIRST_COMMENT_TOO_LONG,
            `Instagram comments can be up to ${String(COMMENT_MAX)} characters.`,
            { field: 'firstComment', params: { max: COMMENT_MAX } },
          ),
        );
      }
      return issues;
    },

    async publish(input, account) {
      const graph = graphFor(account);
      const token = account.accessToken;
      const creationId = await createContainer(input, account, graph);
      const published = await graph.post<{ id: string }>(
        `${account.externalId}/media_publish`,
        token,
        {
          creation_id: creationId,
        },
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
      if (input.firstComment && formatOf(input) !== 'story') {
        try {
          await graph.post(`${published.id}/comments`, token, { message: input.firstComment });
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
