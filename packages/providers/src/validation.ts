import { textLength, type ContentRules, type ValidationIssue } from '@socioboard/contracts';

import type { ContentInput, ContentMedia } from './types';

/**
 * Issue codes adapters return. The composer words each one from `code` + `params`; `message` is
 * the English fallback.
 */
export const IssueCode = {
  EMPTY_POST: 'EMPTY_POST',
  TEXT_TOO_LONG: 'TEXT_TOO_LONG',
  TOO_MANY_HASHTAGS: 'TOO_MANY_HASHTAGS',
  TOO_MANY_MENTIONS: 'TOO_MANY_MENTIONS',
  MEDIA_REQUIRED: 'MEDIA_REQUIRED',
  TOO_MANY_MEDIA: 'TOO_MANY_MEDIA',
  TOO_FEW_MEDIA: 'TOO_FEW_MEDIA',
  MEDIA_KIND_NOT_SUPPORTED: 'MEDIA_KIND_NOT_SUPPORTED',
  MEDIA_MIXED: 'MEDIA_MIXED',
  IMAGE_TOO_LARGE: 'IMAGE_TOO_LARGE',
  ASPECT_RATIO: 'ASPECT_RATIO',
  VIDEO_TOO_LARGE: 'VIDEO_TOO_LARGE',
  VIDEO_TOO_SHORT: 'VIDEO_TOO_SHORT',
  VIDEO_TOO_LONG: 'VIDEO_TOO_LONG',
  LINK_NOT_CLICKABLE: 'LINK_NOT_CLICKABLE',
  LINK_CARD_DROPPED: 'LINK_CARD_DROPPED',
  FIRST_COMMENT_TOO_LONG: 'FIRST_COMMENT_TOO_LONG',
  FORMAT_NEEDS_VIDEO: 'FORMAT_NEEDS_VIDEO',
  STORY_NO_CAPTION: 'STORY_NO_CAPTION',
  STORY_NO_COMMENT: 'STORY_NO_COMMENT',
} as const;

type Params = NonNullable<ValidationIssue['params']>;

export function issue(
  severity: ValidationIssue['severity'],
  code: string,
  message: string,
  extra: { field?: ValidationIssue['field']; mediaId?: string; params?: Params } = {},
): ValidationIssue {
  return {
    severity,
    code,
    message,
    field: extra.field ?? null,
    mediaId: extra.mediaId ?? null,
    ...(extra.params ? { params: extra.params } : {}),
  };
}

const MB = 1024 * 1024;
const formatMb = (bytes: number) => `${String(Math.round((bytes / MB) * 10) / 10)} MB`;

/** `#tag` and `@name` counts, as networks limit them. */
export function countTags(text: string): { hashtags: number; mentions: number } {
  return {
    hashtags: text.match(/(^|\s)#[\p{L}\p{N}_]+/gu)?.length ?? 0,
    mentions: text.match(/(^|\s)@[\p{L}\p{N}._]+/gu)?.length ?? 0,
  };
}

/**
 * The checks every network's `ContentRules` describe: text length, tags, media count, kinds,
 * sizes, image shape and video length. Networks add their own on top. Media without measured
 * dimensions or duration (processing still running, or no ffmpeg) skip those checks.
 */
export function checkRules(
  rules: ContentRules,
  input: ContentInput,
  networkName: string,
  /** The worker fits images to the network's size (ImagePrep), so their size isn't an issue. */
  options: { imagesRefitted?: boolean } = {},
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const length = textLength(input.text);
  if (length > rules.maxChars) {
    issues.push(
      issue(
        'error',
        IssueCode.TEXT_TOO_LONG,
        `${networkName} allows ${String(rules.maxChars)} characters; this has ${String(length)}.`,
        { field: 'text', params: { max: rules.maxChars, actual: length } },
      ),
    );
  }
  const tags = countTags(input.text);
  if (rules.maxHashtags !== null && tags.hashtags > rules.maxHashtags) {
    issues.push(
      issue(
        'error',
        IssueCode.TOO_MANY_HASHTAGS,
        `${networkName} allows ${String(rules.maxHashtags)} hashtags; this has ${String(tags.hashtags)}.`,
        { field: 'text', params: { max: rules.maxHashtags, actual: tags.hashtags } },
      ),
    );
  }
  if (rules.maxMentions !== null && tags.mentions > rules.maxMentions) {
    issues.push(
      issue(
        'error',
        IssueCode.TOO_MANY_MENTIONS,
        `${networkName} allows ${String(rules.maxMentions)} mentions; this has ${String(tags.mentions)}.`,
        { field: 'text', params: { max: rules.maxMentions, actual: tags.mentions } },
      ),
    );
  }

  const { media } = rules;
  if (media.required && input.media.length === 0) {
    issues.push(
      issue('error', IssueCode.MEDIA_REQUIRED, `${networkName} posts need a photo or video.`, {
        field: 'media',
      }),
    );
  }
  if (input.media.length > media.maxItems) {
    issues.push(
      issue(
        'error',
        IssueCode.TOO_MANY_MEDIA,
        `${networkName} allows ${String(media.maxItems)} files per post; this has ${String(input.media.length)}.`,
        { field: 'media', params: { max: media.maxItems, actual: input.media.length } },
      ),
    );
  }
  const kinds = new Set(input.media.map((m) => (m.kind === 'video' ? 'video' : 'image')));
  if (!media.mixKinds && kinds.size > 1) {
    issues.push(
      issue(
        'error',
        IssueCode.MEDIA_MIXED,
        `${networkName} can't mix photos and videos in one post.`,
        { field: 'media' },
      ),
    );
  }
  for (const m of input.media) issues.push(...checkMedia(rules, m, networkName, options));
  return issues;
}

function checkMedia(
  rules: ContentRules,
  m: ContentMedia,
  networkName: string,
  options: { imagesRefitted?: boolean },
): ValidationIssue[] {
  const { media } = rules;
  const at = { field: 'media' as const, mediaId: m.id };
  if (!media.kinds.includes(m.kind)) {
    const what = m.kind === 'gif' ? 'GIFs' : `${m.kind}s`;
    return [
      issue('error', IssueCode.MEDIA_KIND_NOT_SUPPORTED, `${networkName} doesn't accept ${what}.`, {
        ...at,
        params: { kind: m.kind },
      }),
    ];
  }
  const issues: ValidationIssue[] = [];
  if (m.kind !== 'video') {
    if (m.sizeBytes > media.maxImageBytes && !options.imagesRefitted) {
      issues.push(
        issue(
          'error',
          IssueCode.IMAGE_TOO_LARGE,
          `${networkName} accepts images up to ${formatMb(media.maxImageBytes)}.`,
          { ...at, params: { maxBytes: media.maxImageBytes, actual: m.sizeBytes } },
        ),
      );
    }
    const ratio = media.imageAspectRatio;
    if (ratio && m.width && m.height) {
      const r = m.width / m.height;
      // A little tolerance: 1080×1350 is exactly 0.8, but rounding shouldn't reject 1079×1350.
      if (r < ratio.min - 0.005 || r > ratio.max + 0.005) {
        issues.push(
          issue(
            'error',
            IssueCode.ASPECT_RATIO,
            `${networkName} needs images between ${String(ratio.min)}:1 and ${String(ratio.max)}:1 (width ÷ height); this one is ${r.toFixed(2)}:1.`,
            { ...at, params: { min: ratio.min, max: ratio.max, actual: Number(r.toFixed(2)) } },
          ),
        );
      }
    }
    return issues;
  }
  const video = media.video;
  if (!video) return issues;
  if (m.sizeBytes > video.maxBytes) {
    issues.push(
      issue(
        'error',
        IssueCode.VIDEO_TOO_LARGE,
        `${networkName} accepts videos up to ${formatMb(video.maxBytes)}.`,
        { ...at, params: { maxBytes: video.maxBytes, actual: m.sizeBytes } },
      ),
    );
  }
  if (m.durationSec !== null && m.durationSec < video.minSec) {
    issues.push(
      issue(
        'error',
        IssueCode.VIDEO_TOO_SHORT,
        `${networkName} needs videos of at least ${String(video.minSec)} seconds.`,
        { ...at, params: { minSec: video.minSec, actual: m.durationSec } },
      ),
    );
  }
  if (m.durationSec !== null && m.durationSec > video.maxSec) {
    issues.push(
      issue(
        'error',
        IssueCode.VIDEO_TOO_LONG,
        `${networkName} accepts videos up to ${formatDuration(video.maxSec)}.`,
        { ...at, params: { maxSec: video.maxSec, actual: m.durationSec } },
      ),
    );
  }
  return issues;
}

function formatDuration(sec: number): string {
  if (sec % 3600 === 0) return `${String(sec / 3600)} hours`;
  if (sec % 60 === 0) return `${String(sec / 60)} minutes`;
  return `${String(sec)} seconds`;
}
