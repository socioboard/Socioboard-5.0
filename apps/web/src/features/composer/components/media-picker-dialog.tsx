import type { MediaAsset } from '@socioboard/contracts';
import {
  Button,
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Skeleton,
  Spinner,
} from '@socioboard/ui';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Check, Film } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { FormError } from '../../auth';
import { isPending, mediaListQuery } from '../../media';

/**
 * The media library as a picker: tick files in the order they should appear; files already on
 * the post are shown as attached. Files still processing can be picked too (publishing waits for
 * them to be ready, and validation says so).
 */
export function MediaPickerDialog({
  open,
  onOpenChange,
  workspaceId,
  attached,
  onPick,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  attached: string[];
  onPick: (mediaIds: string[]) => void;
}) {
  const { t } = useTranslation('composer');
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent closeLabel={t('picker.close')} className="sm:max-w-2xl">
        <PickerBody
          workspaceId={workspaceId}
          attached={attached}
          onDone={(ids) => {
            if (ids.length > 0) onPick(ids);
            onOpenChange(false);
          }}
          onCancel={() => {
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

function PickerBody({
  workspaceId,
  attached,
  onDone,
  onCancel,
}: {
  workspaceId: string;
  attached: string[];
  onDone: (ids: string[]) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation('composer');
  const list = useInfiniteQuery(mediaListQuery(workspaceId, {}));
  const [chosen, setChosen] = useState<string[]>([]);
  const assets = (list.data?.pages.flatMap((p) => p.items) ?? []).filter(
    (a) => a.status !== 'failed',
  );

  const toggle = (id: string) => {
    setChosen((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t('picker.title')}</DialogTitle>
        <DialogDescription>{t('picker.description')}</DialogDescription>
      </DialogHeader>
      <div className="-mx-1 max-h-[60vh] overflow-y-auto px-1 py-1">
        {list.isPending ? (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4" aria-hidden="true">
            {Array.from({ length: 8 }, (_, i) => (
              <Skeleton key={i} className="rounded-control aspect-square" />
            ))}
          </div>
        ) : list.isError ? (
          <FormError>{t('picker.loadError')}</FormError>
        ) : assets.length === 0 ? (
          <p className="text-ink-2 py-6 text-center text-sm">{t('picker.empty')}</p>
        ) : (
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {assets.map((a) => (
              <li key={a.id}>
                <PickTile
                  asset={a}
                  attached={attached.includes(a.id)}
                  order={chosen.indexOf(a.id) + 1}
                  onToggle={() => {
                    toggle(a.id);
                  }}
                />
              </li>
            ))}
          </ul>
        )}
        {list.hasNextPage && (
          <div className="flex justify-center pt-3">
            <Button
              size="sm"
              disabled={list.isFetchingNextPage}
              onClick={() => void list.fetchNextPage()}
            >
              {t('picker.loadMore')}
            </Button>
          </div>
        )}
      </div>
      <DialogFooter>
        <Button variant="ghost" onClick={onCancel}>
          {t('picker.cancel')}
        </Button>
        <Button
          variant="primary"
          disabled={chosen.length === 0}
          onClick={() => {
            onDone(chosen);
          }}
        >
          {t('picker.add', { count: chosen.length })}
        </Button>
      </DialogFooter>
    </>
  );
}

function PickTile({
  asset,
  attached,
  order,
  onToggle,
}: {
  asset: MediaAsset;
  attached: boolean;
  /** Position among the picked files; 0 when not picked. */
  order: number;
  onToggle: () => void;
}) {
  const { t } = useTranslation('composer');
  const on = attached || order > 0;
  const [broken, setBroken] = useState(false);
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={
        attached
          ? `${asset.name}, ${t('picker.attached')}`
          : t('picker.select', { name: asset.name })
      }
      disabled={attached}
      onClick={onToggle}
      className={cn(
        'rounded-control bg-chip focus-visible:ring-selected relative block aspect-square w-full overflow-hidden outline-none',
        on && 'ring-selected',
        attached && 'cursor-default opacity-60',
      )}
    >
      {asset.thumbnailUrl && !isPending(asset) && !broken ? (
        <img
          src={asset.thumbnailUrl}
          alt=""
          loading="lazy"
          className="size-full object-cover"
          onError={() => {
            setBroken(true);
          }}
        />
      ) : (
        <span className="text-ink-3 flex size-full items-center justify-center">
          {isPending(asset) ? (
            <Spinner className="size-5" />
          ) : (
            <Film className="size-5" aria-hidden="true" />
          )}
        </span>
      )}
      {on && (
        <span
          aria-hidden="true"
          className="bg-ring ring-canvas absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full text-[11px] font-semibold text-white ring-2"
        >
          {attached ? <Check className="size-3" strokeWidth={3} /> : order}
        </span>
      )}
      <span className="absolute inset-x-0 bottom-0 truncate bg-black/45 px-1.5 py-0.5 text-left text-[11px] text-white">
        {asset.name}
      </span>
    </button>
  );
}
