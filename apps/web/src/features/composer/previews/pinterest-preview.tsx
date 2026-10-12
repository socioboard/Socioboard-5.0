import type { PreviewSpec } from '@socioboard/contracts';
import { cn, PreviewFrame } from '@socioboard/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { linkHost, ownRatio } from './model';
import { FileTile, Truncated, type PreviewFile } from './shared';

export interface PinterestPreviewProps {
  account: { name: string; avatarUrl: string | null };
  /** The pin's description. */
  text: string;
  /** The pin's title (the Pinterest options panel), or empty. */
  title: string;
  files: PreviewFile[];
  /** Where the pin leads: shown as its site, not in the text. */
  link: string | null;
  spec: PreviewSpec;
}

/**
 * A pin as Pinterest shows it: the picture first, in its own shape with rounded corners (a
 * carousel shows one at a time, with dots to switch), the site the pin leads to, the title in
 * bold, the description cut after a few lines, and Pinterest's red Save button.
 */
export function PinterestPreview({
  account,
  text,
  title,
  files,
  link,
  spec,
}: PinterestPreviewProps) {
  const { t } = useTranslation('composer');
  const site = link ? linkHost(link) : null;
  const heading = title.trim();
  return (
    <PreviewFrame
      network="pinterest"
      account={{ name: account.name, avatarUrl: account.avatarUrl }}
      mediaFirst
      media={files.length > 0 ? <Pictures files={files} /> : undefined}
      footer={
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-xs font-semibold text-[var(--sb-preview-ink-2)]">
            {site}
          </span>
          <span
            aria-hidden="true"
            className="rounded-full bg-[#e60023] px-4 py-2 text-sm font-semibold text-white"
          >
            {t('preview.pinterest.save')}
          </span>
        </div>
      }
    >
      {heading !== '' && <p className="mb-1 text-[15px] font-semibold">{heading}</p>}
      {text !== '' && (
        <Truncated
          text={text}
          truncateAt={spec.truncateAt}
          truncateLines={spec.truncateLines}
          moreLabel={t('preview.pinterest.more')}
        />
      )}
    </PreviewFrame>
  );
}

/** One picture, or a carousel of 2–5 shown one at a time with a dot for each. */
function Pictures({ files }: { files: PreviewFile[] }) {
  const { t } = useTranslation('composer');
  const [index, setIndex] = useState(0);
  const at = Math.min(index, files.length - 1);
  const file = files[at];
  if (!file) return null;
  const many = files.length > 1;
  return (
    <div
      className="flex flex-col items-center gap-2 px-3.5"
      {...(many
        ? {
            role: 'group',
            'aria-roledescription': 'carousel',
            'aria-label': t('preview.pinterest.carousel', { at: at + 1, count: files.length }),
          }
        : {})}
    >
      <FileTile
        file={file}
        className="w-full rounded-2xl"
        style={{ aspectRatio: String(ownRatio(file)) }}
      />
      {many && (
        <div className="flex gap-1.5">
          {files.map((f, i) => (
            <button
              key={f.id}
              type="button"
              aria-label={t('preview.pinterest.picture', { n: i + 1, count: files.length })}
              aria-current={i === at}
              onClick={() => {
                setIndex(i);
              }}
              className={cn(
                'size-2 cursor-pointer rounded-full transition-colors duration-200',
                i === at ? 'bg-[var(--sb-preview-ink)]' : 'bg-[var(--sb-preview-line)]',
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
