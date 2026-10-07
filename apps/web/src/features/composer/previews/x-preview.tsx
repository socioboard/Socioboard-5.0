import type { PreviewSpec } from '@socioboard/contracts';
import { cn, PreviewFrame } from '@socioboard/ui';
import { BarChart2, Bookmark, Heart, MessageCircle, Repeat2, Share } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { linkHost, ownRatio, xShownText } from './model';
import { FileTile, Truncated, type PreviewFile } from './shared';

export interface XPreviewProps {
  account: { name: string; username: string | null; avatarUrl: string | null };
  text: string;
  files: PreviewFile[];
  link: string | null;
  spec: PreviewSpec;
}

/**
 * A post on X: the name and @handle, the whole text (ordinary accounts can't exceed 280, so X
 * cuts nothing), photos in X's layouts (one in its own shape, two side by side, one tall beside
 * two, or 2 × 2), a link card when there's no media, and X's action row.
 */
export function XPreview({ account, text, files, link, spec }: XPreviewProps) {
  const { t } = useTranslation('composer');
  const shown = xShownText(text, link);
  const host = link ? linkHost(link) : null;
  const media =
    files.length > 0 ? (
      <div className="px-3.5 pb-3">
        <Grid files={files} />
      </div>
    ) : host && spec.linkCard ? (
      <div className="px-3.5 pb-3">
        <div className="overflow-hidden rounded-2xl border border-[var(--sb-preview-line)]">
          <div className="aspect-[1.91/1] bg-[var(--sb-preview-well)]" aria-hidden="true" />
          <p className="truncate px-3 py-2 text-[13px] text-[var(--sb-preview-ink-2)]">
            {t('preview.x.from', { host })}
          </p>
        </div>
      </div>
    ) : undefined;

  return (
    <PreviewFrame
      network="x"
      account={{ name: account.name, avatarUrl: account.avatarUrl }}
      meta={
        account.username
          ? t('preview.x.handle', { username: account.username })
          : t('preview.justNow')
      }
      media={media}
      footer={
        <div
          aria-hidden="true"
          className="flex justify-between px-1 text-[var(--sb-preview-ink-2)] [&_svg]:size-4"
        >
          <MessageCircle />
          <Repeat2 />
          <Heart />
          <BarChart2 />
          <span className="flex gap-3">
            <Bookmark />
            <Share />
          </span>
        </div>
      }
    >
      {shown !== '' && (
        <Truncated
          text={shown}
          truncateAt={spec.truncateAt}
          truncateLines={spec.truncateLines}
          moreLabel={t('preview.x.showMore')}
        />
      )}
    </PreviewFrame>
  );
}

/** X's photo layouts, with rounded corners and thin gaps. */
function Grid({ files }: { files: PreviewFile[] }) {
  const shown = files.slice(0, 4);
  const [first] = shown;
  if (shown.length === 1 && first) {
    // One photo keeps its shape, within what the timeline shows (3:4 to 16:9).
    const ratio = Math.min(16 / 9, Math.max(0.75, ownRatio(first)));
    return (
      <FileTile
        file={first}
        className="w-full overflow-hidden rounded-2xl"
        style={{ aspectRatio: String(ratio) }}
      />
    );
  }
  return (
    <div
      className={cn(
        'grid aspect-[16/9] gap-0.5 overflow-hidden rounded-2xl',
        'grid-cols-2',
        shown.length === 3 ? 'grid-rows-2' : shown.length === 4 ? 'grid-rows-2' : 'grid-rows-1',
      )}
    >
      {shown.map((file, i) => (
        <FileTile
          key={file.id}
          file={file}
          className={cn('size-full min-h-0', shown.length === 3 && i === 0 && 'row-span-2')}
        />
      ))}
    </div>
  );
}
