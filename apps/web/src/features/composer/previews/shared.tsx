import { cn } from '@socioboard/ui';
import { Film, Image as ImageIcon, Play } from 'lucide-react';
import { useState, type CSSProperties, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { textParts, truncateText } from './model';

/** One attached file as a preview shows it. */
export interface PreviewFile {
  id: string;
  kind: 'image' | 'video' | 'gif';
  /** The full file where it can be shown, else its thumbnail; null while there's neither. */
  src: string | null;
  width: number | null;
  height: number | null;
  alt: string;
}

/**
 * Text with #hashtags, @mentions and links coloured as the network does, as plain React text.
 * `plainLinks`: the network doesn't make web addresses in text clickable (Instagram).
 */
export function RichText({ text, plainLinks = false }: { text: string; plainLinks?: boolean }) {
  return (
    <>
      {textParts(text).map((part, i) =>
        part.kind === 'text' || (plainLinks && part.kind === 'link') ? (
          <span key={i}>{part.value}</span>
        ) : (
          <span key={i} className="text-[var(--sb-preview-link)]">
            {part.value}
          </span>
        ),
      )}
    </>
  );
}

/**
 * The text cut where the network cuts it, with its "See more" (which expands it, as on the
 * network). `lead` goes before the text (Instagram's bold username).
 */
export function Truncated({
  text,
  truncateAt,
  moreLabel,
  lead,
  plainLinks = false,
}: {
  text: string;
  truncateAt: number | null;
  moreLabel: string;
  lead?: ReactNode;
  plainLinks?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const { shown, truncated } = truncateText(text, truncateAt);
  return (
    <p className="break-words whitespace-pre-wrap">
      {lead}
      <RichText text={open ? text : shown} plainLinks={plainLinks} />
      {truncated && !open && (
        <>
          {'… '}
          <button
            type="button"
            onClick={() => {
              setOpen(true);
            }}
            className="font-semibold text-[var(--sb-preview-ink-2)] hover:underline"
          >
            {moreLabel}
          </button>
        </>
      )}
    </p>
  );
}

/** One file filling its box: the picture (a video shows its poster and a play mark). */
export function FileTile({
  file,
  className,
  style,
  quiet = false,
  children,
}: {
  file: PreviewFile;
  className?: string;
  style?: CSSProperties;
  /** Leave out the placeholder's icon (something is drawn over the tile, like "+3"). */
  quiet?: boolean;
  children?: ReactNode;
}) {
  const { t } = useTranslation('composer');
  const [broken, setBroken] = useState<string | null>(null);
  const showImage = file.src !== null && file.src !== broken;
  return (
    <div
      className={cn('relative overflow-hidden bg-[var(--sb-preview-well)]', className)}
      style={style}
    >
      {showImage ? (
        <img
          src={file.src ?? undefined}
          alt={file.alt}
          className="size-full object-cover"
          onError={() => {
            setBroken(file.src);
          }}
        />
      ) : (
        <div
          role="img"
          aria-label={file.alt}
          className="flex size-full flex-col items-center justify-center gap-1.5 text-xs text-[var(--sb-preview-ink-2)]"
        >
          {quiet ? null : file.kind === 'video' ? (
            <Film className="size-6" aria-hidden="true" />
          ) : (
            <ImageIcon className="size-6" aria-hidden="true" />
          )}
          <span className="sr-only">{t('preview.noPicture')}</span>
        </div>
      )}
      {file.kind === 'video' && !quiet && (
        <span
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white"
        >
          <Play className="size-5 translate-x-px fill-current" />
        </span>
      )}
      {children}
    </div>
  );
}
