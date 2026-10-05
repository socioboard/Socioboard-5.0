import { NetworkId, type AdminAccount } from '@socioboard/contracts';
import {
  Badge,
  DataTable,
  EmptyState,
  NetworkIcon,
  networkName,
  PageHeader,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  type Column,
} from '@socioboard/ui';
import { useInfiniteQuery } from '@tanstack/react-query';
import { ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { formatDateTime } from '../../../lib/format';
import { attentionAccountsQuery, type AccountFilter } from '../api';

export interface AccountsSearch {
  state?: 'expiring' | 'reauth_required' | undefined;
  within?: 7 | 14 | 30 | undefined;
  network?: NetworkId | undefined;
}

const WITHIN = [7, 14, 30] as const;

/**
 * `/admin/accounts`: accounts that stopped accepting posts, or whose sign-in runs out soon,
 * across every workspace, with how many scheduled posts each would fail.
 */
export function AdminAccountsPage({
  search,
  onSearchChange,
}: {
  search: AccountsSearch;
  onSearchChange: (patch: Partial<AccountsSearch>) => void;
}) {
  const { t, i18n } = useTranslation('admin');
  const filter: AccountFilter = {
    state: search.state ?? null,
    withinDays: search.within ?? 7,
    network: search.network ?? null,
  };
  const accounts = useInfiniteQuery(attentionAccountsQuery(filter));
  const rows = accounts.data?.pages.flatMap((p) => p.items) ?? [];
  const number = new Intl.NumberFormat(i18n.language);

  const columns: Column<AdminAccount>[] = [
    {
      id: 'account',
      header: t('accounts.account'),
      cell: (row) => (
        <span className="flex min-w-0 items-center gap-2 py-1.5">
          <NetworkIcon network={row.network} variant="tile" size="xs" decorative />
          <span className="flex min-w-0 flex-col">
            <span className="text-ink truncate text-[13px] font-medium">
              {row.displayName}
              {row.username && <span className="text-ink-3 font-normal"> @{row.username}</span>}
            </span>
            <span className="text-ink-3 truncate text-xs">{row.workspace.name}</span>
          </span>
        </span>
      ),
    },
    {
      id: 'why',
      header: t('accounts.why'),
      cell: (row) =>
        row.status === 'reauth_required' ? (
          <span className="flex min-w-0 flex-col gap-1 py-1.5">
            <Badge tone="danger" dot className="self-start">
              {t('accounts.reauth')}
            </Badge>
            {row.statusReason && (
              <span className="text-ink-2 line-clamp-2 text-xs leading-relaxed">
                {row.statusReason}
              </span>
            )}
          </span>
        ) : (
          <span className="flex min-w-0 flex-col gap-1 py-1.5">
            <Badge tone="warning" dot className="self-start">
              {t('accounts.expiring')}
            </Badge>
            {row.tokenExpiresAt && (
              <time dateTime={row.tokenExpiresAt} className="text-ink-2 text-xs">
                {t('accounts.expiresAt', { time: formatDateTime(row.tokenExpiresAt) })}
              </time>
            )}
          </span>
        ),
    },
    {
      id: 'atRisk',
      header: t('accounts.atRisk'),
      cell: (row) => (
        <span
          className={
            row.scheduledTargets > 0
              ? 'text-danger text-sm font-semibold tabular-nums'
              : 'text-ink-3 text-sm tabular-nums'
          }
        >
          {number.format(row.scheduledTargets)}
        </span>
      ),
      className: 'w-20 text-right @xl:w-36',
    },
    {
      id: 'checked',
      header: t('accounts.checked'),
      cell: (row) =>
        row.lastCheckedAt ? (
          <time dateTime={row.lastCheckedAt} className="text-ink-3 text-xs">
            {formatDateTime(row.lastCheckedAt)}
          </time>
        ) : (
          <span className="text-ink-3 text-xs">{t('accounts.never')}</span>
        ),
      className: 'w-44 @max-3xl:hidden',
    },
  ];

  const filtered = filter.state !== null || filter.network !== null;
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title={t('accounts.title')} />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-5 sm:px-6">
          <p className="text-ink-2 max-w-2xl text-sm leading-relaxed">{t('accounts.body')}</p>
          <div className="flex flex-wrap items-center gap-2">
            <Choose
              label={t('accounts.state')}
              value={search.state ?? '_all'}
              options={[
                { value: '_all', label: t('accounts.allStates') },
                { value: 'reauth_required', label: t('accounts.reauth') },
                { value: 'expiring', label: t('accounts.expiring') },
              ]}
              onChange={(v) => {
                onSearchChange({
                  state: v === '_all' ? undefined : (v as AccountsSearch['state']),
                });
              }}
            />
            <Choose
              label={t('accounts.within')}
              value={String(filter.withinDays)}
              options={WITHIN.map((d) => ({
                value: String(d),
                label: t('accounts.withinDays', { count: d }),
              }))}
              onChange={(v) => {
                const days = Number(v) as 7 | 14 | 30;
                onSearchChange({ within: days === 7 ? undefined : days });
              }}
            />
            <Choose
              label={t('problems.network')}
              value={search.network ?? '_all'}
              options={[
                { value: '_all', label: t('problems.allNetworks') },
                ...NetworkId.options.map((n) => ({ value: n, label: networkName(n) })),
              ]}
              onChange={(v) => {
                onSearchChange({ network: v === '_all' ? undefined : (v as NetworkId) });
              }}
            />
          </div>
          <DataTable
            caption={t('accounts.title')}
            columns={columns}
            rows={rows}
            getRowId={(row) => row.id}
            loading={accounts.isPending}
            error={accounts.isError ? t('loadError') : undefined}
            onRetry={() => void accounts.refetch()}
            empty={
              <EmptyState
                icon={<ShieldCheck />}
                title={filtered ? t('accounts.emptyFiltered') : t('accounts.empty')}
                description={t('accounts.emptyBody', { count: filter.withinDays })}
              />
            }
            hasMore={accounts.hasNextPage}
            onLoadMore={() => void accounts.fetchNextPage()}
            loadingMore={accounts.isFetchingNextPage}
            labels={{ loadMore: t('loadMore'), retry: t('retry'), loading: t('loading') }}
          />
        </div>
      </div>
    </div>
  );
}

function Choose({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={label} className="h-8 w-auto min-w-36 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
