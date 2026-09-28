import type { MediaKind } from '@socioboard/contracts';
import {
  Button,
  EmptyState,
  FileDropzone,
  PageHeader,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from '@socioboard/ui';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { ImageUp, Images, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useCan } from '../../../lib/permissions';
import { useWorkspace } from '../../../lib/workspace';
import { mediaListQuery, type MediaFilter } from '../api';
import { MEDIA_ACCEPT } from '../upload';
import { startUploads, useUploads } from '../uploads';
import { AssetDrawer } from './asset-drawer';
import { FolderBar } from './folder-bar';
import { AssetTile, UploadTile } from './tiles';

export interface MediaSearch extends MediaFilter {
  /** The asset whose details are open. */
  asset?: string | undefined;
}

const ALL = 'all';

/** `/w/:slug/media`: the library. Filters and the open asset live in the URL. */
export function MediaPage({
  search,
  onSearchChange,
}: {
  search: MediaSearch;
  onSearchChange: (patch: Partial<MediaSearch>) => void;
}) {
  const { t } = useTranslation('media');
  const { workspace } = useWorkspace();
  const can = useCan();
  const canUpload = can('media:upload');
  const queryClient = useQueryClient();
  const uploads = useUploads(workspace.id);
  const fileInput = useRef<HTMLInputElement>(null);
  const filter: MediaFilter = {
    folder: search.folder,
    kind: search.kind,
    source: search.source,
    q: search.q,
  };
  const list = useInfiniteQuery(mediaListQuery(workspace.id, filter));
  const assets = list.data?.pages.flatMap((p) => p.items) ?? [];
  const filtered = Boolean(filter.folder ?? filter.kind ?? filter.source ?? filter.q);

  const upload = (files: File[]) => {
    // Uploading while a folder is open puts the files in it.
    const folderId = search.folder && search.folder !== 'root' ? search.folder : undefined;
    startUploads(queryClient, workspace.id, files, folderId);
  };

  let body;
  if (list.isPending) {
    body = (
      <Grid>
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="rounded-control aspect-[4/5]" />
        ))}
      </Grid>
    );
  } else if (list.isError) {
    body = (
      <EmptyState
        title={t('loadError')}
        action={<Button onClick={() => void list.refetch()}>{t('retry')}</Button>}
      />
    );
  } else if (assets.length === 0 && uploads.length === 0) {
    body = filtered ? (
      <EmptyState
        icon={<Search />}
        title={t('empty.filteredTitle')}
        description={t('empty.filteredBody')}
      />
    ) : (
      <EmptyState
        icon={<Images />}
        title={t('empty.title')}
        description={canUpload ? t('empty.body') : t('empty.readOnlyBody')}
        {...(canUpload
          ? {
              action: (
                // Secondary: the header's Upload is this screen's one primary button.
                <Button onClick={() => fileInput.current?.click()}>
                  <ImageUp aria-hidden="true" />
                  {t('upload')}
                </Button>
              ),
            }
          : {})}
      />
    );
  } else {
    body = (
      <>
        <Grid>
          {uploads.map((item) => (
            <UploadTile key={item.id} item={item} />
          ))}
          {assets.map((asset) => (
            <AssetTile
              key={asset.id}
              asset={asset}
              selected={search.asset === asset.id}
              onOpen={() => {
                onSearchChange({ asset: asset.id });
              }}
            />
          ))}
        </Grid>
        {list.hasNextPage && (
          <LoadMore
            loading={list.isFetchingNextPage}
            onLoad={() => void list.fetchNextPage()}
            label={t('loadMore')}
          />
        )}
      </>
    );
  }

  return (
    <FileDropzone
      onFiles={upload}
      label={t('dropHere')}
      disabled={!canUpload}
      className="flex min-h-0 flex-1 flex-col"
    >
      <PageHeader
        title={t('title')}
        actions={
          <>
            <SearchBox
              value={search.q ?? ''}
              onChange={(q) => {
                onSearchChange({ q: q || undefined });
              }}
            />
            {canUpload && (
              <Button
                variant="primary"
                size="sm"
                aria-label={t('upload')}
                onClick={() => fileInput.current?.click()}
              >
                <ImageUp aria-hidden="true" />
                <span className="hidden sm:inline" aria-hidden="true">
                  {t('upload')}
                </span>
              </Button>
            )}
          </>
        }
      />
      <input
        ref={fileInput}
        type="file"
        accept={MEDIA_ACCEPT}
        multiple
        className="hidden"
        tabIndex={-1}
        aria-hidden="true"
        data-testid="media-file-input"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = '';
          if (files.length > 0) upload(files);
        }}
      />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-4 px-4 py-4 sm:px-5">
          <div className="flex flex-wrap items-center gap-3">
            {/* Folders get their own row on phones; beside the filters from tablet width. */}
            <div className="min-w-0 basis-full md:basis-0 md:flex-1">
              <FolderBar
                workspaceId={workspace.id}
                selected={search.folder}
                onSelect={(folder) => {
                  onSearchChange({ folder });
                }}
                canEdit={canUpload}
              />
            </div>
            <Filters search={search} onSearchChange={onSearchChange} />
          </div>
          {body}
        </div>
      </div>
      <AssetDrawer
        workspaceId={workspace.id}
        assetId={search.asset}
        canEdit={canUpload}
        onClose={() => {
          onSearchChange({ asset: undefined });
        }}
      />
    </FileDropzone>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
      {children}
    </div>
  );
}

function Filters({
  search,
  onSearchChange,
}: {
  search: MediaSearch;
  onSearchChange: (patch: Partial<MediaSearch>) => void;
}) {
  const { t } = useTranslation('media');
  const kinds: MediaKind[] = ['image', 'gif', 'video'];
  return (
    <div className="flex w-full gap-2 md:w-auto md:shrink-0">
      <Select
        value={search.kind ?? ALL}
        onValueChange={(v) => {
          onSearchChange({ kind: v === ALL ? undefined : (v as MediaKind) });
        }}
      >
        <SelectTrigger aria-label={t('filters.kind')} className="h-8 flex-1 md:w-32 md:flex-none">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{t('filters.allKinds')}</SelectItem>
          {kinds.map((kind) => (
            <SelectItem key={kind} value={kind}>
              {t(`filters.${kind}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={search.source ?? ALL}
        onValueChange={(v) => {
          onSearchChange({ source: v === ALL ? undefined : (v as 'upload' | 'ai') });
        }}
      >
        <SelectTrigger aria-label={t('filters.source')} className="h-8 flex-1 md:w-36 md:flex-none">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{t('filters.allSources')}</SelectItem>
          <SelectItem value="upload">{t('filters.upload')}</SelectItem>
          <SelectItem value="ai">{t('filters.ai')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

/** Search as you type, sent to the URL (and so the server) once typing pauses. */
function SearchBox({ value, onChange }: { value: string; onChange: (q: string) => void }) {
  const { t } = useTranslation('media');
  const [text, setText] = useState(value);
  const latest = useRef(onChange);
  useEffect(() => {
    latest.current = onChange;
  });
  useEffect(() => {
    if (text.trim() === value) return;
    const timer = setTimeout(() => {
      latest.current(text.trim());
    }, 250);
    return () => {
      clearTimeout(timer);
    };
  }, [text, value]);
  return (
    <label className="glass-chip rounded-control focus-within:border-ring flex h-8 w-36 items-center gap-2 px-2.5 sm:w-56">
      <Search className="text-ink-3 size-3.5 shrink-0" aria-hidden="true" />
      <span className="sr-only">{t('search')}</span>
      <input
        type="search"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
        }}
        placeholder={t('search')}
        className="text-ink placeholder:text-ink-3 min-w-0 flex-1 bg-transparent text-[13px] outline-none"
      />
    </label>
  );
}

/** Loads the next page when it scrolls into view; also a button for keyboards and old browsers. */
function LoadMore({
  loading,
  onLoad,
  label,
}: {
  loading: boolean;
  onLoad: () => void;
  label: string;
}) {
  const sentinel = useRef<HTMLDivElement>(null);
  const latest = useRef(onLoad);
  useEffect(() => {
    latest.current = onLoad;
  });
  useEffect(() => {
    const node = sentinel.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) latest.current();
      },
      { rootMargin: '400px' },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
    };
  }, []);
  return (
    <div ref={sentinel} className="flex justify-center py-2">
      <Button size="sm" loading={loading} onClick={onLoad}>
        {label}
      </Button>
    </div>
  );
}
