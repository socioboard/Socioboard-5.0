import type { LabelColor, PostLabel } from '@socioboard/contracts';
import {
  Button,
  ConfirmDialog,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  Input,
  LABEL_COLOR_NAMES,
  LabelSwatch,
  Skeleton,
  toast,
} from '@socioboard/ui';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ApiError } from '../../../lib/api';
import { errorMessage } from '../../../lib/i18n';
import { useWorkspace } from '../../../lib/workspace';
import {
  createLabel,
  deleteLabel,
  labelsQuery,
  NEXT_COLORS,
  refreshLabels,
  updateLabel,
} from '../labels';

/**
 * The workspace's label list (`posts:approve`): add one, rename or recolour one in place, delete
 * one (it comes off every post that had it).
 */
export function ManageLabelsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation('posts');
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent closeLabel={t('labels.close')} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('labels.manageTitle')}</DialogTitle>
          <DialogDescription>{t('labels.manageBody')}</DialogDescription>
        </DialogHeader>
        <LabelList />
      </DialogContent>
    </Dialog>
  );
}

function useLabelError() {
  const { t } = useTranslation('posts');
  return (err: unknown, name: string) =>
    err instanceof ApiError && err.code === 'LABEL_EXISTS'
      ? t('labels.exists', { name })
      : errorMessage(err);
}

function LabelList() {
  const { t } = useTranslation('posts');
  const { workspace } = useWorkspace();
  const queryClient = useQueryClient();
  const labels = useQuery(labelsQuery(workspace.id));
  const wording = useLabelError();
  const [name, setName] = useState('');
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<PostLabel | null>(null);

  const add = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setAdding(true);
    try {
      const color = NEXT_COLORS[(labels.data?.length ?? 0) % NEXT_COLORS.length] ?? 'blue';
      await createLabel(workspace.id, { name: trimmed, color });
      setName('');
      await refreshLabels(queryClient, workspace.id);
    } catch (err) {
      toast.error(wording(err, trimmed));
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void add();
        }}
      >
        <Input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
          placeholder={t('labels.newPlaceholder')}
          aria-label={t('labels.newName')}
          maxLength={40}
        />
        <Button type="submit" loading={adding} disabled={!name.trim()}>
          <Plus aria-hidden="true" />
          {t('labels.addButton')}
        </Button>
      </form>
      {labels.isPending ? (
        <div className="flex flex-col gap-2" aria-hidden="true">
          <Skeleton className="h-9" />
          <Skeleton className="h-9" />
        </div>
      ) : labels.isError ? (
        <p className="text-ink-2 text-sm">{t('labels.loadError')}</p>
      ) : labels.data.length === 0 ? (
        <p className="text-ink-3 text-sm">{t('labels.empty')}</p>
      ) : (
        <ul className="-mx-2 flex max-h-80 flex-col overflow-y-auto" aria-label={t('labels.title')}>
          {labels.data.map((label) => (
            <LabelRow
              key={label.id}
              label={label}
              onDelete={() => {
                setRemoving(label);
              }}
            />
          ))}
        </ul>
      )}
      <ConfirmDialog
        open={removing !== null}
        onOpenChange={(o) => {
          if (!o) setRemoving(null);
        }}
        title={t('labels.deleteTitle', { name: removing?.name ?? '' })}
        description={
          removing && removing.postCount > 0
            ? t('labels.deleteBody', { count: removing.postCount })
            : t('labels.deleteBodyNone')
        }
        confirmLabel={t('labels.deleteConfirm')}
        cancelLabel={t('labels.cancel')}
        tone="danger"
        errorMessage={errorMessage}
        onConfirm={async () => {
          if (!removing) return;
          await deleteLabel(workspace.id, removing.id);
          setRemoving(null);
          await refreshLabels(queryClient, workspace.id);
        }}
      />
    </div>
  );
}

/** One label: its colour (a menu of colours), its name (edited in place) and delete. */
function LabelRow({ label, onDelete }: { label: PostLabel; onDelete: () => void }) {
  const { t } = useTranslation('posts');
  const { workspace } = useWorkspace();
  const queryClient = useQueryClient();
  const wording = useLabelError();
  const [name, setName] = useState(label.name);

  const save = async (patch: { name?: string; color?: LabelColor }) => {
    try {
      await updateLabel(workspace.id, label.id, patch);
      await refreshLabels(queryClient, workspace.id);
    } catch (err) {
      toast.error(wording(err, patch.name ?? label.name));
      setName(label.name);
    }
  };
  const rename = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setName(label.name);
      return;
    }
    if (trimmed !== label.name) void save({ name: trimmed });
  };

  return (
    <li className="hover:bg-chip flex items-center gap-2 rounded-lg px-2 py-1">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t('labels.colorOf', {
              name: label.name,
              color: t(`labels.colors.${label.color}`),
            })}
          >
            <LabelSwatch color={label.color} className="size-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuRadioGroup
            value={label.color}
            onValueChange={(color) => void save({ color: color as LabelColor })}
          >
            {LABEL_COLOR_NAMES.map((color) => (
              <DropdownMenuRadioItem key={color} value={color}>
                <LabelSwatch color={color} />
                {t(`labels.colors.${color}`)}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <Input
        value={name}
        onChange={(e) => {
          setName(e.target.value);
        }}
        onBlur={rename}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            (e.target as HTMLInputElement).blur();
          }
          if (e.key === 'Escape' && name !== label.name) {
            e.stopPropagation();
            setName(label.name);
          }
        }}
        aria-label={t('labels.rename', { name: label.name })}
        maxLength={40}
        className="h-8 min-w-0 flex-1 border-transparent bg-transparent shadow-none"
      />
      <span className="text-ink-3 shrink-0 text-xs tabular-nums">
        {t('labels.postCount', { count: label.postCount })}
      </span>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={t('labels.delete', { name: label.name })}
        onClick={onDelete}
      >
        <Trash2 aria-hidden="true" />
      </Button>
    </li>
  );
}
