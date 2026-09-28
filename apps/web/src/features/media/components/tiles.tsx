import type { MediaAsset } from '@socioboard/contracts';
import { Badge, Button, Card, cn, ProgressBar, Spinner } from '@socioboard/ui';
import { Film, ImageOff, RotateCcw, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { formatBytes, formatDuration } from '../../../lib/format';
import { errorMessage } from '../../../lib/i18n';
import { isPending } from '../api';
import { dismissUpload, retryUpload, type UploadItem } from '../uploads';

/** The line under a tile's name: dimensions, a video's length, or the kind. */
function assetMeta(asset: MediaAsset, kindLabel: string): string {
  if (asset.kind === 'video' && asset.durationSec !== null) {
    return `${kindLabel} · ${formatDuration(asset.durationSec)}`;
  }
  if (asset.width && asset.height) return `${String(asset.width)} × ${String(asset.height)}`;
  return kindLabel;
}

/** One asset in the grid; opens its details. */
export function AssetTile({
  asset,
  selected,
  onOpen,
}: {
  asset: MediaAsset;
  selected: boolean;
  onOpen: () => void;
}) {
  const { t } = useTranslation('media');
  const pending = isPending(asset);
  const kindLabel = t(`kinds.${asset.kind}`);
  return (
    <Card selected={selected} className="group">
      <button
        type="button"
        onClick={onOpen}
        aria-current={selected ? 'true' : undefined}
        className="flex cursor-pointer flex-col text-left outline-none"
      >
        <span className="bg-chip relative block aspect-square overflow-hidden">
          {asset.thumbnailUrl && !pending ? (
            <img
              src={asset.thumbnailUrl}
              // Decorative here: the button is named by the file name below, not the alt text.
              alt=""
              loading="lazy"
              className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none"
            />
          ) : (
            <span className="text-ink-3 flex size-full flex-col items-center justify-center gap-2 text-xs">
              {pending ? (
                <>
                  <Spinner className="size-5" />
                  {t('status.processing')}
                </>
              ) : asset.status === 'failed' ? (
                <>
                  <ImageOff className="size-5" aria-hidden="true" />
                  {t('status.failed')}
                </>
              ) : (
                <Film className="size-6" aria-hidden="true" />
              )}
            </span>
          )}
          <span className="absolute top-2 left-2 flex gap-1">
            {asset.source === 'ai' && <Badge tone="accent">{t('status.ai')}</Badge>}
            {asset.kind === 'gif' && <Badge>{t('kinds.gif')}</Badge>}
            {asset.kind === 'video' && asset.durationSec !== null && (
              <Badge>{formatDuration(asset.durationSec)}</Badge>
            )}
          </span>
        </span>
        <span className="flex min-w-0 flex-col px-3 py-2.5">
          <span className="text-ink truncate text-[13px] font-medium">{asset.name}</span>
          <span className="text-ink-3 text-xs">{assetMeta(asset, kindLabel)}</span>
        </span>
      </button>
    </Card>
  );
}

/** A file being uploaded (or that failed or was refused), shown first in the grid. */
export function UploadTile({ item }: { item: UploadItem }) {
  const { t } = useTranslation('media');
  const failed = item.status === 'failed' || item.status === 'rejected';
  let message: string;
  if (item.reject?.code === 'type') message = t('uploads.rejectType');
  else if (item.reject?.code === 'size') {
    message = t('uploads.rejectSize', {
      kind: t(`kinds.${item.reject.kind}`),
      max: formatBytes(item.reject.maxBytes),
    });
  } else if (item.status === 'failed') message = errorMessage(item.error);
  else if (item.status === 'queued') message = t('uploads.queued');
  else message = t('uploads.uploading', { percent: Math.floor(item.progress) });

  return (
    <Card className={cn(failed && 'border-danger/40')}>
      <div
        className="flex aspect-square flex-col justify-end gap-2 p-3"
        {...(failed ? { role: 'alert' } : {})}
      >
        <span className={cn('text-[13px] font-semibold', failed ? 'text-danger' : 'text-ink')}>
          {failed ? (item.reject ? message : t('uploads.failed')) : message}
        </span>
        {!failed && (
          <ProgressBar
            label={t('uploads.progressLabel', { name: item.file.name })}
            {...(item.status === 'uploading' ? { value: item.progress } : {})}
          />
        )}
        <span className="text-ink-3 text-xs">
          {item.status === 'failed' ? message : formatBytes(item.file.size)}
        </span>
        <div className="flex gap-1">
          {item.status === 'failed' && (
            <Button
              size="sm"
              onClick={() => {
                retryUpload(item.id);
              }}
            >
              <RotateCcw aria-hidden="true" />
              {t('uploads.retry')}
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            aria-label={
              failed ? t('uploads.dismiss') : t('uploads.cancel', { name: item.file.name })
            }
            onClick={() => {
              dismissUpload(item.id);
            }}
          >
            {failed ? t('uploads.dismiss') : <X aria-hidden="true" />}
          </Button>
        </div>
      </div>
      <span className="flex min-w-0 flex-col px-3 py-2.5">
        <span className="text-ink truncate text-[13px] font-medium">{item.file.name}</span>
        <span className="text-ink-3 text-xs">&nbsp;</span>
      </span>
    </Card>
  );
}
