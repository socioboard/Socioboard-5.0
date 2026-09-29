import type { ContentRules, PreviewSpec, ValidationIssue } from '@socioboard/contracts';

import { isProviderError } from '../errors';
import type { AccountCredentials, NetworkAdapter, PublishInput, PublishResult } from '../types';
import { checkRules, issue, IssueCode } from '../validation';
import type { GraphClient } from './graph-client';

const MB = 1024 * 1024;

/**
 * Facebook Page posts (developers.facebook.com, checked 2026-09-29): photos up to 10 MB, up to 10
 * in one post, or one video (our upload limit is 1 GB). Text up to 63,206 characters.
 */
export const FACEBOOK_RULES: ContentRules = {
  maxChars: 63_206,
  maxHashtags: null,
  maxMentions: null,
  media: {
    required: false,
    maxItems: 10,
    kinds: ['image', 'video'],
    mixKinds: false,
    maxImageBytes: 10 * MB,
    imageAspectRatio: null,
    video: { minSec: 1, maxSec: 4 * 60 * 60, maxBytes: 1024 * MB },
  },
  links: 'card',
};

export const FACEBOOK_PREVIEW: PreviewSpec = {
  // Desktop feed cuts long text at about 480 characters with "See more".
  truncateAt: 480,
  captionPosition: 'above_media',
  mediaLayout: 'grid',
  cropAspectRatio: null,
  linkCard: true,
};

/** Facebook's first comment limit. */
const COMMENT_MAX = 8000;

export function createFacebookPage(graph: GraphClient): NetworkAdapter {
  return {
    id: 'facebook_page',
    displayName: 'Facebook',
    capabilities: {
      postTypes: ['text', 'link', 'image', 'carousel', 'video'],
      firstComment: true,
      altText: true,
    },
    rules: FACEBOOK_RULES,
    preview: FACEBOOK_PREVIEW,

    validate(input) {
      const issues: ValidationIssue[] = checkRules(FACEBOOK_RULES, input, 'Facebook');
      if (input.text.trim() === '' && input.media.length === 0 && !input.link) {
        issues.push(
          issue('error', IssueCode.EMPTY_POST, 'Add text, a link, a photo or a video.', {
            field: 'text',
          }),
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
      if (input.firstComment && input.firstComment.length > COMMENT_MAX) {
        issues.push(
          issue(
            'error',
            IssueCode.FIRST_COMMENT_TOO_LONG,
            `Facebook comments can be up to ${String(COMMENT_MAX)} characters.`,
            { field: 'firstComment', params: { max: COMMENT_MAX } },
          ),
        );
      }
      return issues;
    },

    async publish(input, account) {
      const { externalId, isVideo } = await createPost(graph, input, account);
      const warnings: string[] = [];
      const permalink = await getPermalink(graph, externalId, isVideo, account);
      if (input.firstComment) {
        try {
          await graph.post(`${externalId}/comments`, account.accessToken, {
            message: input.firstComment,
          });
        } catch (err) {
          // The post is out; a missing comment shouldn't make it look failed (or post it twice).
          warnings.push(
            `The first comment wasn't added: ${isProviderError(err) ? err.message : 'unknown error'}`,
          );
        }
      }
      return { externalId, permalink, warnings } satisfies PublishResult;
    },

    async deletePost(externalId, account) {
      await graph.delete(externalId, account.accessToken);
    },
  };
}

/** The text, with the link appended when media hide the link card and the text lacks it. */
function messageWithLink(input: PublishInput): string {
  if (!input.link || input.text.includes(input.link)) return input.text;
  return input.text.trim() === '' ? input.link : `${input.text}\n\n${input.link}`;
}

async function createPost(
  graph: GraphClient,
  input: PublishInput,
  account: AccountCredentials,
): Promise<{ externalId: string; isVideo: boolean }> {
  const page = account.externalId;
  const token = account.accessToken;
  const [first] = input.media;

  if (!first) {
    const res = await graph.post<{ id: string }>(`${page}/feed`, token, {
      message: input.text,
      ...(input.link ? { link: input.link } : {}),
    });
    return { externalId: res.id, isVideo: false };
  }

  if (first.kind === 'video') {
    const res = await graph.post<{ id: string }>(
      `${page}/videos`,
      token,
      { file_url: first.url, description: messageWithLink(input) },
      // Meta fetches the file before answering; allow longer than the default minute.
      { video: true, timeoutMs: 5 * 60_000 },
    );
    return { externalId: res.id, isVideo: true };
  }

  const alt = (text: string | null): Record<string, string> =>
    text ? { alt_text_custom: text } : {};
  if (input.media.length === 1) {
    const res = await graph.post<{ id: string; post_id?: string }>(`${page}/photos`, token, {
      url: first.url,
      caption: messageWithLink(input),
      ...alt(first.altText),
    });
    return { externalId: res.post_id ?? res.id, isVideo: false };
  }

  // Several photos: upload each unpublished, then one feed post that attaches them in order.
  const photoIds: string[] = [];
  for (const m of input.media) {
    const res = await graph.post<{ id: string }>(`${page}/photos`, token, {
      url: m.url,
      published: 'false',
      ...alt(m.altText),
    });
    photoIds.push(res.id);
  }
  const attached = Object.fromEntries(
    photoIds.map((id, i) => [`attached_media[${String(i)}]`, JSON.stringify({ media_fbid: id })]),
  );
  const res = await graph.post<{ id: string }>(`${page}/feed`, token, {
    message: messageWithLink(input),
    ...attached,
  });
  return { externalId: res.id, isVideo: false };
}

/** The post's public URL; the post is published even when this lookup fails. */
async function getPermalink(
  graph: GraphClient,
  externalId: string,
  isVideo: boolean,
  account: AccountCredentials,
): Promise<string | null> {
  try {
    const res = await graph.get<{ permalink_url?: string }>(externalId, account.accessToken, {
      fields: 'permalink_url',
    });
    const link = res.permalink_url;
    if (!link) return null;
    // Videos answer with a path ("/halden/videos/123/").
    return link.startsWith('/') ? `https://www.facebook.com${link}` : link;
  } catch {
    return isVideo ? null : `https://www.facebook.com/${externalId}`;
  }
}
