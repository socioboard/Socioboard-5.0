import {
  textLength,
  type ContentRules,
  type PinterestBoard,
  type PreviewSpec,
  type ValidationIssue,
} from '@socioboard/contracts';

import type { HttpClient } from '../http';
import type {
  AccountCredentials,
  ImagePrep,
  NetworkAdapter,
  PublishMedia,
  RateLimits,
} from '../types';
import { checkRules, issue, IssueCode } from '../validation';
import { pinterestError } from './errors';
import {
  PINTEREST_VIDEO,
  PINTEREST_VIDEO_MIMES,
  uploadVideo,
  type PinterestVideoOptions,
} from './media';

const MB = 1024 * 1024;

/**
 * Limits of a pin (Pinterest's OpenAPI spec v5.28.0, `PinCreate`, checked 2026-10-09): the
 * description (the post's text) up to 800 characters, the title 100, alt text 500. A carousel
 * pin holds 2–5 images (`multiple_image_base64`).
 */
export const PINTEREST_MAX_CHARS = 800;
export const PINTEREST_MAX_TITLE = 100;
export const PINTEREST_MAX_ALT_TEXT = 500;
export const PINTEREST_MAX_IMAGES = 5;

/**
 * Images go to Pinterest as base64 inside the JSON request, which takes only JPEG and PNG. The
 * worker converts and shrinks each image to this before publishing; 10 MB keeps the request
 * (base64 adds a third) well inside what Pinterest accepts.
 */
export const PINTEREST_IMAGE_PREP: ImagePrep = {
  mimes: ['image/jpeg', 'image/png'],
  maxWidth: null,
  maxBytes: 10 * MB,
};

/**
 * Pinterest pins: one image, a carousel of 2–5, or one video on its own. There are no text-only
 * pins. The text is the pin's description; the link is where the pin leads (clickable on the whole
 * pin), not added to the text. Any image shape works (2:3 is Pinterest's recommendation, not a
 * rule). Videos: media.ts.
 */
export const PINTEREST_RULES: ContentRules = {
  maxChars: PINTEREST_MAX_CHARS,
  maxHashtags: null,
  maxMentions: null,
  media: {
    required: true,
    maxItems: PINTEREST_MAX_IMAGES,
    kinds: ['image', 'video'],
    mixKinds: false,
    maxImageBytes: PINTEREST_IMAGE_PREP.maxBytes,
    imageAspectRatio: null,
    video: PINTEREST_VIDEO,
  },
  links: 'card',
};

/**
 * Pinterest's write limit (`org_write`, which covers creating pins) is 100 calls a minute per
 * user with Standard access (developers.pinterest.com rate limits, checked 2026-10-08); a pin is
 * one call, so 30 a minute per account leaves room. Trial access allows 300 a day for the whole
 * app, which isn't encoded: Pinterest answers 429 and the worker waits.
 */
export const PINTEREST_RATE_LIMITS: RateLimits = {
  perAccount: [{ max: 30, perSec: 60 }],
  perApp: [],
};

export const PINTEREST_PREVIEW: PreviewSpec = {
  // The pin shows its image first, then the title and a few lines of the description.
  truncateAt: null,
  truncateLines: 3,
  captionPosition: 'below_media',
  mediaLayout: 'carousel',
  cropAspectRatio: null,
  linkCard: false,
};

/** Pinterest's own issue codes; the composer words them (composer.json `codes`). */
export const PinterestIssueCode = {
  PINTEREST_BOARD_REQUIRED: 'PINTEREST_BOARD_REQUIRED',
  PINTEREST_TITLE_TOO_LONG: 'PINTEREST_TITLE_TOO_LONG',
  PINTEREST_ALT_TEXT_TOO_LONG: 'PINTEREST_ALT_TEXT_TOO_LONG',
  PINTEREST_VIDEO_FORMAT: 'PINTEREST_VIDEO_FORMAT',
} as const;

/** At most this many pages of boards (100 each) for the board picker. */
const MAX_BOARD_PAGES = 10;

/** `GET /v5/boards`: one page of the account's boards and the bookmark to the next. */
interface BoardsPage {
  items?: { id?: string; name?: string; privacy?: 'PUBLIC' | 'PROTECTED' | 'SECRET' }[];
  bookmark?: string | null;
}

const auth = (account: AccountCredentials) => ({
  authorization: `Bearer ${account.accessToken}`,
});

/** One image as Pinterest's base64 media takes it. */
async function imageData(http: HttpClient, m: PublishMedia) {
  const bytes = await http.download(m.readUrl, { maxBytes: PINTEREST_IMAGE_PREP.maxBytes });
  // The worker fitted the image to PINTEREST_IMAGE_PREP, so it's JPEG or PNG.
  const contentType = m.mime === 'image/png' ? 'image/png' : 'image/jpeg';
  return { content_type: contentType, data: Buffer.from(bytes).toString('base64') };
}

/** The `pinterest` network: pins on the boards of the Pinterest account that signed in. */
export function createPinterestPins(
  http: HttpClient,
  api: string,
  videoOptions: PinterestVideoOptions = {},
): NetworkAdapter {
  return {
    id: 'pinterest',
    displayName: 'Pinterest',
    capabilities: {
      postTypes: ['image', 'carousel', 'video'],
      firstComment: false,
      altText: true,
    },
    rules: PINTEREST_RULES,
    preview: PINTEREST_PREVIEW,
    imagePrep: PINTEREST_IMAGE_PREP,
    rateLimits: PINTEREST_RATE_LIMITS,

    validate(input) {
      const issues: ValidationIssue[] = checkRules(PINTEREST_RULES, input, 'Pinterest', {
        imagesRefitted: true,
      });
      // The board is chosen per account in the composer's options panel (optionChoices below).
      const options = input.options.pinterest;
      if (!options?.boardId) {
        issues.push(
          issue(
            'error',
            PinterestIssueCode.PINTEREST_BOARD_REQUIRED,
            'Choose the Pinterest board to pin to.',
            {
              field: 'options',
            },
          ),
        );
      }
      const title = textLength(options?.title ?? '');
      if (title > PINTEREST_MAX_TITLE) {
        issues.push(
          issue(
            'error',
            PinterestIssueCode.PINTEREST_TITLE_TOO_LONG,
            `Pinterest titles can be up to ${String(PINTEREST_MAX_TITLE)} characters; this has ${String(title)}.`,
            { field: 'options', params: { max: PINTEREST_MAX_TITLE, actual: title } },
          ),
        );
      }
      // A pin holds one video. Images with a video are already MEDIA_MIXED (checkRules).
      const videos = input.media.filter((m) => m.kind === 'video');
      if (videos.length > 1 && videos.length === input.media.length) {
        issues.push(
          issue('error', IssueCode.TOO_MANY_MEDIA, 'Pinterest takes one video per pin.', {
            field: 'media',
            params: { max: 1, actual: videos.length },
          }),
        );
      }
      for (const v of videos) {
        if (!PINTEREST_VIDEO_MIMES.includes(v.mime)) {
          issues.push(
            issue(
              'error',
              PinterestIssueCode.PINTEREST_VIDEO_FORMAT,
              'Pinterest takes MP4, MOV and M4V videos.',
              { field: 'media', mediaId: v.id },
            ),
          );
        }
      }
      for (const m of input.media) {
        const alt = textLength(m.altText ?? '');
        if (alt > PINTEREST_MAX_ALT_TEXT) {
          issues.push(
            issue(
              'error',
              PinterestIssueCode.PINTEREST_ALT_TEXT_TOO_LONG,
              `Pinterest alt text can be up to ${String(PINTEREST_MAX_ALT_TEXT)} characters; this has ${String(alt)}.`,
              {
                field: 'media',
                mediaId: m.id,
                params: { max: PINTEREST_MAX_ALT_TEXT, actual: alt },
              },
            ),
          );
        }
      }
      return issues;
    },

    async publish(input, account) {
      const options = input.options.pinterest ?? {};
      const [video] = input.media.filter((m) => m.kind === 'video');
      // A video pin: uploaded and processed first (media.ts), its cover a frame of the video
      // (no image needed, and no public media address).
      const videoSource = video
        ? {
            source_type: 'video_id',
            media_id: await uploadVideo(http, api, account, video, videoOptions),
            cover_image_key_frame_time: 0,
          }
        : null;
      // Images one at a time, in the composer's order: each is read whole into memory to encode it.
      const images: { content_type: string; data: string }[] = [];
      if (!video) for (const m of input.media) images.push(await imageData(http, m));
      const [first] = images;
      const title = options.title?.trim();
      const res = await http.request<{ id?: string }>({
        method: 'POST',
        url: `${api}/pins`,
        headers: auth(account),
        json: {
          board_id: options.boardId,
          ...(title ? { title } : {}),
          ...(input.text.trim() ? { description: input.text } : {}),
          ...(input.link ? { link: input.link } : {}),
          // A carousel's items have no alt text field; a single image's goes on the pin.
          ...(images.length === 1 && input.media[0]?.altText
            ? { alt_text: input.media[0].altText }
            : {}),
          media_source:
            videoSource ??
            (images.length === 1 && first
              ? { source_type: 'image_base64', ...first }
              : { source_type: 'multiple_image_base64', items: images }),
        },
      });
      const id = res.body.id;
      if (!res.ok || !id) throw pinterestError(res, 'posting');
      return {
        externalId: id,
        permalink: `https://www.pinterest.com/pin/${encodeURIComponent(id)}/`,
        warnings: [],
      };
    },

    async deletePost(externalId, account) {
      const res = await http.request({
        method: 'DELETE',
        url: `${api}/pins/${encodeURIComponent(externalId)}`,
        headers: auth(account),
      });
      // Already gone (deleted on Pinterest) is what we wanted.
      if (!res.ok && res.status !== 404) throw pinterestError(res, 'deleting the pin');
    },

    /**
     * The boards the account can pin to, for the composer's board picker (asked through
     * `GET /accounts/:aid/options`). Pinterest lists the account's own boards and the group boards
     * it collaborates on, a page at a time. Secret boards would need scopes we don't ask for, so
     * they're left out even if listed.
     */
    async optionChoices(account) {
      const boards: PinterestBoard[] = [];
      let bookmark: string | null | undefined;
      for (let page = 0; page < MAX_BOARD_PAGES; page++) {
        const res = await http.request<BoardsPage>({
          url: `${api}/boards`,
          query: { page_size: 100, bookmark },
          headers: auth(account),
        });
        if (!res.ok) throw pinterestError(res, 'listing boards');
        for (const b of res.body.items ?? []) {
          if (!b.id || !b.name || b.privacy === 'SECRET') continue;
          boards.push({
            id: b.id,
            name: b.name,
            privacy: b.privacy === 'PROTECTED' ? 'protected' : 'public',
          });
        }
        bookmark = res.body.bookmark;
        if (!bookmark) break;
      }
      return { network: 'pinterest', boards };
    },
  };
}
