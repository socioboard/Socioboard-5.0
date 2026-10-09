import type { PreviewSpec } from '@socioboard/contracts';
import { PreviewFrame } from '@socioboard/ui';
import { Bookmark, Play, Share2, ThumbsDown, ThumbsUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { FileTile, Truncated, type PreviewFile } from './shared';

export interface YouTubePreviewProps {
  account: { name: string; username: string | null; avatarUrl: string | null };
  text: string;
  files: PreviewFile[];
  title?: string | undefined;
  spec: PreviewSpec;
}

/**
 * YouTube Preview (P3-F1):
 * Simulates a YouTube video watch page with 16:9 video frame, video title, channel badge,
 * like/share engagement buttons, and the expandable video description.
 */
export function YouTubePreview({ account, text, files, title, spec }: YouTubePreviewProps) {
  const { t } = useTranslation('composer');
  const videoFile = files.find((f) => f.kind === 'video') ?? files[0];
  const trimmedTitle = title?.trim();
  const displayTitle =
    trimmedTitle && trimmedTitle !== ''
      ? trimmedTitle
      : text !== ''
        ? text.slice(0, 100)
        : t('preview.youtube.untitled');

  const media = (
    <div className="px-3.5 pb-2">
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black border border-[var(--sb-preview-line)]">
        {videoFile ? (
          videoFile.src && videoFile.kind === 'video' ? (
            <video
              src={videoFile.src}
              controls
              className="size-full object-cover"
              preload="metadata"
            />
          ) : (
            <FileTile file={videoFile} className="size-full object-cover" />
          )
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2 text-white/60">
            <Play className="size-10 fill-white/20 text-white/60" />
            <span className="text-xs">{t('preview.youtube.noVideo')}</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <PreviewFrame
      network="youtube"
      account={{ name: account.name, avatarUrl: account.avatarUrl }}
      meta={account.username ? `@${account.username.replace(/^@/, '')}` : t('preview.justNow')}
      media={media}
      footer={
        <div
          aria-hidden="true"
          className="flex justify-between items-center px-1 text-[var(--sb-preview-ink-2)] [&_svg]:size-4"
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-full bg-[var(--sb-preview-well)] px-3 py-1 text-xs font-medium"
            >
              <ThumbsUp className="size-3.5" />
              <span>{t('preview.youtube.like')}</span>
            </button>
            <button
              type="button"
              className="flex items-center rounded-full bg-[var(--sb-preview-well)] p-1.5"
            >
              <ThumbsDown className="size-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex items-center gap-1 rounded-full bg-[var(--sb-preview-well)] px-2.5 py-1 text-xs"
            >
              <Share2 className="size-3.5" />
              <span>{t('preview.youtube.share')}</span>
            </button>
            <button type="button" className="rounded-full bg-[var(--sb-preview-well)] p-1.5">
              <Bookmark className="size-3.5" />
            </button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-1.5">
        <h3 className="text-sm font-semibold text-[var(--sb-preview-ink)] leading-snug">
          {displayTitle}
        </h3>
        {text && (
          <div className="rounded-xl bg-[var(--sb-preview-well)] p-2.5 text-xs text-[var(--sb-preview-ink-2)]">
            <Truncated
              text={text}
              truncateAt={spec.truncateAt}
              truncateLines={spec.truncateLines}
              moreLabel={t('preview.youtube.showMore')}
            />
          </div>
        )}
      </div>
    </PreviewFrame>
  );
}
