import { apiRoutes, type MediaAsset, type MediaAssetDetails } from '@socioboard/contracts';
import {
  Button,
  ConfirmDialog,
  Drawer,
  DrawerContent,
  DrawerTitle,
  FormField,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Textarea,
  toast,
} from '@socioboard/ui';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ExternalLink, Trash2 } from 'lucide-react';
import { useState, type SyntheticEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { api } from '../../../lib/api';
import { formatBytes, formatDate, formatDuration } from '../../../lib/format';
import { errorMessage } from '../../../lib/i18n';
import { FormError, FormNotice } from '../../auth';
import { foldersQuery, isPending, mediaDetailQuery, mediaKeys } from '../api';

const NO_FOLDER = 'none';

/** Details of one asset, opened from the grid (`?asset=<id>`, so it can be linked). */
export function AssetDrawer({
  workspaceId,
  assetId,
  canEdit,
  onClose,
}: {
  workspaceId: string;
  assetId: string | undefined;
  canEdit: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation('media');
  return (
    <Drawer
      open={assetId !== undefined}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DrawerContent closeLabel={t('details.close')} aria-describedby={undefined}>
        {assetId && (
          <Details
            workspaceId={workspaceId}
            assetId={assetId}
            canEdit={canEdit}
            onClose={onClose}
          />
        )}
      </DrawerContent>
    </Drawer>
  );
}

function Details({
  workspaceId,
  assetId,
  canEdit,
  onClose,
}: {
  workspaceId: string;
  assetId: string;
  canEdit: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation('media');
  const detail = useQuery({
    ...mediaDetailQuery(workspaceId, assetId),
    // Processing finishes on the server; re-ask until the preview exists.
    refetchInterval: (query) => (query.state.data && isPending(query.state.data) ? 3000 : false),
  });

  if (detail.isPending) {
    return (
      <>
        <DrawerTitle className="sr-only">{t('details.title')}</DrawerTitle>
        <Skeleton className="aspect-square w-full" />
        <Skeleton className="h-10 w-full" />
      </>
    );
  }
  if (detail.isError) {
    return (
      <>
        <DrawerTitle>{t('details.title')}</DrawerTitle>
        <FormError>{errorMessage(detail.error)}</FormError>
      </>
    );
  }
  const asset = detail.data;
  return (
    <>
      <DrawerTitle className="pr-10 break-all">{asset.name}</DrawerTitle>
      <Preview asset={asset} />
      {asset.status === 'failed' && <FormError>{t('details.failed')}</FormError>}
      {isPending(asset) && <FormNotice>{t('details.processing')}</FormNotice>}
      <Info asset={asset} />
      {canEdit ? (
        <EditForm
          key={`${asset.name}|${asset.altText ?? ''}`}
          workspaceId={workspaceId}
          asset={asset}
        />
      ) : (
        asset.altText && (
          <div className="flex flex-col gap-1">
            <span className="text-ink-3 text-xs font-semibold">{t('details.altText')}</span>
            <p className="text-ink-2 text-sm leading-relaxed">{asset.altText}</p>
          </div>
        )
      )}
      <Footer workspaceId={workspaceId} asset={asset} canEdit={canEdit} onDeleted={onClose} />
    </>
  );
}

function Preview({ asset }: { asset: MediaAssetDetails }) {
  const frame = 'rounded-[14px] bg-chip w-full shadow-[0_16px_36px_-18px_rgb(0_0_0/0.5)]';
  if (asset.kind === 'video' && asset.url) {
    return (
      <video
        src={asset.url}
        {...(asset.thumbnailUrl ? { poster: asset.thumbnailUrl } : {})}
        controls
        preload="metadata"
        // A steady 16:9 frame (letterboxed), even before the video reports its size.
        className={`${frame} aspect-video bg-black object-contain`}
      />
    );
  }
  const src = asset.url ?? asset.thumbnailUrl;
  if (!src) return <div className={`${frame} aspect-square`} />;
  return <img src={src} alt={asset.altText ?? ''} className={`${frame} max-h-80 object-contain`} />;
}

function Info({ asset }: { asset: MediaAssetDetails }) {
  const { t } = useTranslation('media');
  const rows: [string, string][] = [
    [
      t('details.type'),
      `${t(`kinds.${asset.kind}`)} · ${asset.mime.split('/')[1]?.toUpperCase() ?? ''}`,
    ],
    [t('details.size'), formatBytes(asset.sizeBytes)],
  ];
  if (asset.width && asset.height) {
    rows.push([t('details.dimensions'), `${String(asset.width)} × ${String(asset.height)}`]);
  }
  if (asset.durationSec !== null)
    rows.push([t('details.duration'), formatDuration(asset.durationSec)]);
  if (asset.uploadedBy) rows.push([t('details.uploadedBy'), asset.uploadedBy.name]);
  rows.push([t('details.added'), formatDate(asset.createdAt)]);
  return (
    <dl className="grid grid-cols-[7rem_1fr] gap-y-2 text-[13px]">
      {rows.map(([label, value]) => (
        <div key={label} className="contents">
          <dt className="text-ink-3">{label}</dt>
          <dd className="text-ink">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function EditForm({ workspaceId, asset }: { workspaceId: string; asset: MediaAsset }) {
  const { t } = useTranslation('media');
  const queryClient = useQueryClient();
  const folders = useQuery(foldersQuery(workspaceId));
  const [name, setName] = useState(asset.name);
  const [altText, setAltText] = useState(asset.altText ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const dirty = name.trim() !== asset.name || altText.trim() !== (asset.altText ?? '');

  const save = async (body: {
    name?: string;
    altText?: string | null;
    folderId?: string | null;
  }) => {
    const updated = await api(apiRoutes.media.updateMedia, {
      params: { workspaceId, assetId: asset.id },
      body,
    });
    queryClient.setQueryData(mediaKeys.detail(workspaceId, asset.id), (old?: MediaAssetDetails) =>
      old ? { ...old, ...updated } : old,
    );
    await queryClient.invalidateQueries({ queryKey: mediaKeys.lists(workspaceId) });
  };

  const submit = async (event: SyntheticEvent) => {
    event.preventDefault();
    if (!dirty || !name.trim()) return;
    setBusy(true);
    setError(undefined);
    try {
      await save({
        ...(name.trim() !== asset.name ? { name: name.trim() } : {}),
        ...(altText.trim() !== (asset.altText ?? '') ? { altText: altText.trim() || null } : {}),
      });
      toast.success(t('details.saved'));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={(e) => void submit(e)} noValidate className="flex flex-col gap-4">
      <FormField label={t('details.name')}>
        {(p) => (
          <Input
            {...p}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
            maxLength={255}
          />
        )}
      </FormField>
      {asset.kind !== 'video' && (
        <FormField label={t('details.altText')} hint={t('details.altHint')}>
          {(p) => (
            <Textarea
              {...p}
              value={altText}
              onChange={(e) => {
                setAltText(e.target.value);
              }}
              placeholder={t('details.altPlaceholder')}
              maxLength={1000}
              className="min-h-20"
            />
          )}
        </FormField>
      )}
      <FormField label={t('details.folder')}>
        {(p) => (
          <Select
            value={asset.folderId ?? NO_FOLDER}
            onValueChange={(value) => {
              const folderId = value === NO_FOLDER ? null : value;
              const folderName =
                folders.data?.find((f) => f.id === folderId)?.name ?? t('details.noFolder');
              void save({ folderId })
                .then(() => toast.success(t('details.moved', { folder: folderName })))
                .catch((err: unknown) => {
                  setError(errorMessage(err));
                });
            }}
          >
            <SelectTrigger id={p.id}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_FOLDER}>{t('details.noFolder')}</SelectItem>
              {(folders.data ?? []).map((folder) => (
                <SelectItem key={folder.id} value={folder.id}>
                  {folder.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </FormField>
      <FormError>{error}</FormError>
      <div>
        <Button type="submit" variant="primary" size="sm" loading={busy} disabled={!dirty}>
          {t('details.save')}
        </Button>
      </div>
    </form>
  );
}

function Footer({
  workspaceId,
  asset,
  canEdit,
  onDeleted,
}: {
  workspaceId: string;
  asset: MediaAssetDetails;
  canEdit: boolean;
  onDeleted: () => void;
}) {
  const { t } = useTranslation('media');
  const queryClient = useQueryClient();
  const [deleting, setDeleting] = useState(false);
  return (
    <div className="border-hair mt-auto flex gap-2 border-t pt-4">
      {asset.url && (
        <Button asChild size="sm">
          <a href={asset.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink aria-hidden="true" />
            {t('details.open')}
          </a>
        </Button>
      )}
      {canEdit && (
        <Button
          size="sm"
          variant="ghost"
          className="text-danger ml-auto"
          onClick={() => {
            setDeleting(true);
          }}
        >
          <Trash2 aria-hidden="true" />
          {t('details.delete')}
        </Button>
      )}
      <ConfirmDialog
        open={deleting}
        onOpenChange={setDeleting}
        tone="danger"
        title={t('details.deleteTitle', { name: asset.name })}
        description={t('details.deleteDescription')}
        confirmLabel={t('details.deleteConfirm')}
        cancelLabel={t('details.cancel')}
        closeLabel={t('details.close')}
        errorMessage={errorMessage}
        onConfirm={async () => {
          await api(apiRoutes.media.deleteMedia, { params: { workspaceId, assetId: asset.id } });
          queryClient.removeQueries({ queryKey: mediaKeys.detail(workspaceId, asset.id) });
          await queryClient.invalidateQueries({ queryKey: mediaKeys.lists(workspaceId) });
          toast.success(t('details.deleted', { name: asset.name }));
          onDeleted();
        }}
      />
    </div>
  );
}
