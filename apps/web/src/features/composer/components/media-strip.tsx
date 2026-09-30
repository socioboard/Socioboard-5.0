import { AnimatePresence, Button, MediaThumb, motion, springs } from '@socioboard/ui';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ImagePlus, ImageUp, RotateCcw, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ApiError } from '../../../lib/api';
import { errorMessage } from '../../../lib/i18n';
import {
  dismissUpload,
  isPending,
  MEDIA_ACCEPT,
  retryUpload,
  startUploads,
  useUploads,
} from '../../media';
import { useAttachedMedia } from '../media';
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
  uploadIds,
  onUploadIds,
}: {
  workspaceId: string;
  mediaIds: string[];
  onChange: (mediaIds: string[]) => void;
  /** Attaches files; `before`: put them ahead of these (keeping the order files were picked in). */
  onAttach: (mediaIds: string[], before?: string[]) => void;
  canUpload: boolean;
  disabled: boolean;
  label: string;
  /** Uploads started from this strip, kept by the composer per tab (so they show where started). */
  uploadIds: string[];
  onUploadIds: (update: (ids: string[]) => string[]) => void;
}) {
  const { t } = useTranslation('composer');
  const queryClient = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);
  const [picking, setPicking] = useState(false);
  const uploads = useUploads(workspaceId).filter((u) => uploadIds.includes(u.id));
  const assets = useAttachedMedia(workspaceId, mediaIds);

  const upload = (files: File[]) => {
    // Files finish in any order; each goes in ahead of any picked after it that finished first,
    // so the post keeps the order they were chosen in (even when one of them fails).
    const stored: (string | undefined)[] = files.map(() => undefined);
    const ids = startUploads(queryClient, workspaceId, files, undefined, (asset, index) => {
      stored[index] = asset.id;
      const later = stored.slice(index + 1).filter((id): id is string => id !== undefined);
      onAttach([asset.id], later);
    });
    onUploadIds((m) => [...m, ...ids]);
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
        <AnimatePresence initial={false} mode="popLayout">
          {mediaIds.map((id, i) => {
            const q = assets[i];
            const asset = q?.data;
            const gone = q?.error instanceof ApiError && q.error.status === 404;
            const name = asset ? (asset.altText ?? asset.name) : gone ? t('media.deleted') : '…';
            return (
              <motion.li
                key={id}
                layout="position"
                transition={springs.gentle}
                exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.14 } }}
                className="flex flex-col items-center gap-1"
              >
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
              </motion.li>
            );
          })}
          {uploads.map((u) => (
            <motion.li
              key={u.id}
              layout="position"
              transition={springs.gentle}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.14 } }}
              className="flex flex-col items-center gap-1"
            >
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
                      onUploadIds((m) => m.filter((x) => x !== u.id));
                    }}
                  >
                    <X className="size-3.5" aria-hidden="true" />
                  </Button>
                </span>
              )}
            </motion.li>
          ))}
        </AnimatePresence>
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
