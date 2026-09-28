import { apiRoutes, type MediaFolder } from '@socioboard/contracts';
import {
  Button,
  cn,
  ConfirmDialog,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  toast,
} from '@socioboard/ui';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FolderPlus, MoreHorizontal } from 'lucide-react';
import { useId, useState, type SyntheticEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { api } from '../../../lib/api';
import { errorMessage } from '../../../lib/i18n';
import { FormError } from '../../auth';
import { foldersQuery, mediaKeys } from '../api';

const chip = [
  'glass-chip text-ink-2 hover:text-ink inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3 text-[13px] font-medium',
  // Selected: a violet edge; a folder's "…" button shares it, so the two read as one pill.
  'aria-pressed:bg-glass aria-pressed:text-ink aria-pressed:border-ring',
];

/**
 * The folder filter as a row of chips: everything, files in no folder, then each folder. People who
 * can upload also create, rename and delete folders here.
 */
export function FolderBar({
  workspaceId,
  selected,
  onSelect,
  canEdit,
}: {
  workspaceId: string;
  selected: string | undefined;
  onSelect: (folder: string | undefined) => void;
  canEdit: boolean;
}) {
  const { t } = useTranslation('media');
  const folders = useQuery(foldersQuery(workspaceId));
  const [renaming, setRenaming] = useState<MediaFolder | null>(null);
  const [deleting, setDeleting] = useState<MediaFolder | null>(null);
  const queryClient = useQueryClient();
  const list = [...(folders.data ?? [])].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div
      role="group"
      aria-label={t('folders.label')}
      className="flex items-center gap-2 overflow-x-auto pb-1"
    >
      <button
        type="button"
        className={cn(chip)}
        aria-pressed={selected === undefined}
        onClick={() => {
          onSelect(undefined);
        }}
      >
        {t('folders.all')}
      </button>
      {list.length > 0 && (
        <button
          type="button"
          className={cn(chip)}
          aria-pressed={selected === 'root'}
          onClick={() => {
            onSelect('root');
          }}
        >
          {t('folders.root')}
        </button>
      )}
      {list.map((folder) => (
        <span key={folder.id} className="inline-flex shrink-0 items-center">
          <button
            type="button"
            className={cn(
              chip,
              selected === folder.id && canEdit && 'rounded-r-none border-r-0 pr-2',
            )}
            aria-pressed={selected === folder.id}
            onClick={() => {
              onSelect(folder.id);
            }}
          >
            {folder.name}
          </button>
          {selected === folder.id && canEdit && (
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label={t('folders.actions', { name: folder.name })}
                className={cn(
                  chip,
                  'bg-glass text-ink border-ring! rounded-l-none border-l-0! px-2',
                )}
              >
                <MoreHorizontal className="size-4" aria-hidden="true" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-40">
                <DropdownMenuItem
                  onSelect={() => {
                    setRenaming(folder);
                  }}
                >
                  {t('folders.rename')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  tone="danger"
                  onSelect={() => {
                    setDeleting(folder);
                  }}
                >
                  {t('folders.delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </span>
      ))}
      {canEdit && <NewFolder workspaceId={workspaceId} onCreated={onSelect} />}

      <RenameFolderDialog
        workspaceId={workspaceId}
        folder={renaming}
        onClose={() => {
          setRenaming(null);
        }}
      />
      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        tone="danger"
        title={t('folders.deleteTitle', { name: deleting?.name ?? '' })}
        description={t('folders.deleteDescription')}
        confirmLabel={t('folders.deleteConfirm')}
        cancelLabel={t('details.cancel')}
        closeLabel={t('details.close')}
        errorMessage={errorMessage}
        onConfirm={async () => {
          if (!deleting) return;
          await api(apiRoutes.media.deleteFolder, {
            params: { workspaceId, folderId: deleting.id },
          });
          if (selected === deleting.id) onSelect(undefined);
          // Its files moved up a level: folders and every list change.
          await queryClient.invalidateQueries({ queryKey: mediaKeys.all(workspaceId) });
          toast.success(t('folders.deleted'));
        }}
      />
    </div>
  );
}

function NewFolder({
  workspaceId,
  onCreated,
}: {
  workspaceId: string;
  onCreated: (id: string) => void;
}) {
  const { t } = useTranslation('media');
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className={cn(chip, 'border-dashed')}>
        <FolderPlus className="size-3.5" aria-hidden="true" />
        {t('folders.new')}
      </PopoverTrigger>
      <PopoverContent aria-label={t('folders.new')}>
        <FolderNameForm
          submitLabel={t('folders.create')}
          onSubmit={async (name) => {
            const folder = await api(apiRoutes.media.createFolder, {
              params: { workspaceId },
              body: { name },
            });
            await queryClient.invalidateQueries({ queryKey: mediaKeys.folders(workspaceId) });
            toast.success(t('folders.created', { name: folder.name }));
            setOpen(false);
            onCreated(folder.id);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

function RenameFolderDialog({
  workspaceId,
  folder,
  onClose,
}: {
  workspaceId: string;
  folder: MediaFolder | null;
  onClose: () => void;
}) {
  const { t } = useTranslation('media');
  const queryClient = useQueryClient();
  return (
    <Dialog
      open={folder !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent closeLabel={t('details.close')} className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t('folders.rename')}</DialogTitle>
        </DialogHeader>
        {folder && (
          <FolderNameForm
            initial={folder.name}
            submitLabel={t('details.save')}
            footer
            onSubmit={async (name) => {
              await api(apiRoutes.media.updateFolder, {
                params: { workspaceId, folderId: folder.id },
                body: { name },
              });
              await queryClient.invalidateQueries({ queryKey: mediaKeys.folders(workspaceId) });
              toast.success(t('folders.renamed'));
              onClose();
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function FolderNameForm({
  initial = '',
  submitLabel,
  footer = false,
  onSubmit,
}: {
  initial?: string;
  submitLabel: string;
  footer?: boolean;
  onSubmit: (name: string) => Promise<void>;
}) {
  const { t } = useTranslation('media');
  const id = useId();
  const [name, setName] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  const submit = async (event: SyntheticEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError(t('folders.nameRequired'));
      return;
    }
    setBusy(true);
    setError(undefined);
    try {
      await onSubmit(trimmed);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const button = (
    <Button type="submit" variant="primary" size="sm" loading={busy}>
      {submitLabel}
    </Button>
  );
  return (
    <form onSubmit={(e) => void submit(e)} noValidate className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={id}>{t('folders.name')}</Label>
        <Input
          id={id}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
          maxLength={80}
          autoFocus
          autoComplete="off"
        />
      </div>
      <FormError>{error}</FormError>
      {footer ? (
        <DialogFooter>{button}</DialogFooter>
      ) : (
        <div className="flex justify-end">{button}</div>
      )}
    </form>
  );
}
