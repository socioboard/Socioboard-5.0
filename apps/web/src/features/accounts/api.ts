import {
  apiRoutes,
  type LoginProvider,
  type Network,
  type NetworkId,
  type SocialAccount,
  type SocialConnection,
} from '@socioboard/contracts';
import { queryOptions, type QueryClient } from '@tanstack/react-query';

import { api, ApiError, INVALID_RESPONSE } from '../../lib/api';
import { forgetConnectReturn } from '../../lib/return-to';

export const accountKeys = {
  all: (workspaceId: string) => ['workspaces', workspaceId, 'accounts'] as const,
  list: (workspaceId: string) => ['workspaces', workspaceId, 'accounts', 'list'] as const,
  detail: (workspaceId: string, accountId: string) =>
    ['workspaces', workspaceId, 'accounts', 'detail', accountId] as const,
  connections: (workspaceId: string) =>
    ['workspaces', workspaceId, 'accounts', 'connections'] as const,
  assets: (workspaceId: string, connectionId: string) =>
    ['workspaces', workspaceId, 'accounts', 'assets', connectionId] as const,
};

/** Enabled networks: the same for every workspace, and only changes when the server's keys do. */
export const networksQuery = queryOptions({
  queryKey: ['networks'] as const,
  queryFn: async ({ signal }) => (await api(apiRoutes.networks.listNetworks, { signal })).items,
  staleTime: 5 * 60_000,
});

export const accountsQuery = (workspaceId: string) =>
  queryOptions({
    queryKey: accountKeys.list(workspaceId),
    queryFn: async ({ signal }) =>
      (await api(apiRoutes.socialAccounts.listAccounts, { params: { workspaceId }, signal })).items,
  });

/** Logins with their accounts (admins only): includes logins nothing was added from yet. */
export const connectionsQuery = (workspaceId: string) =>
  queryOptions({
    queryKey: accountKeys.connections(workspaceId),
    queryFn: async ({ signal }) =>
      (await api(apiRoutes.socialAccounts.listConnections, { params: { workspaceId }, signal }))
        .items,
  });

export const accountDetailQuery = (workspaceId: string, accountId: string) =>
  queryOptions({
    queryKey: accountKeys.detail(workspaceId, accountId),
    queryFn: ({ signal }) =>
      api(apiRoutes.socialAccounts.getAccount, { params: { workspaceId, accountId }, signal }),
  });

export const connectableAssetsQuery = (workspaceId: string, connectionId: string) =>
  queryOptions({
    queryKey: accountKeys.assets(workspaceId, connectionId),
    queryFn: ({ signal }) =>
      api(apiRoutes.socialAccounts.listConnectableAssets, {
        params: { workspaceId, connectionId },
        signal,
      }),
    // Asks the network each time the picker opens; a retry won't fix a refused login, and
    // coming back to the tab mustn't call the network again (or drop the user's ticks).
    staleTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
  });

/** After any change: lists, details and logins all read the same rows. */
export const refreshAccounts = (queryClient: QueryClient, workspaceId: string) =>
  queryClient.invalidateQueries({ queryKey: accountKeys.all(workspaceId) });

/** Leaving the app for the network's sign-in page (a seam for tests: jsdom can't navigate). */
export const browser = {
  assign: (url: string) => {
    window.location.assign(url);
  },
};

/** Only a network's https sign-in page, never another scheme, even if the server were tricked. */
function leaveFor(authUrl: string) {
  let url: URL;
  try {
    url = new URL(authUrl);
  } catch {
    throw new ApiError(0, INVALID_RESPONSE, 'The sign-in address is invalid', undefined);
  }
  if (url.protocol !== 'https:') {
    throw new ApiError(0, INVALID_RESPONSE, 'The sign-in address is invalid', undefined);
  }
  browser.assign(url.toString());
}

/** Starts connecting through `provider` and sends the browser to its sign-in page. */
export async function startConnect(
  workspaceId: string,
  provider: LoginProvider,
  forceAccountSelection: boolean,
) {
  const { authUrl } = await api(apiRoutes.socialAccounts.startConnect, {
    params: { workspaceId, provider },
    body: { forceAccountSelection },
  });
  leaveFor(authUrl);
}

/**
 * Signs in again as the same person to refresh a login. It ends on the Accounts page: a way back
 * left over from an abandoned onboarding connect is forgotten, unless this reconnect is part of
 * that connect (`keepReturn`: the picker offering it when listing the login's accounts failed).
 */
export async function startReconnect(
  workspaceId: string,
  connectionId: string,
  { keepReturn = false }: { keepReturn?: boolean } = {},
) {
  const { authUrl } = await api(apiRoutes.socialAccounts.reconnect, {
    params: { workspaceId, connectionId },
  });
  if (!keepReturn) forgetConnectReturn();
  leaveFor(authUrl);
}

/** The network answered badly (502), as opposed to our server being out of reach (status 0). */
export const networkDidNotAnswer = (err: unknown) => err instanceof ApiError && err.status === 502;

export interface LoginGroup {
  /** Null for accounts whose login was removed (not listed by the API today). */
  connection: SocialAccount['connection'];
  accounts: SocialAccount[];
}

export interface NetworkSection {
  network: NetworkId;
  /** Enabled on this server (so "Connect another" can be offered). */
  enabled: Network | undefined;
  logins: LoginGroup[];
  count: number;
}

/**
 * Accounts grouped by network, then by the login each comes through (docs/frontend/areas/
 * accounts.md). Logins nothing was added from yet (admins see them through `connections`) sit
 * under the first network they reach, so they can be finished or removed.
 */
export function groupAccounts(
  accounts: SocialAccount[],
  networks: Network[],
  connections: SocialConnection[] = [],
): NetworkSection[] {
  const order = new Map(networks.map((n, i) => [n.id, i]));
  const sections = new Map<NetworkId, NetworkSection>();
  const section = (id: NetworkId) => {
    let s = sections.get(id);
    if (!s) {
      s = { network: id, enabled: networks.find((n) => n.id === id), logins: [], count: 0 };
      sections.set(id, s);
    }
    return s;
  };
  for (const account of accounts) {
    const s = section(account.network);
    const key = account.connection?.id ?? null;
    let group = s.logins.find((g) => (g.connection?.id ?? null) === key);
    if (!group) {
      group = { connection: account.connection, accounts: [] };
      s.logins.push(group);
    }
    group.accounts.push(account);
    s.count += 1;
  }
  const shown = new Set(accounts.flatMap((a) => (a.connection ? [a.connection.id] : [])));
  for (const c of connections) {
    if (shown.has(c.id) || c.accounts.length > 0) continue;
    const home = networks.find((n) => n.logins.some((l) => l.provider === c.provider));
    if (!home) continue;
    section(home.id).logins.push({
      connection: {
        id: c.id,
        provider: c.provider,
        displayName: c.displayName,
        avatarUrl: c.avatarUrl,
        status: c.status,
      },
      accounts: [],
    });
  }
  return [...sections.values()].sort(
    (a, b) =>
      (order.get(a.network) ?? Number.MAX_SAFE_INTEGER) -
      (order.get(b.network) ?? Number.MAX_SAFE_INTEGER),
  );
}
