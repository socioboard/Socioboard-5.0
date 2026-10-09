import type { PreviewSpec } from '@socioboard/contracts';
import { cn, PreviewFrame } from '@socioboard/ui';
import { Heart, MessageCircle, Repeat2, Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { linkHost, ownRatio } from './model';
import { FileTile, Truncated, type PreviewFile } from './shared';

export interface TumblrPreviewProps {
  account: { name: string; username: string | null; avatarUrl: string | null };
  text: string;
  files: PreviewFile[];
  link: string | null;
  spec: PreviewSpec;
}

/**
 * A post on Tumblr: the blog name and avatar, formatted text / NPF blocks, photoset grid,
 * link card, and action bar (notes, reblog, like, share).
 */
export function TumblrPreview({ account, text, files, link, spec }: TumblrPreviewProps) {
  const { t } = useTranslation('composer');
  const host = link ? linkHost(link) : null;
  const media =
    files.length > 0 ? (
      <div className="px-3.5 pb-3">
        <Grid files={files} />
      </div>
    ) : host && spec.linkCard ? (
      <div className="px-3.5 pb-3">
        <div className="overflow-hidden rounded-xl border border-[var(--sb-preview-line)] bg-[var(--sb-preview-well)]">
          <div className="aspect-[1.91/1] bg-[var(--sb-preview-well)]" aria-hidden="true" />
          <div className="p-3">
            <p className="truncate text-xs font-semibold text-[var(--sb-preview-ink-2)]">{host}</p>
            <p className="truncate text-sm text-[var(--sb-preview-ink)]">{link}</p>
          </div>
        </div>
      </div>
    ) : undefined;

  return (
    <PreviewFrame
      network="tumblr"
      account={{ name: account.name, avatarUrl: account.avatarUrl }}
      meta={account.username ? `${account.username}.tumblr.com` : t('preview.justNow')}
      media={media}
      footer={
        <div
          aria-hidden="true"
          className="flex justify-between items-center px-1 text-[var(--sb-preview-ink-2)] [&_svg]:size-4"
        >
          <div className="flex items-center gap-1 text-xs">
            <MessageCircle />
            <span>0 notes</span>
          </div>
          <div className="flex items-center gap-4">
            <Share2 />
            <Repeat2 />
            <Heart />
          </div>
        </div>
      }
    >
      {text.trim() !== '' && (
        <Truncated
          text={text}
          truncateAt={spec.truncateAt}
          truncateLines={spec.truncateLines}
          moreLabel={t('preview.tumblr.more')}
        />
      )}
    </PreviewFrame>
  );
}

/** Tumblr photoset grid layout */
function Grid({ files }: { files: PreviewFile[] }) {
  const shown = files.slice(0, 10);
  const [first] = shown;
  if (shown.length === 1 && first) {
    const ratio = Math.max(0.6, ownRatio(first));
    return (
      <FileTile
        file={first}
        className="w-full overflow-hidden rounded-xl"
        style={{ aspectRatio: String(ratio) }}
      />
    );
  }
  return (
    <div
      className={cn(
        'grid gap-1 overflow-hidden rounded-xl',
        shown.length === 2 ? 'grid-cols-2 aspect-[2/1]' : 'grid-cols-2 aspect-square',
      )}
    >
      {shown.map((file) => (
        <FileTile key={file.id} file={file} className="size-full min-h-0" />
      ))}
    </div>
  );
}
