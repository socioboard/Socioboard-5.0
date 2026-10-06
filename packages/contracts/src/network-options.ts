import { z } from 'zod';

import { NetworkId } from './networks';

// Network-specific settings of a post (docs/backend/modules/posts.md, `override.options`) and the
// choices an account offers for them (P3-C1). These bounds only keep stored values sane: each
// network's own limits (a YouTube title's 100 characters, TikTok's rule that branded content
// can't be private) are its adapter's `validate`, so the composer can word them as issues.

const OptionText = z.string().max(500);

/** Instagram: a feed post (one file, or a carousel of 2–10), a reel or a story. */
export const InstagramFormat = z.enum(['feed', 'reel', 'story']);
export type InstagramFormat = z.infer<typeof InstagramFormat>;

export const InstagramOptions = z.object({ format: InstagramFormat }).partial();
export type InstagramOptions = z.infer<typeof InstagramOptions>;

/** Pinterest: the board a pin goes to (required to publish) and its title. */
export const PinterestOptions = z
  .object({
    boardId: z.string().min(1).max(64),
    title: OptionText,
  })
  .partial();
export type PinterestOptions = z.infer<typeof PinterestOptions>;

/** Who can watch a YouTube video. Until the app passes Google's audit, only `private` works. */
export const YouTubePrivacy = z.enum(['public', 'unlisted', 'private']);
export type YouTubePrivacy = z.infer<typeof YouTubePrivacy>;

/** YouTube: the video's title (the post's text is its description), privacy and tags. */
export const YouTubeOptions = z
  .object({
    title: OptionText,
    privacy: YouTubePrivacy,
    tags: z.array(z.string().min(1).max(100)).max(100),
    /** YouTube asks every upload whether it is made for children. */
    madeForKids: z.boolean(),
  })
  .partial();
export type YouTubeOptions = z.infer<typeof YouTubeOptions>;

/**
 * Who can watch a TikTok video. The levels offered depend on the account (its creator info), and
 * TikTok's rules say the person picks one: there is no default.
 */
export const TikTokPrivacy = z.enum(['everyone', 'friends', 'followers', 'only_me']);
export type TikTokPrivacy = z.infer<typeof TikTokPrivacy>;

/**
 * TikTok: privacy, what viewers may do with the video, and the commercial content disclosure
 * TikTok's audit requires (promoting your own brand, or branded content for someone else).
 */
export const TikTokOptions = z
  .object({
    privacy: TikTokPrivacy,
    allowComments: z.boolean(),
    allowDuets: z.boolean(),
    allowStitches: z.boolean(),
    /** Null or absent: not commercial content. */
    commercial: z.object({ yourBrand: z.boolean(), brandedContent: z.boolean() }).nullable(),
  })
  .partial();
export type TikTokOptions = z.infer<typeof TikTokOptions>;

/**
 * Network-specific settings, under a key of the target account's network (the API rejects keys
 * for other networks: `OPTIONS_NETWORKS`). Every field is optional, so a draft can be saved
 * unfinished; validation says what publishing still needs.
 */
export const TargetOptions = z.object({
  instagram: InstagramOptions.optional(),
  pinterest: PinterestOptions.optional(),
  youtube: YouTubeOptions.optional(),
  tiktok: TikTokOptions.optional(),
});
export type TargetOptions = z.infer<typeof TargetOptions>;
export type TargetOptionsKey = keyof TargetOptions;

/** The networks each options key applies to. */
export const OPTIONS_NETWORKS: Readonly<Record<TargetOptionsKey, readonly NetworkId[]>> = {
  instagram: ['instagram'],
  pinterest: ['pinterest'],
  youtube: ['youtube'],
  tiktok: ['tiktok'],
};

/** Whether `key` holds options for `network`; false for keys that aren't options at all. */
export function optionsApplyTo(key: string, network: NetworkId): boolean {
  return Object.hasOwn(OPTIONS_NETWORKS, key)
    ? OPTIONS_NETWORKS[key as TargetOptionsKey].includes(network)
    : false;
}

// ---------------------------------------------------------------- choices

export const PinterestBoard = z.object({
  id: z.string(),
  name: z.string(),
  privacy: z.enum(['public', 'protected', 'secret']),
});
export type PinterestBoard = z.infer<typeof PinterestBoard>;

/** Pinterest: the boards the account can pin to. */
export const PinterestChoices = z.object({
  network: z.literal('pinterest'),
  boards: z.array(PinterestBoard),
});

/**
 * TikTok: the account's creator info, asked of TikTok each time the composer opens its options
 * (TikTok requires it before every post).
 */
export const TikTokChoices = z.object({
  network: z.literal('tiktok'),
  creator: z.object({
    nickname: z.string(),
    username: z.string(),
    avatarUrl: z.url().nullable(),
  }),
  /** The privacy levels this account may use. */
  privacyLevels: z.array(TikTokPrivacy).min(1),
  /** Turned off in the account's TikTok settings: the composer shows them off and locked. */
  turnedOff: z.object({ comments: z.boolean(), duets: z.boolean(), stitches: z.boolean() }),
  /** The longest video this account may post. */
  maxVideoSec: z.number().int().positive(),
  /** Why the account can't post right now (TikTok's daily cap…), in TikTok's words; else null. */
  unavailableReason: z.string().nullable(),
});

/** YouTube: the privacy levels the app may use (only `private` until Google's audit passes). */
export const YouTubeChoices = z.object({
  network: z.literal('youtube'),
  privacyLevels: z.array(YouTubePrivacy).min(1),
});

const WITH_CHOICES = ['pinterest', 'tiktok', 'youtube'] as const;

/** Networks whose options need nothing from the account. */
export const NoChoices = z.object({ network: NetworkId.exclude(WITH_CHOICES) });

/**
 * What an account offers for its network's options (`GET …/accounts/:accountId/options`).
 * Networks that need nothing from the account answer with only their `network`.
 */
export const AccountOptionChoices = z.discriminatedUnion('network', [
  PinterestChoices,
  TikTokChoices,
  YouTubeChoices,
  NoChoices,
]);
export type AccountOptionChoices = z.infer<typeof AccountOptionChoices>;
