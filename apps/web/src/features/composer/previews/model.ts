import { textLength, type PreviewSpec } from '@socioboard/contracts';

/**
 * What a network shows before its "See more": at most `truncateLines` lines, then at most
 * `truncateAt` characters, counted as networks count them (code points, so an emoji is one), cut
 * back to the last space when that doesn't lose much, without trailing spaces. `truncated` is
 * false when it all fits.
 */
export function truncateText(
  text: string,
  truncateAt: number | null,
  truncateLines: number | null = null,
): { shown: string; truncated: boolean } {
  // Networks drop trailing blank lines, so they don't count towards the limit.
  const lines = text.trimEnd().split('\n');
  const byLines = truncateLines !== null && lines.length > truncateLines;
  const kept = byLines ? lines.slice(0, truncateLines).join('\n') : text;
  if (truncateAt === null || textLength(kept) <= truncateAt) {
    return byLines ? { shown: kept.trimEnd(), truncated: true } : { shown: text, truncated: false };
  }
  const cut = Array.from(kept).slice(0, truncateAt).join('');
  const space = cut.search(/\s\S*$/);
  // Networks break between words when a word straddles the limit (within about 20 characters).
  const atWord = space > 0 && textLength(cut) - textLength(cut.slice(0, space)) <= 20;
  return { shown: (atWord ? cut.slice(0, space) : cut).trimEnd(), truncated: true };
}

/** A file's own shape (width ÷ height), or square when its size isn't known yet. */
export function ownRatio(file: { width: number | null; height: number | null }): number {
  return file.width && file.height ? file.width / file.height : 1;
}

/** The shape the network shows a file in: its own, kept within the network's crop limits. */
export function croppedRatio(ratio: number, crop: PreviewSpec['cropAspectRatio']): number {
  if (!crop) return ratio;
  return Math.min(crop.max, Math.max(crop.min, ratio));
}

/** Facebook's grid of photos: how many tiles show and how they're arranged. */
export interface GridLayout {
  /** Files shown as tiles, in order. */
  shown: number;
  /** Files beyond the tiles, as "+N" on the last one; 0 when all show. */
  more: number;
  /** single: one file in its own shape; pair: side by side; hero: one wide above two; quad: 2 × 2. */
  arrangement: 'single' | 'pair' | 'hero' | 'quad';
}

export function gridLayout(count: number): GridLayout {
  if (count <= 1) return { shown: count, more: 0, arrangement: 'single' };
  if (count === 2) return { shown: 2, more: 0, arrangement: 'pair' };
  if (count === 3) return { shown: 3, more: 0, arrangement: 'hero' };
  return { shown: 4, more: count - 4, arrangement: 'quad' };
}

/**
 * Instagram crops every file to one frame: a feed post (or carousel) takes the first file's shape
 * within 4:5 to 1.91:1; reels and stories are 9:16.
 */
export function instagramFrameRatio(
  format: 'feed' | 'reel' | 'story',
  first: { width: number | null; height: number | null } | undefined,
  crop: PreviewSpec['cropAspectRatio'],
): number {
  if (format !== 'feed') return 9 / 16;
  return croppedRatio(first ? ownRatio(first) : 1, crop);
}

/** The site's host without "www.", as link cards show it ("halden.coffee"). */
export function linkHost(link: string): string | null {
  try {
    return new URL(link).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

export interface TextPart {
  kind: 'text' | 'hashtag' | 'mention' | 'link';
  value: string;
}

/**
 * Text split into what networks colour: #hashtags, @mentions and web addresses. Rendered as plain
 * React text, never as HTML.
 */
export function textParts(text: string): TextPart[] {
  const parts: TextPart[] = [];
  const pattern = /(https?:\/\/[^\s]+)|(#[\p{L}\p{N}_]+)|(@[\p{L}\p{N}._]+)/gu;
  let last = 0;
  for (const m of text.matchAll(pattern)) {
    const at = m.index;
    if (at > last) parts.push({ kind: 'text', value: text.slice(last, at) });
    const kind = m[1] ? 'link' : m[2] ? 'hashtag' : 'mention';
    parts.push({ kind, value: m[0] });
    last = at + m[0].length;
  }
  if (last < text.length) parts.push({ kind: 'text', value: text.slice(last) });
  return parts;
}

/** The text X posts: the link goes after the text unless the text has it already. */
export function xShownText(text: string, link: string | null): string {
  const trimmed = text.trim();
  if (!link || trimmed.includes(link)) return trimmed;
  return trimmed === '' ? link : `${trimmed}\n\n${link}`;
}
