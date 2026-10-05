import {
  NetworkId,
  type AdminTarget,
  type HealthRange,
  type NetworkHealth,
  type PublishErrorKind,
} from '@socioboard/contracts';
import {
  Badge,
  Button,
  cn,
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
  Skeleton,
  StatusChip,
  toast,
  type Column,
} from '@socioboard/ui';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { CircleCheck } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { formatDateTime } from '../../../lib/format';
import { actOnTarget, healthQuery, problemsQuery, type ProblemFilter } from '../api';
import { ReasonDialog } from './reason-dialog';

export interface PublishingSearch {
  range?: HealthRange | undefined;
  state?: 'failed' | 'stuck' | undefined;
  network?: NetworkId | undefined;
  errorKind?: PublishErrorKind | undefined;
}

const RANGES = ['24h', '7d', '30d'] as const;
const KINDS = ['retryable', 'rate_limited', 'auth', 'content'] as const;

/**
 * `/admin/publishing`: how each network is doing (success rate, retries, the most common
 * errors), and every delivery that failed or is stuck, with Retry and Cancel. Never post content.
 */
export function AdminPublishingPage({
  search,
  onSearchChange,
}: {
  search: PublishingSearch;
  onSearchChange: (patch: Partial<PublishingSearch>) => void;
}) {
  const { t } = useTranslation('admin');
  const range = search.range ?? '24h';
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title={t('publishing.title')} />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-5 sm:px-6">
          <Health
            range={range}
            onRange={(r) => {
              onSearchChange({ range: r === '24h' ? undefined : r });
            }}
          />
          <Problems search={search} onSearchChange={onSearchChange} />
        </div>
      </div>
    </div>
  );
}

function Health({ range, onRange }: { range: HealthRange; onRange: (r: HealthRange) => void }) {
  const { t, i18n } = useTranslation('admin');
  const health = useQuery(healthQuery(range));
  const percent = new Intl.NumberFormat(i18n.language, {
    style: 'percent',
    maximumFractionDigits: 1,
  });
  const number = new Intl.NumberFormat(i18n.language);
  return (
    <section aria-labelledby="admin-health" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <h2 id="admin-health" className="text-ink flex-1 text-[15px] font-semibold tracking-tight">
          {t('publishing.health')}
        </h2>
        <div
          role="group"
          aria-label={t('publishing.range')}
          className="glass-chip flex rounded-control p-1"
        >
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              aria-pressed={range === r}
              onClick={() => {
                onRange(r);
              }}
              className={cn(
                'h-7 cursor-pointer rounded-lg px-3 text-[13px] font-medium transition-colors duration-200',
                range === r ? 'bg-chip text-ink shadow-sm' : 'text-ink-3 hover:text-ink',
              )}
            >
              {t(`publishing.ranges.${r}`)}
            </button>
          ))}
        </div>
      </div>
      {health.isPending ? (
        <div className="grid gap-3 @2xl:grid-cols-2" aria-hidden="true">
          <Skeleton className="rounded-pane h-40" />
          <Skeleton className="rounded-pane h-40" />
        </div>
      ) : health.isError ? (
        <div className="flex items-center gap-3">
          <p className="text-ink-2 text-sm">{t('loadError')}</p>
          <Button size="sm" onClick={() => void health.refetch()}>
            {t('retry')}
          </Button>
        </div>
      ) : health.data.networks.length === 0 ? (
        <p className="text-ink-3 text-sm">{t('publishing.quiet')}</p>
      ) : (
        <ul className="grid gap-3 @2xl:grid-cols-2">
          {health.data.networks.map((n) => (
            <NetworkCard key={n.network} health={n} percent={percent} number={number} />
          ))}
        </ul>
      )}
    </section>
  );
}

function NetworkCard({
  health: n,
  percent,
  number,
}: {
  health: NetworkHealth;
  percent: Intl.NumberFormat;
  number: Intl.NumberFormat;
}) {
  const { t } = useTranslation('admin');
  const rate = n.successRate;
  const tone =
    rate === null
      ? 'text-ink-3'
      : rate >= 0.98
        ? 'text-success'
        : rate >= 0.9
          ? 'text-warning'
          : 'text-danger';
  const bar =
    rate === null
      ? 'bg-hair'
      : rate >= 0.98
        ? 'bg-success'
        : rate >= 0.9
          ? 'bg-warning'
          : 'bg-danger';
  return (
    <li className="glass-chip rounded-pane flex flex-col gap-3 p-4">
      <div className="flex items-center gap-2.5">
        <NetworkIcon network={n.network} variant="tile" size="sm" decorative />
        <h3 className="text-ink flex-1 text-sm font-semibold">{networkName(n.network)}</h3>
        <span className={cn('text-xl font-semibold tabular-nums', tone)}>
          {rate === null ? '–' : percent.format(rate)}
        </span>
      </div>
      <div
        className="bg-chip h-1.5 overflow-hidden rounded-full"
        role="meter"
        aria-label={t('publishing.successRate', { network: networkName(n.network) })}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={rate === null ? undefined : Math.round(rate * 100)}
      >
        <div
          className={cn('h-full rounded-full transition-[width] duration-700 ease-out', bar)}
          style={{ width: `${String(Math.round((rate ?? 0) * 100))}%` }}
        />
      </div>
      <dl className="text-ink-2 flex gap-5 text-xs">
        {(['published', 'failed', 'retried'] as const).map((k) => (
          <div key={k} className="flex flex-col">
            <dt className="text-ink-3">{t(`publishing.counts.${k}`)}</dt>
            <dd className="text-ink text-sm font-semibold tabular-nums">{number.format(n[k])}</dd>
          </div>
        ))}
      </dl>
      {n.topErrors.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <h4 className="text-ink-3 text-xs font-semibold">{t('publishing.topErrors')}</h4>
          <ol className="flex flex-col gap-1">
            {n.topErrors.map((e, i) => (
              <li key={i} className="flex items-start gap-2 text-xs">
                <span className="text-ink w-8 shrink-0 text-right font-semibold tabular-nums">
                  {number.format(e.count)}
                </span>
                <span className="text-ink-2 min-w-0 flex-1 leading-relaxed wrap-break-word">
                  {e.message}
                  {e.networkCode && <span className="text-ink-3"> ({e.networkCode})</span>}
                </span>
                <Badge tone="outline" className="shrink-0">
                  {t(`kinds.${e.kind}`)}
                </Badge>
              </li>
            ))}
          </ol>
        </div>
      )}
    </li>
  );
}

function Problems({
  search,
  onSearchChange,
}: {
  search: PublishingSearch;
  onSearchChange: (patch: Partial<PublishingSearch>) => void;
}) {
  const { t } = useTranslation('admin');
  const { t: postT } = useTranslation('posts');
  const client = useQueryClient();
  const filter: ProblemFilter = {
    state: search.state ?? null,
    network: search.network ?? null,
    errorKind: search.errorKind ?? null,
  };
  const problems = useInfiniteQuery(problemsQuery(filter));
  const rows = problems.data?.pages.flatMap((p) => p.items) ?? [];
  const [acting, setActing] = useState<{ action: 'retry' | 'cancel'; target: AdminTarget } | null>(
    null,
  );

  const columns: Column<AdminTarget>[] = [
    {
      id: 'account',
      header: t('problems.account'),
      cell: (row) => (
        <span className="flex min-w-0 items-center gap-2 py-1.5">
          <NetworkIcon network={row.account.network} variant="tile" size="xs" decorative />
          <span className="flex min-w-0 flex-col">
            <span className="text-ink truncate text-[13px] font-medium">
              {row.account.displayName}
            </span>
            <span className="text-ink-3 truncate text-xs">{row.workspace.name}</span>
          </span>
        </span>
      ),
    },
    {
      id: 'state',
      header: t('problems.state'),
      cell: (row) =>
        row.stuck ? (
          <Badge tone="warning" dot>
            {t('problems.stuck')}
          </Badge>
        ) : (
          <StatusChip status={row.status} label={postT(`status.${row.status}`)} />
        ),
      className: 'w-32',
    },
    {
      id: 'error',
      header: t('problems.error'),
      cell: (row) =>
        row.lastError ? (
          <span className="flex min-w-0 flex-col gap-0.5 py-1.5">
            <span className="text-ink-2 line-clamp-2 text-xs leading-relaxed wrap-break-word">
              {row.lastError.message}
            </span>
            <span className="text-ink-3 text-[11px]">
              {t(`kinds.${row.lastError.kind}`)}
              {row.lastError.networkCode && ` (${row.lastError.networkCode})`}
            </span>
          </span>
        ) : (
          <span className="text-ink-3 text-xs">{t('problems.noError')}</span>
        ),
      className: '@max-2xl:hidden',
    },
    {
      id: 'tries',
      header: t('problems.tries'),
      cell: (row) => (
        <span className="text-ink-2 flex flex-col text-xs">
          <span className="tabular-nums">{t('problems.attempts', { count: row.attempts })}</span>
          {row.lastAttemptAt && (
            <time dateTime={row.lastAttemptAt} className="text-ink-3">
              {formatDateTime(row.lastAttemptAt)}
            </time>
          )}
        </span>
      ),
      className: 'w-44 @max-3xl:hidden',
    },
    {
      id: 'actions',
      header: <span className="sr-only">{t('problems.actions')}</span>,
      cell: (row) => (
        <span className="flex justify-end gap-1.5">
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setActing({ action: 'retry', target: row });
            }}
            aria-label={t('problems.retryFor', { account: row.account.displayName })}
          >
            {t('problems.retry')}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              setActing({ action: 'cancel', target: row });
            }}
            aria-label={t('problems.cancelFor', { account: row.account.displayName })}
          >
            {t('problems.cancel')}
          </Button>
        </span>
      ),
      className: 'w-44 text-right',
    },
  ];

  const filtered = filter.state !== null || filter.network !== null || filter.errorKind !== null;
  return (
    <section aria-labelledby="admin-problems" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <h2
          id="admin-problems"
          className="text-ink flex-1 text-[15px] font-semibold tracking-tight"
        >
          {t('problems.title')}
        </h2>
        <Filter
          label={t('problems.state')}
          all={t('problems.allStates')}
          value={search.state}
          options={(['failed', 'stuck'] as const).map((s) => ({
            value: s,
            label: t(`problems.states.${s}`),
          }))}
          onChange={(state) => {
            onSearchChange({ state: state as PublishingSearch['state'] });
          }}
        />
        <Filter
          label={t('problems.network')}
          all={t('problems.allNetworks')}
          value={search.network}
          options={NetworkId.options.map((n) => ({ value: n, label: networkName(n) }))}
          onChange={(network) => {
            onSearchChange({ network: network as NetworkId | undefined });
          }}
        />
        <Filter
          label={t('problems.kind')}
          all={t('problems.allKinds')}
          value={search.errorKind}
          options={KINDS.map((k) => ({ value: k, label: t(`kinds.${k}`) }))}
          onChange={(errorKind) => {
            onSearchChange({ errorKind: errorKind as PublishErrorKind | undefined });
          }}
        />
      </div>
      <DataTable
        caption={t('problems.title')}
        columns={columns}
        rows={rows}
        getRowId={(row) => row.id}
        loading={problems.isPending}
        error={problems.isError ? t('loadError') : undefined}
        onRetry={() => void problems.refetch()}
        empty={
          <EmptyState
            icon={<CircleCheck />}
            title={filtered ? t('problems.emptyFiltered') : t('problems.empty')}
            description={filtered ? t('problems.emptyFilteredBody') : t('problems.emptyBody')}
          />
        }
        hasMore={problems.hasNextPage}
        onLoadMore={() => void problems.fetchNextPage()}
        loadingMore={problems.isFetchingNextPage}
        labels={{ loadMore: t('loadMore'), retry: t('retry'), loading: t('loading') }}
      />
      <ReasonDialog
        open={acting !== null}
        onOpenChange={(open) => {
          if (!open) setActing(null);
        }}
        tone={acting?.action === 'cancel' ? 'danger' : 'default'}
        title={
          acting
            ? t(`problems.${acting.action}Title`, { account: acting.target.account.displayName })
            : ''
        }
        description={
          acting
            ? t(`problems.${acting.action}Body`, {
                account: acting.target.account.displayName,
                workspace: acting.target.workspace.name,
              })
            : ''
        }
        confirmLabel={acting ? t(`problems.${acting.action}`) : ''}
        onConfirm={async (reason) => {
          if (!acting) return;
          await actOnTarget(client, acting.action, acting.target.id, reason);
          toast.success(
            t(`problems.${acting.action}Done`, { account: acting.target.account.displayName }),
          );
          setActing(null);
        }}
      />
    </section>
  );
}

function Filter({
  label,
  all,
  value,
  options,
  onChange,
}: {
  label: string;
  all: string;
  value: string | undefined;
  options: { value: string; label: string }[];
  onChange: (value: string | undefined) => void;
}) {
  return (
    <Select
      value={value ?? '_all'}
      onValueChange={(v) => {
        onChange(v === '_all' ? undefined : v);
      }}
    >
      <SelectTrigger aria-label={label} className="h-8 w-auto min-w-36 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="_all">{all}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
