import type { PreviewSpec } from '@socioboard/contracts';
import { Avatar, cn, PreviewFrame } from '@socioboard/ui';
import { Earth, MessageCircle, Share2, ThumbsUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { croppedRatio, gridLayout, linkHost, ownRatio } from './model';
import { FileTile, RichText, Truncated, type PreviewFile } from './shared';

export interface FacebookPreviewProps {
  account: { name: string; avatarUrl: string | null };
  text: string;
  files: PreviewFile[];
  link: string | null;
  firstComment: string | null;
  spec: PreviewSpec;
}

/**
 * A Page post in the Facebook feed: the Page's name, "Just now" and the public globe; the text
 * cut at "See more"; photos in Facebook's grid (or a link card when there are none); the
 * reactions bar; and the first comment under it.
 */
export function FacebookPreview({
  account,
  text,
  files,
  link,
  firstComment,
  spec,
}: FacebookPreviewProps) {
  const { t } = useTranslation('composer');
  const host = link ? linkHost(link) : null;
  const media =
    files.length > 0 ? (
      <Grid files={files} crop={spec.cropAspectRatio} />
    ) : host && spec.linkCard ? (
      <div className="border-t border-[var(--sb-preview-line)] bg-[var(--sb-preview-well)] px-3.5 py-3">
        <p className="text-[11px] tracking-wide text-[var(--sb-preview-ink-2)] uppercase">{host}</p>
        <p className="truncate text-[15px] font-semibold">{link}</p>
      </div>
    ) : undefined;

  return (
    <PreviewFrame
      network="facebook_page"
      account={{ name: account.name, avatarUrl: account.avatarUrl }}
      meta={
        <span className="inline-flex items-center gap-1">
          {t('preview.justNow')} ·
          <Earth className="size-3" aria-label={t('preview.public')} />
        </span>
      }
      media={media}
      footer={
        <div className="flex flex-col gap-2">
          <div
            aria-hidden="true"
            className="flex justify-around text-[13px] font-semibold text-[var(--sb-preview-ink-2)]"
          >
            <span className="inline-flex items-center gap-1.5">
              <ThumbsUp className="size-4" /> {t('preview.facebook.like')}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MessageCircle className="size-4" /> {t('preview.facebook.comment')}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Share2 className="size-4" /> {t('preview.facebook.share')}
            </span>
          </div>
          {firstComment && (
            <div className="flex items-start gap-2 border-t border-[var(--sb-preview-line)] pt-2">
              <Avatar name={account.name} src={account.avatarUrl} size="sm" decorative />
              <div className="min-w-0 rounded-2xl bg-[var(--sb-preview-well)] px-3 py-1.5 text-[13px]">
                <p className="font-semibold">{account.name}</p>
                <p className="break-words whitespace-pre-wrap">
                  <RichText text={firstComment} />
                </p>
              </div>
            </div>
          )}
        </div>
      }
    >
      {text.trim() !== '' && (
        <Truncated
          text={text}
          truncateAt={spec.truncateAt}
          moreLabel={t('preview.facebook.seeMore')}
        />
      )}
    </PreviewFrame>
  );
}

/** Facebook's photo grid: one in its own shape, two side by side, one above two, or 2 × 2 (+N). */
function Grid({ files, crop }: { files: PreviewFile[]; crop: PreviewSpec['cropAspectRatio'] }) {
  const layout = gridLayout(files.length);
  const shown = files.slice(0, layout.shown);
  const [first] = shown;
  if (layout.arrangement === 'single' && first) {
    // A tall photo is cut to 4:5 in the feed; a wide one shows whole.
    const ratio = Math.max(0.8, croppedRatio(ownRatio(first), crop));
    return <FileTile file={first} className="w-full" style={{ aspectRatio: String(ratio) }} />;
  }
  return (
    <div
      className={cn(
        'grid gap-0.5',
        layout.arrangement === 'pair' && 'aspect-[2/1] grid-cols-2',
        layout.arrangement === 'hero' && 'aspect-square grid-cols-2 grid-rows-[2fr_1fr]',
        layout.arrangement === 'quad' && 'aspect-square grid-cols-2 grid-rows-2',
      )}
    >
      {shown.map((file, i) => {
        const last = i === shown.length - 1;
        return (
          <FileTile
            key={file.id}
            file={file}
            quiet={last && layout.more > 0}
            className={cn(
              'size-full min-h-0',
              layout.arrangement === 'hero' && i === 0 && 'col-span-2',
            )}
          >
            {last && layout.more > 0 && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-2xl font-semibold text-white">
                +{layout.more}
              </span>
            )}
          </FileTile>
        );
      })}
    </div>
  );
}
