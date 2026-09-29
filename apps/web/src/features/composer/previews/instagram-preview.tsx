import type { PreviewSpec } from '@socioboard/contracts';
import { cn, PreviewFrame } from '@socioboard/ui';
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Heart,
  ImagePlus,
  MessageCircle,
  Send,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { instagramFrameRatio } from './model';
import { FileTile, RichText, Truncated, type PreviewFile } from './shared';

export interface InstagramPreviewProps {
  account: { name: string; username: string | null; avatarUrl: string | null };
  text: string;
  files: PreviewFile[];
  format: 'feed' | 'reel' | 'story';
  firstComment: string | null;
  spec: PreviewSpec;
}

/**
 * An Instagram post: the media first, cropped to one frame (a feed post or carousel takes the
 * first file's shape within 4:5 to 1.91:1; reels and stories are 9:16), a swipeable carousel with
 * dots, the action row, and the caption under the username, cut at "more". Stories show no
 * caption. Links in captions aren't clickable on Instagram, so they aren't styled as links.
 */
export function InstagramPreview({
  account,
  text,
  files,
  format,
  firstComment,
  spec,
}: InstagramPreviewProps) {
  const { t } = useTranslation('composer');
  const handle = account.username ?? account.name;
  const ratio = instagramFrameRatio(format, files[0], spec.cropAspectRatio);
  const shown = format === 'feed' ? files : files.slice(0, 1);

  const media =
    shown.length === 0 ? (
      <div
        className="flex flex-col items-center justify-center gap-2 bg-[var(--sb-preview-well)] text-sm text-[var(--sb-preview-ink-2)]"
        style={{ aspectRatio: String(ratio) }}
      >
        <ImagePlus className="size-7" aria-hidden="true" />
        {t('preview.instagram.needsMedia')}
      </div>
    ) : (
      <Carousel files={shown} ratio={ratio} format={format} />
    );

  if (format === 'story') {
    return (
      <PreviewFrame
        network="instagram"
        // Stories and reels are phone-shaped: a narrower card, like the phone screen they fill.
        className="max-w-[300px]"
        account={{ name: account.name, username: handle, avatarUrl: account.avatarUrl }}
        meta={t('preview.instagram.story')}
        mediaFirst
        media={media}
        footer={
          <p className="text-xs text-[var(--sb-preview-ink-2)]">
            {t('preview.instagram.noCaption')}
          </p>
        }
      />
    );
  }

  return (
    <PreviewFrame
      network="instagram"
      {...(format === 'reel' ? { className: 'max-w-[300px]' } : {})}
      account={{ name: account.name, username: handle, avatarUrl: account.avatarUrl }}
      {...(format === 'reel' ? { meta: t('preview.instagram.reel') } : {})}
      mediaFirst
      media={
        <>
          {media}
          <div
            aria-hidden="true"
            className="flex items-center gap-4 px-3.5 pt-3 text-[var(--sb-preview-ink)]"
          >
            <Heart className="size-6" />
            <MessageCircle className="size-6 -scale-x-100" />
            <Send className="size-6" />
            <Bookmark className="ml-auto size-6" />
          </div>
        </>
      }
      {...(firstComment
        ? {
            footer: (
              <p className="text-[13px] break-words whitespace-pre-wrap">
                <span className="font-semibold">{handle}</span>{' '}
                <InstagramText text={firstComment} />
              </p>
            ),
          }
        : {})}
    >
      {text.trim() !== '' && (
        <Truncated
          text={text}
          truncateAt={spec.truncateAt}
          truncateLines={spec.truncateLines}
          moreLabel={t('preview.instagram.more')}
          lead={<span className="mr-1 font-semibold">{handle}</span>}
          plainLinks
        />
      )}
    </PreviewFrame>
  );
}

/** Hashtags and mentions are coloured on Instagram; web addresses stay plain text. */
function InstagramText({ text }: { text: string }) {
  return <RichText text={text} plainLinks />;
}

function Carousel({
  files,
  ratio,
  format,
}: {
  files: PreviewFile[];
  ratio: number;
  format: 'feed' | 'reel' | 'story';
}) {
  const { t } = useTranslation('composer');
  const [index, setIndex] = useState(0);
  const at = Math.min(index, files.length - 1);
  const file = files[at];
  if (!file) return null;
  const many = files.length > 1;
  return (
    <div
      className="relative"
      {...(many
        ? {
            role: 'group',
            'aria-roledescription': 'carousel',
            'aria-label': t('preview.instagram.carousel', { at: at + 1, count: files.length }),
          }
        : {})}
    >
      <FileTile file={file} className="w-full" style={{ aspectRatio: String(ratio) }}>
        {format === 'story' && (
          // The story's progress bar; the account is already named in the card's header.
          <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/40 to-transparent p-3">
            <span className="block h-0.5 rounded-full bg-white/80" aria-hidden="true" />
          </div>
        )}
        {many && (
          <span className="absolute top-3 right-3 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white tabular-nums">
            {at + 1}/{files.length}
          </span>
        )}
      </FileTile>
      {many && (
        <>
          {at > 0 && (
            <button
              type="button"
              aria-label={t('preview.instagram.previous')}
              onClick={() => {
                setIndex(at - 1);
              }}
              className="absolute top-1/2 left-2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-black shadow"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </button>
          )}
          {at < files.length - 1 && (
            <button
              type="button"
              aria-label={t('preview.instagram.next')}
              onClick={() => {
                setIndex(at + 1);
              }}
              className="absolute top-1/2 right-2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-black shadow"
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>
          )}
          <div
            className="absolute inset-x-0 -bottom-5 flex justify-center gap-1"
            aria-hidden="true"
          >
            {files.map((f, i) => (
              <span
                key={f.id}
                className={cn(
                  'size-1.5 rounded-full',
                  i === at ? 'bg-[#0095f6]' : 'bg-[var(--sb-preview-line)]',
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
