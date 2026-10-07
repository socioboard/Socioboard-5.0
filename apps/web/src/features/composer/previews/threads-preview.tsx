import type { PreviewSpec } from '@socioboard/contracts';
import { cn, PreviewFrame } from '@socioboard/ui';
import { Heart, MessageCircle, Repeat2, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { linkHost, ownRatio } from './model';
import { FileTile, Truncated, type PreviewFile } from './shared';

export interface ThreadsPreviewProps {
  account: { name: string; username: string | null; avatarUrl: string | null };
  text: string;
  files: PreviewFile[];
  link: string | null;
  firstComment: string | null;
  spec: PreviewSpec;
}

/**
 * A post on Threads (P3-B10): the username, the whole text (Threads shows all 500 characters),
 * photos and videos in a row that scrolls sideways (one keeps its own shape), a link card when
 * there's no media (with media the link goes at the end of the text), the action row, and the
 * first comment as the author's reply underneath.
 */
export function ThreadsPreview({
  account,
  text,
  files,
  link,
  firstComment,
  spec,
}: ThreadsPreviewProps) {
  const { t } = useTranslation('composer');
  const host = link ? linkHost(link) : null;
  const shown =
    link && files.length > 0 ? [text, link].filter((s) => s.trim() !== '').join('\n\n') : text;
  const name = account.username ?? account.name;
  const media =
    files.length > 0 ? (
      <div className="px-3.5 pb-3">
        <Row files={files} />
      </div>
    ) : host && spec.linkCard ? (
      <div className="px-3.5 pb-3">
        <div className="overflow-hidden rounded-xl border border-[var(--sb-preview-line)]">
          <div className="aspect-[1.91/1] bg-[var(--sb-preview-well)]" aria-hidden="true" />
          <p className="truncate px-3 py-2 text-[13px] text-[var(--sb-preview-ink-2)]">{host}</p>
        </div>
      </div>
    ) : undefined;

  return (
    <PreviewFrame
      network="threads"
      account={{ name, avatarUrl: account.avatarUrl }}
      meta={t('preview.justNow')}
      media={media}
      footer={
        <>
          <div
            aria-hidden="true"
            className="flex gap-5 px-1 text-[var(--sb-preview-ink-2)] [&_svg]:size-[18px]"
          >
            <Heart />
            <MessageCircle />
            <Repeat2 />
            <Send />
          </div>
          {firstComment && (
            <div className="mt-3 border-t border-[var(--sb-preview-line)] pt-3 text-[13px]">
              <p className="text-[var(--sb-preview-ink-2)]">{t('preview.threads.reply')}</p>
              <p className="mt-1 break-words whitespace-pre-wrap">
                <span className="font-semibold">{name}</span> {firstComment}
              </p>
            </div>
          )}
        </>
      }
    >
      {shown.trim() !== '' && (
        <Truncated
          text={shown}
          truncateAt={spec.truncateAt}
          truncateLines={spec.truncateLines}
          moreLabel={t('preview.threads.more')}
        />
      )}
    </PreviewFrame>
  );
}

/** One file in its own shape; several side by side, scrolling sideways as on Threads. */
function Row({ files }: { files: PreviewFile[] }) {
  const [first] = files;
  if (files.length === 1 && first) {
    return (
      <FileTile
        file={first}
        className="w-full overflow-hidden rounded-xl"
        style={{ aspectRatio: String(Math.max(0.75, ownRatio(first))) }}
      />
    );
  }
  return (
    <div className={cn('flex gap-1.5 overflow-x-auto [scrollbar-width:none]')}>
      {files.map((file) => (
        <FileTile
          key={file.id}
          file={file}
          className="h-48 shrink-0 overflow-hidden rounded-xl"
          style={{ aspectRatio: String(Math.min(1.25, Math.max(0.75, ownRatio(file)))) }}
        />
      ))}
    </div>
  );
}
