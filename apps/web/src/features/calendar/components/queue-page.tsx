import type { CalendarEntry, SocialAccount } from '@socioboard/contracts';
import {
  Avatar,
  Banner,
  Button,
  cn,
  EmptyState,
  listItem,
  motion,
  NetworkIcon,
  PageHeader,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  StatusChip,
} from '@socioboard/ui';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Clock, ListOrdered, Plus, Settings2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useCan } from '../../../lib/permissions';
import { formatZoned } from '../../../lib/time';
import { useWorkspaceTime } from '../../../lib/use-workspace-time';
import { useWorkspace } from '../../../lib/workspace';
import { accountsQuery, PostingTimesDialog, queueSlotsQuery } from '../../accounts';
import { scheduleProblem } from '../model';

export interface QueueSearch {
  account?: string | undefined;
}

/** Accounts whose queue can be shown: those still connected. */
const listed = (a: SocialAccount) => a.status !== 'disconnected';

/**
 * `/w/:slug/queue` (docs/frontend/areas/calendar.md): an account's next posting times, each with
 * what's already in it, and the free ones offered to write for. Posting times are edited here (and
 * in the account's details) by people who manage accounts.
 */
export function QueuePage({
  search,
  onSearchChange,
}: {
  search: QueueSearch;
  onSearchChange: (patch: Partial<QueueSearch>) => void;
}) {
  const { t } = useTranslation('calendar');
  const { workspace } = useWorkspace();
  const accounts = useQuery(accountsQuery(workspace.id));
  const list = (accounts.data ?? []).filter(listed);
  const account = list.find((a) => a.id === search.account) ?? list[0];

  let body;
  if (accounts.isPending) {
    body = (
      <div className="grid gap-4 md:grid-cols-[240px_minmax(0,1fr)]" aria-hidden="true">
        <Skeleton className="rounded-pane h-64" />
        <Skeleton className="rounded-pane h-96" />
      </div>
    );
  } else if (accounts.isError) {
    body = (
      <EmptyState
        title={t('queue.loadError')}
        action={<Button onClick={() => void accounts.refetch()}>{t('retry')}</Button>}
      />
    );
  } else if (!account) {
    body = (
      <EmptyState
        icon={<ListOrdered />}
        title={t('queue.noAccounts')}
        description={t('queue.noAccountsBody')}
        action={
          <Button asChild>
            <Link to="/w/$slug/accounts" params={{ slug: workspace.slug }}>
              {t('queue.goToAccounts')}
            </Link>
          </Button>
        }
      />
    );
  } else {
    body = (
      <div className="grid gap-4 md:grid-cols-[240px_minmax(0,1fr)] md:items-start">
        <AccountList
          accounts={list}
          selected={account.id}
          onSelect={(id) => {
            onSearchChange({ account: id });
          }}
        />
        <AccountQueue key={account.id} account={account} />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title={t('queue.title')} />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-5 sm:px-6">{body}</div>
      </div>
    </div>
  );
}

/** Desktop: a list beside the queue; phones: a select above it. */
function AccountList({
  accounts,
  selected,
  onSelect,
}: {
  accounts: SocialAccount[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  const { t } = useTranslation('calendar');
  return (
    <>
      <div className="md:hidden">
        <Select value={selected} onValueChange={onSelect}>
          <SelectTrigger aria-label={t('queue.account')}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.displayName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <nav
        aria-label={t('queue.accounts')}
        className="glass-chip rounded-pane hidden flex-col gap-0.5 p-2 md:flex"
      >
        {accounts.map((a) => {
          const on = a.id === selected;
          return (
            <button
              key={a.id}
              type="button"
              aria-current={on ? 'true' : undefined}
              onClick={() => {
                onSelect(a.id);
              }}
              className={cn(
                'relative isolate flex cursor-pointer items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-left text-sm',
                'transition-colors duration-150',
                on ? 'text-ink font-medium' : 'text-ink-2 hover:bg-chip hover:text-ink',
              )}
            >
              {on && (
                <motion.span
                  layoutId="queue-account"
                  aria-hidden="true"
                  className="bg-chip absolute inset-0 -z-10 rounded-[10px] shadow-sm"
                />
              )}
              <span className="relative shrink-0">
                <Avatar name={a.displayName} src={a.avatarUrl} size="sm" decorative />
                <NetworkIcon
                  network={a.network}
                  variant="tile"
                  size="xs"
                  decorative
                  className="ring-canvas absolute -right-1 -bottom-1 ring-2"
                />
              </span>
              <span className="min-w-0 flex-1 truncate">{a.displayName}</span>
              {a.status !== 'active' && (
                <span className="bg-warning size-2 shrink-0 rounded-full" title={a.status} />
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
}

function AccountQueue({ account }: { account: SocialAccount }) {
  const { t, i18n } = useTranslation('calendar');
  const { workspace } = useWorkspace();
  const time = useWorkspaceTime();
  const can = useCan();
  const queue = useQuery(queueSlotsQuery(workspace.id, account.id));
  const [editing, setEditing] = useState(false);
  const manage = can('accounts:manage');

  // Grouped by the day each slot falls on, on the workspace's clock.
  const days: { day: string; label: string; slots: { at: string; entries: CalendarEntry[] }[] }[] =
    [];
  for (const slot of queue.data?.upcoming ?? []) {
    const label = formatZoned(slot.at, time.timeZone, 'day', i18n.language);
    const day = new Intl.DateTimeFormat('en-CA', { timeZone: time.timeZone }).format(
      new Date(slot.at),
    );
    const last = days.at(-1);
    if (last?.day === day) last.slots.push(slot);
    else days.push({ day, label, slots: [slot] });
  }
  const free = (queue.data?.upcoming ?? []).filter((s) => s.entries.length === 0).length;

  return (
    <section
      aria-labelledby="queue-account"
      className="glass-chip rounded-pane flex min-w-0 flex-col gap-4 p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex min-w-0 flex-1 flex-col">
          <h2 id="queue-account" className="text-ink truncate text-[15px] font-semibold">
            {account.displayName}
          </h2>
          {queue.data && queue.data.slots.length > 0 && (
            <span className="text-ink-3 text-xs">
              {t('queue.summary', {
                count: queue.data.slots.length,
                free,
                zone:
                  queue.data.timezone === time.timeZone
                    ? time.zone
                    : queue.data.timezone.replaceAll('_', ' '),
              })}
            </span>
          )}
        </div>
        {manage && (
          <Button
            size="sm"
            onClick={() => {
              setEditing(true);
            }}
          >
            <Settings2 aria-hidden="true" />
            {t('queue.editTimes')}
          </Button>
        )}
      </div>

      {account.status !== 'active' && <Banner tone="warning">{t('queue.notActive')}</Banner>}

      {queue.isPending ? (
        <div className="flex flex-col gap-2" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      ) : queue.isError ? (
        <div className="flex flex-col items-start gap-3">
          <p className="text-ink-2 text-sm">{t('queue.loadError')}</p>
          <Button onClick={() => void queue.refetch()}>{t('retry')}</Button>
        </div>
      ) : queue.data.slots.length === 0 ? (
        <EmptyState
          icon={<Clock />}
          title={t('queue.noTimes')}
          description={manage ? t('queue.noTimesBody') : t('queue.noTimesReadOnly')}
          {...(manage
            ? {
                action: (
                  <Button
                    variant="primary"
                    onClick={() => {
                      setEditing(true);
                    }}
                  >
                    {t('queue.setTimes')}
                  </Button>
                ),
              }
            : {})}
        />
      ) : (
        <ol className="flex flex-col gap-4">
          {days.map((d, di) => (
            <li key={d.day} className="flex flex-col gap-2">
              <h3 className="text-ink-3 text-xs font-semibold">{d.label}</h3>
              <ol className="flex flex-col gap-1.5">
                {d.slots.map((slot, si) => (
                  <motion.li key={slot.at} {...listItem(di * 3 + si)}>
                    <Slot at={slot.at} entries={slot.entries} account={account} />
                  </motion.li>
                ))}
              </ol>
            </li>
          ))}
        </ol>
      )}
      {manage && <PostingTimesDialog account={account} open={editing} onOpenChange={setEditing} />}
    </section>
  );
}

function Slot({
  at,
  entries,
  account,
}: {
  at: string;
  entries: CalendarEntry[];
  account: SocialAccount;
}) {
  const { t } = useTranslation('calendar');
  const { t: postT } = useTranslation('posts');
  const { workspace } = useWorkspace();
  const time = useWorkspaceTime();
  const can = useCan();
  const label = time.format(at, 'time');
  if (entries.length === 0) {
    const writable =
      can('posts:create') && account.status === 'active' && !scheduleProblem(new Date(at));
    return (
      <div className="border-hair-strong flex items-center gap-3 rounded-[10px] border border-dashed px-3 py-2.5">
        <span className="text-ink-2 w-16 shrink-0 text-[13px] font-semibold tabular-nums">
          {label}
        </span>
        <span className="text-ink-3 flex-1 text-[13px]">{t('queue.free')}</span>
        {writable && (
          <Button asChild size="sm" variant="ghost">
            <Link
              to="/w/$slug/compose/{-$postId}"
              params={{ slug: workspace.slug, postId: undefined }}
              search={{ at, account: account.id }}
              aria-label={t('queue.writeFor', { time: time.format(at, 'long') })}
            >
              <Plus aria-hidden="true" />
              {t('queue.write')}
            </Link>
          </Button>
        )}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-1.5">
      {entries.map((e) => (
        <Link
          key={e.targetId}
          to="/w/$slug/posts/$postId"
          params={{ slug: workspace.slug, postId: e.postId }}
          className="glass-chip hover:border-hair-strong flex items-center gap-3 rounded-[10px] px-3 py-2.5 transition-[border-color,box-shadow] duration-150 hover:shadow-sm"
        >
          <span className="text-ink w-16 shrink-0 text-[13px] font-semibold tabular-nums">
            {label}
          </span>
          {e.thumbnailUrl && (
            <img src={e.thumbnailUrl} alt="" className="size-9 shrink-0 rounded-md object-cover" />
          )}
          <span className="text-ink min-w-0 flex-1 truncate text-[13px]">
            {e.text || t('noText')}
          </span>
          <StatusChip status={e.status} label={postT(`status.${e.status}`)} className="shrink-0" />
        </Link>
      ))}
    </div>
  );
}
