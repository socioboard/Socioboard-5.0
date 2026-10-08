import type { PreviewSpec } from '@socioboard/contracts';
import { cn, PreviewFrame } from '@socioboard/ui';
import { Globe, MessageSquare, Repeat2, Send, ThumbsUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { linkedinShownText, ownRatio } from './model';
import { FileTile, Truncated, type PreviewFile } from './shared';

export interface LinkedInPreviewProps {
  account: { name: string; avatarUrl: string | null };
  text: string;
  files: PreviewFile[];
  link: string | null;
  spec: PreviewSpec;
}

/**
 * A post on a LinkedIn profile: the name, "Just now" with the globe of a public post, the text
 * cut at "…more" (about three lines), the link added after the text as LinkedIn receives it (its
 * API builds no link card), photos in LinkedIn's layouts or one video, and the action row.
 */
export function LinkedInPreview({ account, text, files, link, spec }: LinkedInPreviewProps) {
  const { t } = useTranslation('composer');
  const shown = linkedinShownText(text, link);
  const actions = [
    { icon: ThumbsUp, label: t('preview.linkedin.like') },
    { icon: MessageSquare, label: t('preview.linkedin.comment') },
    { icon: Repeat2, label: t('preview.linkedin.repost') },
    { icon: Send, label: t('preview.linkedin.send') },
  ];

  return (
    <PreviewFrame
      network="linkedin_person"
      account={{ name: account.name, avatarUrl: account.avatarUrl }}
      meta={
        <span className="inline-flex items-center gap-1">
          {t('preview.justNow')} ·
          <Globe className="size-3" aria-label={t('preview.public')} />
        </span>
      }
      media={files.length > 0 ? <Grid files={files} /> : undefined}
      footer={
        <div
          aria-hidden="true"
          className="flex justify-between px-1 text-xs font-semibold text-[var(--sb-preview-ink-2)] [&_svg]:size-4"
        >
          {actions.map(({ icon: Icon, label }) => (
            <span key={label} className="inline-flex items-center gap-1.5">
              <Icon />
              {label}
            </span>
          ))}
        </div>
      }
    >
      {shown !== '' && (
        <Truncated
          text={shown}
          truncateAt={spec.truncateAt}
          truncateLines={spec.truncateLines}
          moreLabel={t('preview.linkedin.more')}
        />
      )}
    </PreviewFrame>
  );
}

/**
 * LinkedIn's photo layouts, edge to edge: one in its own shape (a tall one cut to 4:5), two side
 * by side, three as one wide above two, four or more as one above three with "+N" on the last.
 * A video is always alone (the adapter allows one); `FileTile` plays it in place once processed.
 */
function Grid({ files }: { files: PreviewFile[] }) {
  const [first] = files;
  if (files.length === 1 && first) {
    const ratio = Math.max(0.8, ownRatio(first));
    return <FileTile file={first} className="w-full" style={{ aspectRatio: String(ratio) }} />;
  }
  const shown = files.slice(0, 4);
  const more = files.length - shown.length;
  const below = shown.length - 1;
  return (
    <div
      className={cn(
        'grid gap-0.5',
        shown.length === 2
          ? 'aspect-[2/1] grid-cols-2'
          : cn('aspect-square grid-rows-[2fr_1fr]', below === 2 ? 'grid-cols-2' : 'grid-cols-3'),
      )}
    >
      {shown.map((file, i) => {
        const last = i === shown.length - 1;
        return (
          <FileTile
            key={file.id}
            file={file}
            quiet={last && more > 0}
            className={cn(
              'size-full min-h-0',
              shown.length > 2 && i === 0 && (below === 2 ? 'col-span-2' : 'col-span-3'),
            )}
          >
            {last && more > 0 && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-2xl font-semibold text-white">
                +{more}
              </span>
            )}
          </FileTile>
        );
      })}
    </div>
  );
}
