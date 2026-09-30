import type { PostLabel } from '@socioboard/contracts';
import {
  Button,
  Checkbox,
  Input,
  LabelChip,
  LabelSwatch,
  Popover,
  PopoverContent,
  PopoverTrigger,
  toast,
} from '@socioboard/ui';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Tag } from 'lucide-react';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ApiError } from '../../../lib/api';
import { errorMessage } from '../../../lib/i18n';
import { useCan } from '../../../lib/permissions';
import { useWorkspace } from '../../../lib/workspace';
import { createLabel, labelsOf, labelsQuery, NEXT_COLORS, refreshLabels } from '../labels';

/** At most this many labels on one post (the API's limit). */
export const MAX_POST_LABELS = 20;

/**
 * Chooses a post's labels (docs/frontend/areas/posts.md, labels): the chosen ones as chips, and
 * "Label" opening a searchable list to tick more. People who manage labels (`posts:approve`) can
 * create one by typing a new name.
 */
export function LabelPicker({
  value,
  onChange,
  disabled = false,
}: {
  value: string[];
  onChange: (labelIds: string[]) => void;
  disabled?: boolean;
}) {
  const { t } = useTranslation('posts');
  const { workspace } = useWorkspace();
  const can = useCan();
  const queryClient = useQueryClient();
  const labels = useQuery(labelsQuery(workspace.id));
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);
  const searchId = useId();
  const canCreate = can('posts:approve');
  const chosen = labelsOf(value, labels.data);
  const full = value.length >= MAX_POST_LABELS;

  const query = search.trim();
  const matches = (labels.data ?? []).filter((l) =>
    l.name.toLowerCase().includes(query.toLowerCase()),
  );
  const exact = (labels.data ?? []).some((l) => l.name.toLowerCase() === query.toLowerCase());

  const toggle = (label: PostLabel, on: boolean) => {
    onChange(on ? [...value, label.id] : value.filter((id) => id !== label.id));
  };
  const create = async () => {
    setCreating(true);
    try {
      const color = NEXT_COLORS[(labels.data?.length ?? 0) % NEXT_COLORS.length] ?? 'blue';
      const label = await createLabel(workspace.id, { name: query, color });
      queryClient.setQueryData(labelsQuery(workspace.id).queryKey, (old) =>
        [...(old ?? []), label].sort((a, b) => a.name.localeCompare(b.name)),
      );
      void refreshLabels(queryClient, workspace.id);
      onChange([...value, label.id]);
      setSearch('');
    } catch (err) {
      toast.error(
        err instanceof ApiError && err.code === 'LABEL_EXISTS'
          ? t('labels.exists', { name: query })
          : errorMessage(err),
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {chosen.map((l) => (
        <LabelChip
          key={l.id}
          name={l.name}
          color={l.color}
          {...(disabled
            ? {}
            : {
                onRemove: () => {
                  toggle(l, false);
                },
                removeLabel: t('labels.remove', { name: l.name }),
              })}
        />
      ))}
      {!disabled && (
        <Popover
          open={open}
          onOpenChange={(next) => {
            setOpen(next);
            if (!next) setSearch('');
          }}
        >
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
              <Tag aria-hidden="true" className="size-3.5!" />
              {chosen.length > 0 ? t('labels.edit') : t('labels.add')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="flex flex-col gap-2 p-2">
            <label htmlFor={searchId} className="sr-only">
              {t('labels.search')}
            </label>
            <Input
              id={searchId}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && query && !exact && canCreate && !creating) {
                  e.preventDefault();
                  void create();
                }
              }}
              placeholder={canCreate ? t('labels.searchOrCreate') : t('labels.search')}
              maxLength={40}
              className="h-8"
            />
            <div
              className="flex max-h-60 flex-col overflow-y-auto"
              role="group"
              aria-label={t('labels.title')}
            >
              {labels.isPending && (
                <p className="text-ink-3 px-2 py-2 text-xs">{t('labels.loading')}</p>
              )}
              {labels.data?.length === 0 && !query && (
                <p className="text-ink-3 px-2 py-2 text-xs">
                  {canCreate ? t('labels.noneYetCreate') : t('labels.noneYet')}
                </p>
              )}
              {matches.map((l) => {
                const on = value.includes(l.id);
                return (
                  <Checkbox
                    key={l.id}
                    checked={on}
                    disabled={!on && full}
                    onCheckedChange={(state) => {
                      toggle(l, state === true);
                    }}
                    className="hover:bg-chip rounded-lg px-2 py-1.5 [&_label]:cursor-pointer"
                    label={
                      <span className="flex items-center gap-2">
                        <LabelSwatch color={l.color} />
                        <span className="truncate">{l.name}</span>
                      </span>
                    }
                  />
                );
              })}
            </div>
            {full && (
              <p className="text-ink-3 px-2 text-xs">
                {t('labels.full', { max: MAX_POST_LABELS })}
              </p>
            )}
            {canCreate && query && !exact && (
              <Button
                variant="ghost"
                size="sm"
                className="justify-start"
                loading={creating}
                disabled={full}
                onClick={() => void create()}
              >
                <Plus aria-hidden="true" />
                {t('labels.create', { name: query })}
              </Button>
            )}
          </PopoverContent>
        </Popover>
      )}
      {disabled && chosen.length === 0 && (
        <span className="text-ink-3 text-xs">{t('labels.none')}</span>
      )}
    </div>
  );
}
