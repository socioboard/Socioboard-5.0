import { z } from 'zod';

import { MediaKind } from './media';
import { defineRoute } from './route';

/**
 * Where a post can go: one id per kind of postable asset (docs/backend/modules/providers.md).
 * Phase 1 enables facebook_page and instagram; the rest arrive in phase 3.
 */
export const NetworkId = z.enum([
  'facebook_page',
  'instagram',
  'linkedin_person',
  'linkedin_org',
  'x',
  'youtube',
  'pinterest',
  'tiktok',
  'snapchat',
  'tumblr',
]);
export type NetworkId = z.infer<typeof NetworkId>;

/**
 * How someone signs in to connect accounts: one id per OAuth app (docs/developer-apps.md, the
 * `/api/oauth/<provider>/callback` values). One login can reach several networks: a Facebook
 * login reaches its Pages and the Instagram accounts linked to them.
 */
export const LoginProvider = z.enum([
  'facebook',
  'instagram',
  'linkedin',
  'x',
  'youtube',
  'pinterest',
  'tiktok',
  'snapchat',
  'tumblr',
]);
export type LoginProvider = z.infer<typeof LoginProvider>;

export const PostType = z.enum(['text', 'link', 'image', 'carousel', 'video', 'reel', 'story']);
export type PostType = z.infer<typeof PostType>;

export const NetworkCapabilities = z.object({
  postTypes: z.array(PostType),
  firstComment: z.boolean(),
  altText: z.boolean(),
});
export type NetworkCapabilities = z.infer<typeof NetworkCapabilities>;

/**
 * The limits the composer checks as you type. The adapter's `validate` has the final say and
 * knows more (per-format rules such as Instagram reels vs feed posts).
 */
export const ContentRules = z.object({
  /** Counted in Unicode code points (see `textLength`). */
  maxChars: z.number().int().positive(),
  maxHashtags: z.number().int().positive().nullable(),
  maxMentions: z.number().int().positive().nullable(),
  media: z.object({
    required: z.boolean(),
    maxItems: z.number().int().nonnegative(),
    kinds: z.array(MediaKind),
    /** Whether images and videos can go in one post. */
    mixKinds: z.boolean(),
    maxImageBytes: z.number().int().positive(),
    /** Image width ÷ height; null when any shape is accepted. */
    imageAspectRatio: z.object({ min: z.number(), max: z.number() }).nullable(),
    video: z
      .object({
        minSec: z.number().nonnegative(),
        maxSec: z.number().positive(),
        maxBytes: z.number().int().positive(),
      })
      .nullable(),
  }),
  /** `card`: the link gets a preview card; `text`: it stays clickable text; `not_clickable`. */
  links: z.enum(['card', 'text', 'not_clickable']),
});
export type ContentRules = z.infer<typeof ContentRules>;

/** Layout hints for the composer's live preview of this network. */
export const PreviewSpec = z.object({
  /** Characters shown before the network's "See more"; null when it shows everything. */
  truncateAt: z.number().int().positive().nullable(),
  captionPosition: z.enum(['above_media', 'below_media']),
  /** How several media show: a grid (Facebook) or a swipeable carousel (Instagram). */
  mediaLayout: z.enum(['grid', 'carousel']),
  /** Width ÷ height the network crops media to, or null to keep each file's own shape. */
  cropAspectRatio: z.object({ min: z.number(), max: z.number() }).nullable(),
  linkCard: z.boolean(),
});
export type PreviewSpec = z.infer<typeof PreviewSpec>;

/** A way to sign in for this network, and whether it can show an account picker. */
export const NetworkLogin = z.object({
  provider: LoginProvider,
  /**
   * The network lets us ask for its account picker. When false, adding a second login means
   * signing out of the network in this browser first (the UI shows that tip).
   */
  supportsAccountSelection: z.boolean(),
});
export type NetworkLogin = z.infer<typeof NetworkLogin>;

export const Network = z.object({
  id: NetworkId,
  displayName: z.string(),
  capabilities: NetworkCapabilities,
  rules: ContentRules,
  preview: PreviewSpec,
  /** Ways to connect accounts of this network, preferred first. */
  logins: z.array(NetworkLogin).min(1),
});
export type Network = z.infer<typeof Network>;

/** Text length as networks count it for these limits: Unicode code points (an emoji is one). */
export function textLength(text: string): number {
  // UTF-16 length minus one per surrogate pair (characters outside the Basic Multilingual Plane).
  const pairs = text.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g);
  return text.length - (pairs?.length ?? 0);
}

export const networkRoutes = {
  listNetworks: defineRoute({
    method: 'GET',
    path: '/api/v1/networks',
    access: 'user',
    summary: 'Enabled networks with capabilities, content rules, preview spec and logins',
    responses: { 200: z.object({ items: z.array(Network) }) },
  }),
};
