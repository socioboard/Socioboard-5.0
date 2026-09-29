import type { MediaAssetDetails } from '@socioboard/contracts';
import { Button, MediaThumb } from '@socioboard/ui';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ImagePlus, ImageUp, RotateCcw, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ApiError } from '../../../lib/api';
import { errorMessage } from '../../../lib/i18n';
import {
  dismissUpload,
  isPending,
  MEDIA_ACCEPT,
  mediaDetailQuery,
  retryUpload,
  startUploads,
  useUploads,
} from '../../media';
import { MediaPickerDialog } from './media-picker-dialog';

/**
 * The files a post (or one network's override) carries, in order: thumbnails with remove and
 * "move earlier", files still uploading, and ways to add more (upload, or pick from the library).
 * Uploads started here are attached as soon as they're stored.
 */
export function MediaStrip({
  workspaceId,
  mediaIds,
  onChange,
  onAttach,
  canUpload,
  disabled,
  label,
}: {
  workspaceId: string;
  mediaIds: string[];
  onChange: (mediaIds: string[]) => void;
  onAttach: (mediaIds: string[]) => void;
  canUpload: boolean;
  disabled: boolean;
  label: string;
}) {
  const { t } = useTranslation('composer');
  const queryClient = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);
  const [mine, setMine] = useState<string[]>([]);
  const [picking, setPicking] = useState(false);
  const uploads = useUploads(workspaceId).filter((u) => mine.includes(u.id));
  const assets = useQueries({
    queries: mediaIds.map((id) => ({
      ...mediaDetailQuery(workspaceId, id),
      // Processing finishes on the server; re-ask until the thumbnail exists.
      refetchInterval: (query: { state: { data?: MediaAssetDetails | undefined } }) =>
        query.state.data && isPending(query.state.data) ? 3000 : false,
      // A deleted file answers 404; asking again won't bring it back.
      retry: false,
    })),
  });

  const upload = (files: File[]) => {
    const ids = startUploads(queryClient, workspaceId, files, undefined, (asset) => {
      onAttach([asset.id]);
    });
    setMine((m) => [...m, ...ids]);
  };

  const move = (index: number) => {
    const next = [...mediaIds];
    const [item] = next.splice(index, 1);
    if (item === undefined) return;
    next.splice(index - 1, 0, item);
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-2">
      <ul aria-label={label} className="flex flex-wrap gap-2.5">
        {mediaIds.map((id, i) => {
          const q = assets[i];
          const asset = q?.data;
          const gone = q?.error instanceof ApiError && q.error.status === 404;
          const name = asset ? (asset.altText ?? asset.name) : gone ? t('media.deleted') : '…';
          return (
            <li key={id} className="flex flex-col items-center gap-1">
              <MediaThumb
                src={asset?.thumbnailUrl ?? null}
                alt={name}
                kind={asset?.kind ?? 'image'}
                durationSec={asset?.durationSec ?? null}
                status={
                  gone || asset?.status === 'failed'
                    ? 'failed'
                    : asset && isPending(asset)
                      ? 'processing'
                      : 'ready'
                }
                {...(disabled
                  ? {}
                  : {
                      onRemove: () => {
                        onChange(mediaIds.filter((m) => m !== id));
                      },
                      removeLabel: t('media.remove'),
                    })}
              />
              {!disabled && i > 0 && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="size-6"
                  aria-label={`${t('media.moveEarlier')}: ${name}`}
                  onClick={() => {
                    move(i);
                  }}
                >
                  <ArrowLeft className="size-3.5" aria-hidden="true" />
                </Button>
              )}
            </li>
          );
        })}
        {uploads.map((u) => (
          <li key={u.id} className="flex flex-col items-center gap-1">
            <MediaThumb
              src={null}
              alt={u.file.name}
              kind={u.file.type.startsWith('video/') ? 'video' : 'image'}
              status={u.status === 'failed' || u.status === 'rejected' ? 'failed' : 'uploading'}
            />
            {(u.status === 'failed' || u.status === 'rejected') && (
              <span className="flex items-center gap-0.5">
                {u.status === 'failed' && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="size-6"
                    aria-label={`${t('media.retry')}: ${u.file.name}`}
                    onClick={() => {
                      retryUpload(u.id);
                    }}
                  >
                    <RotateCcw className="size-3.5" aria-hidden="true" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="size-6"
                  aria-label={`${t('media.dismiss')}: ${u.file.name}`}
                  onClick={() => {
                    dismissUpload(u.id);
                    setMine((m) => m.filter((x) => x !== u.id));
                  }}
                >
                  <X className="size-3.5" aria-hidden="true" />
                </Button>
              </span>
            )}
          </li>
        ))}
      </ul>
      {uploads.some((u) => u.status === 'failed' || u.status === 'rejected') && (
        <ul className="text-danger flex flex-col gap-0.5 text-xs" role="alert">
          {uploads
            .filter((u) => u.status === 'failed' || u.status === 'rejected')
            .map((u) => (
              <li key={u.id}>
                {u.status === 'rejected'
                  ? u.reject?.code === 'size'
                    ? t('media.rejectedSize', { name: u.file.name })
                    : t('media.rejectedType', { name: u.file.name })
                  : `${t('media.uploadFailed', { name: u.file.name })} ${errorMessage(u.error)}`}
              </li>
            ))}
        </ul>
      )}
      {!disabled && (
        <div className="flex flex-wrap gap-2">
          {canUpload && (
            <Button size="sm" onClick={() => fileInput.current?.click()}>
              <ImageUp aria-hidden="true" />
              {t('media.upload')}
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => {
              setPicking(true);
            }}
          >
            <ImagePlus aria-hidden="true" />
            {t('media.library')}
          </Button>
        </div>
      )}
      <input
        ref={fileInput}
        type="file"
        accept={MEDIA_ACCEPT}
        multiple
        className="hidden"
        tabIndex={-1}
        aria-hidden="true"
        data-testid="composer-file-input"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = '';
          if (files.length > 0) upload(files);
        }}
      />
      <MediaPickerDialog
        open={picking}
        onOpenChange={setPicking}
        workspaceId={workspaceId}
        attached={mediaIds}
        onPick={onAttach}
      />
    </div>
  );
}
