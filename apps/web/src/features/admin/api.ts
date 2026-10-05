import {
  apiRoutes,
  type HealthRange,
  type NetworkId,
  type PublishErrorKind,
} from '@socioboard/contracts';
import { infiniteQueryOptions, queryOptions, type QueryClient } from '@tanstack/react-query';

import { api } from '../../lib/api';

/** The console reads across workspaces: its own keys, not a workspace's. */
export const adminKeys = {
  all: ['admin'] as const,
  overview: ['admin', 'overview'] as const,
  health: (range: HealthRange) => ['admin', 'health', range] as const,
  problems: (filter: ProblemFilter) => ['admin', 'problems', filter] as const,
  accounts: (filter: AccountFilter) => ['admin', 'accounts', filter] as const,
};

export interface ProblemFilter {
  state: 'failed' | 'stuck' | null;
  network: NetworkId | null;
  errorKind: PublishErrorKind | null;
}

export interface AccountFilter {
  state: 'expiring' | 'reauth_required' | null;
  withinDays: number;
  network: NetworkId | null;
}

const PAGE_SIZE = 25;
/** The server caches the overview and health for 60 s; asking more often shows nothing new. */
const REFRESH_MS = 60_000;

export const overviewQuery = queryOptions({
  queryKey: adminKeys.overview,
  queryFn: ({ signal }) => api(apiRoutes.admin.getAdminOverview, { signal }),
  refetchInterval: REFRESH_MS,
});

export const healthQuery = (range: HealthRange) =>
  queryOptions({
    queryKey: adminKeys.health(range),
    queryFn: ({ signal }) => api(apiRoutes.admin.getPublishingHealth, { query: { range }, signal }),
    refetchInterval: REFRESH_MS,
  });

export const problemsQuery = (filter: ProblemFilter) =>
  infiniteQueryOptions({
    queryKey: adminKeys.problems(filter),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam, signal }) =>
      api(apiRoutes.admin.listProblemTargets, {
        query: {
          limit: PAGE_SIZE,
          ...(pageParam ? { cursor: pageParam } : {}),
          ...(filter.state ? { state: filter.state } : {}),
          ...(filter.network ? { network: filter.network } : {}),
          ...(filter.errorKind ? { errorKind: filter.errorKind } : {}),
        },
        signal,
      }),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });

export const attentionAccountsQuery = (filter: AccountFilter) =>
  infiniteQueryOptions({
    queryKey: adminKeys.accounts(filter),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam, signal }) =>
      api(apiRoutes.admin.listAttentionAccounts, {
        query: {
          limit: PAGE_SIZE,
          withinDays: filter.withinDays,
          ...(pageParam ? { cursor: pageParam } : {}),
          ...(filter.state ? { state: filter.state } : {}),
          ...(filter.network ? { network: filter.network } : {}),
        },
        signal,
      }),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });

/** Retry or cancel one delivery, saying why (kept in the audit log); then the console re-reads. */
export async function actOnTarget(
  client: QueryClient,
  action: 'retry' | 'cancel',
  targetId: string,
  reason: string,
) {
  const route =
    action === 'retry' ? apiRoutes.admin.adminRetryTarget : apiRoutes.admin.adminCancelTarget;
  const target = await api(route, { params: { targetId }, body: { reason } });
  await client.invalidateQueries({ queryKey: adminKeys.all });
  return target;
}
