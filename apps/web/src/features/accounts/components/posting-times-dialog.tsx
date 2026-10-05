import {
  apiRoutes,
  QUEUE_MAX_SLOTS,
  type QueueSlot,
  type SocialAccount,
} from '@socioboard/contracts';
import {
  AnimatePresence,
  Button,
  Combobox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  FormField,
  Input,
  listItem,
  motion,
  Skeleton,
  toast,
} from '@socioboard/ui';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Copy, Plus, Sparkles, X } from 'lucide-react';
import { useId, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { api, ApiError } from '../../../lib/api';
import { errorMessage } from '../../../lib/i18n';
import { formatTimeOfDay } from '../../../lib/time';
import { useWorkspace } from '../../../lib/workspace';
import { timezoneOptions } from '../../../lib/timezones';
import { weekdayName } from '../../posts';
import { queueKeys, queueSlotsQuery } from '../api';
import {
  addSlot,
  copyDay,
  preset,
  removeSlot,
  sameSlots,
  timesOn,
  tooMany,
  WEEK,
  WEEKDAYS,
  type Preset,
} from '../posting-times';

/**
 * An account's weekly posting times (docs/frontend/areas/accounts.md): the times
 * "Add to queue" fills, each day of the week, in one timezone. Saved all at once.
 */
export function PostingTimesDialog({
  account,
  open,
  onOpenChange,
}: {
  account: Pick<SocialAccount, 'id' | 'displayName' | 'status'>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation('calendar');
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl" closeLabel={t('close')}>
        {/* Mounted only while open: each opening starts from what the server has. */}
        <Body
          account={account}
          close={() => {
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

function Body({
  account,
  close,
}: {
  account: Pick<SocialAccount, 'id' | 'displayName' | 'status'>;
  close: () => void;
}) {
  const { t } = useTranslation('calendar');
  const { workspace } = useWorkspace();
  const saved = useQuery(queueSlotsQuery(workspace.id, account.id));
  return (
    <>
      <DialogHeader>
        <DialogTitle>{t('times.title')}</DialogTitle>
        <DialogDescription>
          {t('times.description', { account: account.displayName })}
        </DialogDescription>
      </DialogHeader>
      {saved.isPending ? (
        <div className="flex flex-col gap-2" aria-hidden="true">
          {WEEK.map((d) => (
            <Skeleton key={d} className="h-10" />
          ))}
        </div>
      ) : saved.isError ? (
        <div className="flex flex-col items-start gap-3">
          <p className="text-ink-2 text-sm">{t('times.loadError')}</p>
          <Button onClick={() => void saved.refetch()}>{t('retry')}</Button>
        </div>
      ) : (
        <Editor
          account={account}
          initial={saved.data.slots}
          initialZone={saved.data.timezone}
          close={close}
        />
      )}
    </>
  );
}

function Editor({
  account,
  initial,
  initialZone,
  close,
}: {
  account: Pick<SocialAccount, 'id' | 'displayName' | 'status'>;
  initial: QueueSlot[];
  initialZone: string;
  close: () => void;
}) {
  const { t, i18n } = useTranslation('calendar');
  const { workspace } = useWorkspace();
  const client = useQueryClient();
  const [slots, setSlots] = useState(initial);
  const [timezone, setTimezone] = useState(initialZone);
  const [saving, setSaving] = useState(false);
  const zones = useMemo(() => timezoneOptions([initialZone]), [initialZone]);
  const changed = !sameSlots(slots, initial) || timezone !== initialZone;
  const over = tooMany(slots);
  const disconnected = account.status === 'disconnected';

  const save = async () => {
    setSaving(true);
    try {
      const result = await api(apiRoutes.scheduling.putQueueSlots, {
        params: { workspaceId: workspace.id, accountId: account.id },
        body: { timezone, slots },
      });
      client.setQueryData(queueKeys.slots(workspace.id, account.id), result);
      // The calendar shows free posting times.
      void client.invalidateQueries({ queryKey: ['workspaces', workspace.id, 'calendar'] });
      toast.success(
        result.slots.length === 0
          ? t('times.savedNone', { account: account.displayName })
          : t('times.saved', { account: account.displayName, count: result.slots.length }),
      );
      close();
    } catch (err) {
      toast.error(
        err instanceof ApiError && err.code === 'ACCOUNT_NOT_AVAILABLE'
          ? t('times.disconnected')
          : errorMessage(err),
      );
    } finally {
      setSaving(false);
    }
  };

  const apply = (name: Preset) => {
    setSlots(preset(name));
  };

  return (
    <>
      {disconnected && (
        <p className="bg-danger-tint text-ink rounded-control px-3 py-2 text-sm">
          {t('times.disconnected')}
        </p>
      )}
      <div className="flex flex-wrap items-end gap-3">
        <FormField label={t('times.timezone')} className="min-w-56 flex-1">
          {(control) => (
            <Combobox
              {...control}
              options={zones}
              value={timezone}
              onValueChange={setTimezone}
              searchLabel={t('times.timezoneSearch')}
              emptyText={t('times.timezoneEmpty')}
            />
          )}
        </FormField>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <Sparkles aria-hidden="true" />
              {t('times.presets')}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {(['weekdays', 'everyDay', 'clear'] as const).map((p) => (
              <DropdownMenuItem
                key={p}
                {...(p === 'clear' ? { tone: 'danger' as const } : {})}
                onSelect={() => {
                  apply(p);
                }}
              >
                {t(`times.preset.${p}`)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ul className="divide-hair flex flex-col divide-y" aria-label={t('times.week')}>
        {WEEK.map((weekday) => (
          <DayRow
            key={weekday}
            name={weekdayName(weekday, 'long', i18n.language)}
            times={timesOn(slots, weekday)}
            onAdd={(time) => {
              setSlots((s) => addSlot(s, weekday, time));
            }}
            onRemove={(time) => {
              setSlots((s) => removeSlot(s, weekday, time));
            }}
            onCopy={(to) => {
              setSlots((s) => copyDay(s, weekday, to));
            }}
          />
        ))}
      </ul>

      <p className={over ? 'text-danger text-xs' : 'text-ink-3 text-xs'} role="status">
        {over
          ? t('times.tooMany', { max: QUEUE_MAX_SLOTS })
          : slots.length === 0
            ? t('times.none')
            : t('times.count', { count: slots.length })}
      </p>

      <DialogFooter>
        <Button onClick={close} disabled={saving}>
          {t('cancel')}
        </Button>
        <Button
          variant="primary"
          loading={saving}
          disabled={!changed || over || disconnected}
          onClick={() => void save()}
        >
          {t('times.save')}
        </Button>
      </DialogFooter>
    </>
  );
}

function DayRow({
  name,
  times,
  onAdd,
  onRemove,
  onCopy,
}: {
  name: string;
  times: string[];
  onAdd: (time: string) => void;
  onRemove: (time: string) => void;
  onCopy: (to: readonly number[]) => void;
}) {
  const { t, i18n } = useTranslation('calendar');
  const id = useId();
  const [adding, setAdding] = useState(false);
  const [value, setValue] = useState('09:00');
  const add = () => {
    if (/^\d{2}:\d{2}$/.test(value)) onAdd(value);
    setAdding(false);
  };
  return (
    <li
      className="flex flex-wrap items-center gap-x-3 gap-y-2 py-2.5"
      aria-labelledby={`${id}-day`}
    >
      <span id={`${id}-day`} className="text-ink w-24 shrink-0 text-sm font-medium">
        {name}
      </span>
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
        <AnimatePresence initial={false}>
          {times.map((time, i) => (
            <motion.span
              key={time}
              {...listItem(i)}
              className="glass-chip text-ink inline-flex h-7 items-center gap-1 rounded-full pr-1 pl-2.5 text-xs font-medium tabular-nums"
            >
              {formatTimeOfDay(time, i18n.language)}
              <button
                type="button"
                aria-label={t('times.remove', {
                  time: formatTimeOfDay(time, i18n.language),
                  day: name,
                })}
                onClick={() => {
                  onRemove(time);
                }}
                className="text-ink-3 hover:bg-chip hover:text-ink inline-flex size-5 cursor-pointer items-center justify-center rounded-full"
              >
                <X className="size-3" aria-hidden="true" />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
        {times.length === 0 && !adding && (
          <span className="text-ink-3 text-xs">{t('times.noneThatDay')}</span>
        )}
        {adding ? (
          <form
            className="flex items-center gap-1.5"
            onSubmit={(e) => {
              e.preventDefault();
              add();
            }}
          >
            <Input
              type="time"
              aria-label={t('times.newTime', { day: name })}
              value={value}
              autoFocus
              onChange={(e) => {
                setValue(e.target.value.slice(0, 5));
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.stopPropagation();
                  setAdding(false);
                }
              }}
              className="h-8 w-28 cursor-text tabular-nums"
            />
            <Button type="submit" size="sm">
              {t('times.add')}
            </Button>
          </form>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            aria-label={t('times.addTo', { day: name })}
            onClick={() => {
              setAdding(true);
            }}
          >
            <Plus aria-hidden="true" />
            {t('times.add')}
          </Button>
        )}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon-sm" variant="ghost" aria-label={t('times.copyFrom', { day: name })}>
            <Copy aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onSelect={() => {
              onCopy(WEEKDAYS);
            }}
          >
            {t('times.copyToWeekdays')}
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => {
              onCopy(WEEK);
            }}
          >
            {t('times.copyToAll')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
}
