import { Button, cn, EmptyState, PageHeader, Skeleton, staggerStyle } from '@socioboard/ui';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { formatTime } from '../../../lib/format';
import { overviewQuery } from '../api';

/**
 * `/admin` (docs/frontend/areas/admin-console.md): the last 24 hours at a glance, what needs
 * someone now (stuck deliveries, accounts needing attention), and the queues' backlog.
 */
export function AdminOverviewPage() {
  const { t, i18n } = useTranslation('admin');
  const overview = useQuery(overviewQuery);
  const data = overview.data;
  const number = new Intl.NumberFormat(i18n.language);

  const tiles: {
    id: 'signups' | 'activeWorkspaces' | 'published' | 'failed' | 'stuck' | 'accounts';
    value: number;
    tone?: 'danger' | 'warning';
    to?: '/admin/publishing' | '/admin/accounts';
    search?: Record<string, string>;
  }[] = data
    ? [
        { id: 'signups', value: data.signups24h },
        { id: 'activeWorkspaces', value: data.activeWorkspaces30d },
        { id: 'published', value: data.published24h },
        {
          id: 'failed',
          value: data.failed24h,
          ...(data.failed24h > 0 ? { tone: 'danger' as const } : {}),
          to: '/admin/publishing',
          search: { state: 'failed' },
        },
        {
          id: 'stuck',
          value: data.stuckTargets,
          ...(data.stuckTargets > 0 ? { tone: 'warning' as const } : {}),
          to: '/admin/publishing',
          search: { state: 'stuck' },
        },
        {
          id: 'accounts',
          value: data.accountsNeedingAttention,
          ...(data.accountsNeedingAttention > 0 ? { tone: 'warning' as const } : {}),
          to: '/admin/accounts',
        },
      ]
    : [];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t('overview.title')}
        actions={
          <Button
            size="sm"
            variant="ghost"
            disabled={overview.isFetching}
            onClick={() => void overview.refetch()}
          >
            <RefreshCw
              className={cn(overview.isFetching && !overview.isPending && 'animate-spin')}
              aria-hidden="true"
            />
            {data
              ? t('overview.updated', { time: formatTime(data.generatedAt) })
              : t('overview.refresh')}
          </Button>
        }
      />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-5 sm:px-6">
          {overview.isError && !data ? (
            <EmptyState
              title={t('loadError')}
              action={<Button onClick={() => void overview.refetch()}>{t('retry')}</Button>}
            />
          ) : (
            <>
              <section aria-labelledby="admin-kpis" className="flex flex-col gap-3">
                <h2 id="admin-kpis" className="text-ink-2 text-xs font-semibold">
                  {t('overview.last24h')}
                </h2>
                <ul className="grid grid-cols-2 gap-3 @2xl:grid-cols-3 @5xl:grid-cols-6">
                  {overview.isPending
                    ? [0, 1, 2, 3, 4, 5].map((i) => (
                        <li key={i}>
                          <Skeleton className="rounded-pane h-24" />
                        </li>
                      ))
                    : tiles.map((tile, i) => {
                        const body = (
                          <>
                            <span
                              className={cn(
                                'text-[28px] leading-none font-semibold tracking-tight tabular-nums',
                                tile.tone === 'danger'
                                  ? 'text-danger'
                                  : tile.tone === 'warning'
                                    ? 'text-warning'
                                    : 'text-ink',
                              )}
                            >
                              {number.format(tile.value)}
                            </span>
                            <span className="text-ink-2 text-xs leading-snug">
                              {t(`overview.tiles.${tile.id}`)}
                            </span>
                          </>
                        );
                        const shell =
                          'glass-chip rounded-pane flex h-full flex-col justify-between gap-3 p-4';
                        return (
                          <li key={tile.id} className="animate-enter" style={staggerStyle(i)}>
                            {tile.to ? (
                              <Link
                                to={tile.to}
                                {...(tile.search ? { search: tile.search } : {})}
                                className={cn(
                                  shell,
                                  'hover:border-hair-strong transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-sm',
                                )}
                              >
                                {body}
                              </Link>
                            ) : (
                              <div className={shell}>{body}</div>
                            )}
                          </li>
                        );
                      })}
                </ul>
              </section>

              <section aria-labelledby="admin-queues" className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <h2 id="admin-queues" className="text-ink-2 flex-1 text-xs font-semibold">
                    {t('overview.queues')}
                  </h2>
                  <Link
                    to="/admin/queues"
                    className="text-ink-2 hover:text-ink text-xs font-medium"
                  >
                    {t('overview.openQueues')}
                  </Link>
                </div>
                <div className="glass-chip rounded-pane overflow-x-auto">
                  <table className="w-full text-sm">
                    <caption className="sr-only">{t('overview.queues')}</caption>
                    <thead>
                      <tr className="border-hair text-ink-3 border-b text-left text-xs">
                        <th scope="col" className="px-4 py-2.5 font-semibold">
                          {t('overview.queue')}
                        </th>
                        {(['waiting', 'delayed', 'active', 'failed'] as const).map((c) => (
                          <th key={c} scope="col" className="px-4 py-2.5 text-right font-semibold">
                            {t(`overview.counts.${c}`)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {overview.isPending
                        ? [0, 1, 2].map((i) => (
                            <tr key={i}>
                              <td colSpan={5} className="px-4 py-2">
                                <Skeleton className="h-6" />
                              </td>
                            </tr>
                          ))
                        : data?.queues.map((q) => (
                            <tr key={q.name} className="border-hair border-b last:border-b-0">
                              <th
                                scope="row"
                                className="text-ink px-4 py-2.5 text-left font-medium"
                              >
                                {q.name}
                              </th>
                              {(['waiting', 'delayed', 'active', 'failed'] as const).map((c) => (
                                <td
                                  key={c}
                                  className={cn(
                                    'px-4 py-2.5 text-right tabular-nums',
                                    c === 'failed' && q.failed > 0
                                      ? 'text-danger font-semibold'
                                      : 'text-ink-2',
                                  )}
                                >
                                  {number.format(q[c])}
                                </td>
                              ))}
                            </tr>
                          ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
