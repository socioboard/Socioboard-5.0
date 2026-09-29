import { createHash, randomBytes } from 'node:crypto';

import {
  can,
  LoginProvider,
  type ConnectableAsset,
  type ConnectErrorCode,
  type ConnectResult,
  type ConnectionSummary,
  type NetworkId,
  type SocialAccount,
  type SocialAccountDetails,
  type SocialConnection,
} from '@socioboard/contracts';
import type { Prisma } from '@socioboard/db';
import {
  isProviderError,
  type AccountCredentials,
  type LoginAdapter,
  type Pkce,
  type ProviderAsset,
  type Registry,
  type TokenSet,
} from '@socioboard/providers';

import {
  AppError,
  newId,
  notFound,
  typedEvents,
  unprocessable,
  type AuthContext,
  type Clock,
  type Crypto,
  type Db,
  type EventBus,
  type Logger,
  type MemberContext,
  type MembershipLookup,
} from '../../platform';
import type { SocialAccountEvents } from './events';

export interface SocialAccountServiceDeps {
  db: Db;
  crypto: Crypto;
  clock: Clock;
  logger: Logger;
  events: EventBus<Record<string, unknown>>;
  registry: Registry;
  /** The web app's origin; OAuth redirects come back to `<appUrl>/api/oauth/<provider>/callback`. */
  appUrl: string;
  lookupMembership: MembershipLookup;
}

/** A sign-in attempt must come back within this long (docs: 10-minute expiry, single use). */
const STATE_TTL_MS = 10 * 60_000;
/** Delivery states that disconnecting an account cancels (drafts keep theirs; validation flags them). */
const PENDING_TARGET: Prisma.PostTargetWhereInput = {
  status: { in: ['pending', 'scheduled'] },
  post: { status: { not: 'draft' } },
};

const accountInclude = {
  connection: {
    select: { id: true, provider: true, displayName: true, avatarUrl: true, status: true },
  },
  connectedBy: { select: { id: true, name: true } },
} as const;
type AccountRow = Prisma.SocialAccountGetPayload<{ include: typeof accountInclude }>;
type ConnectionRow = Prisma.SocialConnectionGetPayload<object>;

/** Avatar URLs come from the networks; keep only real http(s) URLs so responses stay valid. */
function safeUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null;
  } catch {
    return null;
  }
}

const randomToken = () => randomBytes(32).toString('base64url');
const pkceFor = (verifier: string): Pkce => ({
  verifier,
  challenge: createHash('sha256').update(verifier).digest('base64url'),
});

export function createSocialAccountService(deps: SocialAccountServiceDeps) {
  const { db, crypto, clock, logger, registry } = deps;
  const events = typedEvents<SocialAccountEvents>(deps.events);
  const scoped = (workspaceId: string) => db.forWorkspace(workspaceId);
  const redirectUri = (provider: LoginProvider) =>
    new URL(`/api/oauth/${provider}/callback`, deps.appUrl).toString();

  function requireLogin(provider: LoginProvider): LoginAdapter {
    if (!registry.hasLogin(provider)) {
      throw notFound('NETWORK_NOT_ENABLED', `${provider} is not enabled on this server`);
    }
    return registry.login(provider);
  }

  // ---------------------------------------------------------------- shaping

  const toSummary = (c: {
    id: string;
    provider: LoginProvider;
    displayName: string;
    avatarUrl: string | null;
    status: ConnectionSummary['status'];
  }): ConnectionSummary => ({
    id: c.id,
    provider: c.provider,
    displayName: c.displayName,
    avatarUrl: safeUrl(c.avatarUrl),
    status: c.status,
  });

  const toAccount = (a: AccountRow): SocialAccount => ({
    id: a.id,
    network: a.network,
    displayName: a.displayName,
    username: a.username,
    avatarUrl: safeUrl(a.avatarUrl),
    status: a.status,
    connection: a.connection ? toSummary(a.connection) : null,
    connectedBy: a.connectedBy,
    createdAt: a.createdAt.toISOString(),
  });

  // ---------------------------------------------------------------- lookups

  async function findConnection(workspaceId: string, connectionId: string) {
    const c = await scoped(workspaceId).socialConnection.findUnique({
      where: { id: connectionId },
    });
    if (!c) throw notFound('CONNECTION_NOT_FOUND', 'Login not found');
    return c;
  }

  async function findAccount(workspaceId: string, accountId: string) {
    const a = await scoped(workspaceId).socialAccount.findUnique({
      where: { id: accountId },
      include: accountInclude,
    });
    if (!a) throw notFound('ACCOUNT_NOT_FOUND', 'Account not found');
    return a;
  }

  const tokensOf = (c: ConnectionRow): TokenSet => ({
    accessToken: crypto.decrypt(c.accessTokenEnc),
    refreshToken: c.refreshTokenEnc ? crypto.decrypt(c.refreshTokenEnc) : null,
    expiresAt: c.tokenExpiresAt,
    scopes: c.scopes,
  });

  /** What this login can post to right now, asked of the network (never cached: tokens change). */
  async function liveAssets(c: ConnectionRow): Promise<ProviderAsset[]> {
    const login = requireLogin(c.provider);
    try {
      const assets = await login.listAssets(tokensOf(c));
      return assets.filter((a) => registry.isEnabled(a.network));
    } catch (err) {
      if (isProviderError(err) && err.kind === 'auth') {
        await markReauthRequired(c.workspaceId, c.id, err.message);
        throw new AppError(
          409,
          'CONNECTION_REAUTH_REQUIRED',
          `Sign in to ${c.provider} again: ${err.message}`,
        );
      }
      logger.warn({ err, provider: c.provider, connectionId: c.id }, 'listing assets failed');
      throw new AppError(502, 'NETWORK_ERROR', `${c.provider} did not answer; try again`);
    }
  }

  // ---------------------------------------------------------------- connect

  async function createState(
    caller: AuthContext,
    member: MemberContext,
    login: LoginAdapter,
    extra: { connectionId: string | null; forceAccountSelection: boolean },
  ) {
    const now = clock.now();
    // Old attempts of this person are never coming back; clear them as new ones start.
    await scoped(member.workspaceId).oAuthState.deleteMany({
      where: { userId: caller.user.id, expiresAt: { lt: now } },
    });
    const state = randomToken();
    const pkce = login.usesPkce ? pkceFor(randomToken()) : undefined;
    await scoped(member.workspaceId).oAuthState.create({
      data: {
        id: newId(),
        state,
        workspaceId: member.workspaceId,
        userId: caller.user.id,
        provider: login.id,
        pkceVerifier: pkce?.verifier ?? null,
        connectionId: extra.connectionId,
        forceAccountSelection: extra.forceAccountSelection,
        expiresAt: new Date(now.getTime() + STATE_TTL_MS),
      },
    });
    return {
      authUrl: login.getAuthUrl({
        state,
        redirectUri: redirectUri(login.id),
        forceAccountSelection: extra.forceAccountSelection,
        ...(pkce ? { pkce } : {}),
      }),
    };
  }

  function startConnect(
    caller: AuthContext,
    member: MemberContext,
    provider: LoginProvider,
    forceAccountSelection: boolean,
  ) {
    const login = requireLogin(provider);
    return createState(caller, member, login, {
      connectionId: null,
      forceAccountSelection: forceAccountSelection && login.supportsAccountSelection,
    });
  }

  async function reconnect(caller: AuthContext, member: MemberContext, connectionId: string) {
    const c = await findConnection(member.workspaceId, connectionId);
    return createState(caller, member, requireLogin(c.provider), {
      connectionId: c.id,
      forceAccountSelection: false,
    });
  }

  /**
   * The network sent the browser back. Returns where to send it next: the asset picker with
   * `?connection=…&result=…`, or `?error=<ConnectErrorCode>`. Never throws for bad input: every
   * problem becomes a readable error on the page.
   */
  async function handleCallback(
    providerParam: string,
    query: Record<string, unknown>,
    caller: AuthContext | null,
  ): Promise<string> {
    try {
      return await callback(providerParam, query, caller);
    } catch (err) {
      // The browser arrived from the network's site: it gets our app with a message, never a
      // JSON error page, even when something unexpected (a database hiccup) failed.
      logger.error({ err, provider: providerParam }, 'OAuth callback failed');
      return home('NETWORK_ERROR');
    }
  }

  const home = (code: ConnectErrorCode) =>
    `${new URL('/', deps.appUrl).toString()}?connectError=${code}`;

  async function callback(
    providerParam: string,
    query: Record<string, unknown>,
    caller: AuthContext | null,
  ): Promise<string> {
    const parsed = LoginProvider.safeParse(providerParam);
    const stateValue = typeof query.state === 'string' ? query.state : '';
    if (!parsed.success) return home('NETWORK_NOT_ENABLED');
    const provider = parsed.data;
    if (stateValue === '') return home('OAUTH_STATE_INVALID');

    // Deleting first makes the state single-use, even when the callback is replayed at once.
    const row = await db.client.oAuthState
      .delete({ where: { state: stateValue } })
      .catch(() => null);
    if (!row) return home('OAUTH_STATE_INVALID');
    const workspace = await db.client.workspace.findUnique({
      where: { id: row.workspaceId },
      select: { slug: true, deletedAt: true },
    });
    if (!workspace || workspace.deletedAt) return home('OAUTH_STATE_INVALID');
    const page = (params: Record<string, string>) =>
      new URL(
        `/w/${workspace.slug}/accounts/connect/${provider}?${new URLSearchParams(params).toString()}`,
        deps.appUrl,
      ).toString();
    const fail = (code: ConnectErrorCode) => page({ error: code });

    // The same browser session that started, still allowed to connect accounts here.
    if (row.provider !== provider || row.expiresAt <= clock.now())
      return fail('OAUTH_STATE_INVALID');
    if (caller?.user.id !== row.userId) return fail('OAUTH_STATE_INVALID');
    const member = await deps.lookupMembership(row.userId, row.workspaceId);
    if (!member || !can(member.role, 'accounts:connect')) return fail('OAUTH_STATE_INVALID');

    if (query.error !== undefined) return fail('ACCESS_DENIED');
    const code = typeof query.code === 'string' ? query.code : '';
    if (code === '') return fail('ACCESS_DENIED');
    if (!registry.hasLogin(provider)) return fail('NETWORK_NOT_ENABLED');
    const login = registry.login(provider);

    let tokens: TokenSet;
    let identity: Awaited<ReturnType<LoginAdapter['getIdentity']>>;
    try {
      tokens = await login.exchangeCode({
        code,
        redirectUri: redirectUri(provider),
        ...(row.pkceVerifier ? { pkce: pkceFor(row.pkceVerifier) } : {}),
      });
      identity = await login.getIdentity(tokens);
    } catch (err) {
      logger.warn({ err, provider }, 'OAuth code exchange failed');
      return fail('NETWORK_ERROR');
    }
    if (login.requiredScopes.some((s) => !tokens.scopes.includes(s))) {
      return fail('MISSING_PERMISSIONS');
    }

    const fields = {
      displayName: identity.displayName,
      avatarUrl: safeUrl(identity.avatarUrl),
      accessTokenEnc: crypto.encrypt(tokens.accessToken),
      refreshTokenEnc: tokens.refreshToken ? crypto.encrypt(tokens.refreshToken) : null,
      tokenExpiresAt: tokens.expiresAt,
      scopes: tokens.scopes,
      status: 'active' as const,
      statusReason: null,
      lastCheckedAt: clock.now(),
    };
    const ws = scoped(row.workspaceId);

    let connectionId: string;
    let result: ConnectResult;
    if (row.connectionId) {
      const existing = await ws.socialConnection.findUnique({ where: { id: row.connectionId } });
      if (!existing) return fail('OAUTH_STATE_INVALID');
      if (existing.externalUserId !== identity.externalUserId) {
        return fail('RECONNECT_WRONG_ACCOUNT');
      }
      await ws.socialConnection.update({ where: { id: existing.id }, data: fields });
      connectionId = existing.id;
      result = 'reconnected';
    } else {
      const same = { provider, externalUserId: identity.externalUserId };
      const existing = await ws.socialConnection.findFirst({ where: same });
      if (existing) {
        await ws.socialConnection.update({ where: { id: existing.id }, data: fields });
        connectionId = existing.id;
        result = 'already_connected';
      } else {
        try {
          const created = await ws.socialConnection.create({
            data: {
              id: newId(),
              workspaceId: row.workspaceId,
              ...same,
              ...fields,
              connectedById: row.userId,
            },
          });
          connectionId = created.id;
          result = 'connected';
          await events.emit('connection.added', {
            workspaceId: row.workspaceId,
            connectionId,
            provider,
            userId: row.userId,
          });
        } catch (err) {
          // The same login finished twice at once: the other request created it.
          const raced = await ws.socialConnection.findFirst({ where: same });
          if (!raced) throw err;
          connectionId = raced.id;
          result = 'already_connected';
        }
      }
    }
    if (result !== 'connected') await refreshAccounts(row.workspaceId, connectionId);
    return page({ connection: connectionId, result });
  }

  /**
   * After a login signs in again, its accounts get the fresh asset tokens (Page tokens come from
   * the new user token) and leave `reauth_required`. Best effort: the login itself is saved.
   */
  async function refreshAccounts(workspaceId: string, connectionId: string) {
    const ws = scoped(workspaceId);
    const accounts = await ws.socialAccount.findMany({
      where: { connectionId, status: { not: 'disconnected' } },
    });
    if (accounts.length === 0) return;
    let assets: ProviderAsset[];
    try {
      assets = await liveAssets(await findConnection(workspaceId, connectionId));
    } catch (err) {
      logger.warn({ err, connectionId }, 'refreshing account tokens after sign-in failed');
      return;
    }
    for (const account of accounts) {
      const asset = assets.find(
        (a) => a.network === account.network && a.externalId === account.externalId,
      );
      if (!asset || asset.unavailableReason) continue;
      await ws.socialAccount.update({
        where: { id: account.id },
        data: {
          ...assetFields(asset),
          ...(account.status === 'reauth_required' ? { status: 'active', statusReason: null } : {}),
        },
      });
    }
  }

  const assetFields = (a: ProviderAsset) => ({
    displayName: a.displayName,
    username: a.username,
    avatarUrl: safeUrl(a.avatarUrl),
    assetTokenEnc: a.token ? crypto.encrypt(a.token.accessToken) : null,
    assetTokenExpiresAt: a.token?.expiresAt ?? null,
    meta: a.meta as Prisma.InputJsonValue,
    lastCheckedAt: clock.now(),
  });

  // ---------------------------------------------------------------- asset picker

  async function listConnectableAssets(member: MemberContext, connectionId: string) {
    const c = await findConnection(member.workspaceId, connectionId);
    const assets = await liveAssets(c);
    const existing = assets.length
      ? await scoped(member.workspaceId).socialAccount.findMany({
          where: { OR: assets.map((a) => ({ network: a.network, externalId: a.externalId })) },
          include: { connection: { select: { id: true, displayName: true } } },
        })
      : [];
    const items: ConnectableAsset[] = assets.map((a) => {
      const match = existing.find((e) => e.network === a.network && e.externalId === a.externalId);
      const live = match && match.status !== 'disconnected' ? match : undefined;
      return {
        externalId: a.externalId,
        network: a.network,
        displayName: a.displayName,
        username: a.username,
        avatarUrl: safeUrl(a.avatarUrl),
        account: live ? { id: live.id, status: live.status } : null,
        connectedVia:
          live?.connection && live.connection.id !== c.id
            ? { connectionId: live.connection.id, displayName: live.connection.displayName }
            : null,
        unavailableReason: a.unavailableReason,
      };
    });
    return { connection: toSummary(c), items };
  }

  async function addAssets(
    caller: AuthContext,
    member: MemberContext,
    connectionId: string,
    externalIds: string[],
  ) {
    const c = await findConnection(member.workspaceId, connectionId);
    const assets = await liveAssets(c);
    const chosen = [...new Set(externalIds)].map((id) => ({
      id,
      asset: assets.find((a) => a.externalId === id),
    }));
    const unavailable = chosen.filter((x) => !x.asset || x.asset.unavailableReason);
    if (unavailable.length > 0) {
      throw unprocessable(
        'ASSET_NOT_AVAILABLE',
        'Some of these can’t be added through this login',
        { externalIds: unavailable.map((x) => x.id) },
      );
    }
    // Plan limits (checkLimit('accounts')) arrive with billing in phase 5.
    const ws = scoped(member.workspaceId);
    const added: AccountRow[] = [];
    for (const { asset } of chosen) {
      if (!asset) continue;
      const key = { network: asset.network, externalId: asset.externalId };
      const existing = await ws.socialAccount.findFirst({ where: key });
      const data = {
        ...assetFields(asset),
        connectionId: c.id,
        status: 'active' as const,
        statusReason: null,
      };
      const row = existing
        ? await ws.socialAccount.update({
            where: { id: existing.id },
            data,
            include: accountInclude,
          })
        : await ws.socialAccount.create({
            data: {
              id: newId(),
              workspaceId: member.workspaceId,
              ...key,
              ...data,
              connectedById: caller.user.id,
            },
            include: accountInclude,
          });
      added.push(row);
      // New, back from disconnected, or moved to this login: all worth an audit entry.
      if (!existing || existing.status === 'disconnected' || existing.connectionId !== c.id) {
        await events.emit('account.connected', {
          workspaceId: member.workspaceId,
          accountId: row.id,
          network: row.network,
          connectionId: c.id,
          userId: caller.user.id,
        });
      }
    }
    return { items: added.map(toAccount) };
  }

  // ---------------------------------------------------------------- lists and details

  async function listConnections(
    member: MemberContext,
    provider: LoginProvider | undefined,
  ): Promise<SocialConnection[]> {
    const rows = await scoped(member.workspaceId).socialConnection.findMany({
      where: provider ? { provider } : {},
      include: {
        connectedBy: { select: { id: true, name: true } },
        accounts: {
          where: { status: { not: 'disconnected' } },
          include: accountInclude,
          orderBy: [{ network: 'asc' }, { displayName: 'asc' }, { id: 'asc' }],
        },
      },
      orderBy: [{ provider: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }],
    });
    return rows.map((c) => ({
      ...toSummary(c),
      connectedBy: c.connectedBy,
      createdAt: c.createdAt.toISOString(),
      lastCheckedAt: c.lastCheckedAt?.toISOString() ?? null,
      accounts: c.accounts.map(toAccount),
    }));
  }

  async function listAccounts(member: MemberContext, network: NetworkId | undefined) {
    const rows = await scoped(member.workspaceId).socialAccount.findMany({
      where: { status: { not: 'disconnected' }, ...(network ? { network } : {}) },
      include: accountInclude,
      orderBy: [{ network: 'asc' }, { displayName: 'asc' }, { id: 'asc' }],
    });
    return rows.map(toAccount);
  }

  async function getAccount(
    member: MemberContext,
    accountId: string,
  ): Promise<SocialAccountDetails> {
    const a = await findAccount(member.workspaceId, accountId);
    const pendingPostCount = await scoped(member.workspaceId).postTarget.count({
      where: { socialAccountId: a.id, ...PENDING_TARGET },
    });
    return {
      ...toAccount(a),
      lastCheckedAt: a.lastCheckedAt?.toISOString() ?? null,
      statusReason: a.statusReason,
      pendingPostCount,
    };
  }

  // ---------------------------------------------------------------- disconnect

  /** Cancels the accounts' pending deliveries; returns the cancelled target ids per account. */
  async function cancelPendingTargets(
    tx: Prisma.TransactionClient,
    workspaceId: string,
    accountIds: string[],
  ) {
    const targets = await tx.postTarget.findMany({
      where: { workspaceId, socialAccountId: { in: accountIds }, ...PENDING_TARGET },
      select: { id: true, socialAccountId: true },
    });
    await tx.postTarget.updateMany({
      where: { workspaceId, id: { in: targets.map((t) => t.id) } },
      data: { status: 'cancelled' },
    });
    return (accountId: string) =>
      targets.filter((t) => t.socialAccountId === accountId).map((t) => t.id);
  }

  const disconnectedFields = {
    status: 'disconnected' as const,
    statusReason: null,
    assetTokenEnc: null,
    assetTokenExpiresAt: null,
  };

  async function disconnectAccount(caller: AuthContext, member: MemberContext, accountId: string) {
    const a = await findAccount(member.workspaceId, accountId);
    if (a.status === 'disconnected') return;
    const cancelled = await db.client.$transaction(async (tx) => {
      const byAccount = await cancelPendingTargets(tx, member.workspaceId, [a.id]);
      await tx.socialAccount.update({
        where: { id: a.id, workspaceId: member.workspaceId },
        data: disconnectedFields,
      });
      return byAccount(a.id);
    });
    await events.emit('account.disconnected', {
      workspaceId: member.workspaceId,
      accountId: a.id,
      network: a.network,
      userId: caller.user.id,
      cancelledTargetIds: cancelled,
    });
  }

  async function removeConnection(
    caller: AuthContext,
    member: MemberContext,
    connectionId: string,
  ) {
    const c = await findConnection(member.workspaceId, connectionId);
    const accounts = await scoped(member.workspaceId).socialAccount.findMany({
      where: { connectionId: c.id },
    });
    const live = accounts.filter((a) => a.status !== 'disconnected');
    const cancelledFor = await db.client.$transaction(async (tx) => {
      const byAccount = await cancelPendingTargets(
        tx,
        member.workspaceId,
        live.map((a) => a.id),
      );
      // Accounts stay (post history points at them); only the link to the login goes.
      await tx.socialAccount.updateMany({
        where: { workspaceId: member.workspaceId, connectionId: c.id },
        data: { ...disconnectedFields, connectionId: null },
      });
      await tx.socialConnection.delete({
        where: { id: c.id, workspaceId: member.workspaceId },
      });
      return byAccount;
    });
    await events.emit('connection.removed', {
      workspaceId: member.workspaceId,
      connectionId: c.id,
      provider: c.provider,
      userId: caller.user.id,
    });
    for (const a of live) {
      await events.emit('account.disconnected', {
        workspaceId: member.workspaceId,
        accountId: a.id,
        network: a.network,
        userId: caller.user.id,
        cancelledTargetIds: cancelledFor(a.id),
      });
    }
  }

  // ---------------------------------------------------------------- for workers

  /**
   * The token to publish with: the asset's own (Facebook Page tokens) or its login's. Only the
   * publishing and analytics workers call this; tokens never leave the server.
   */
  async function getCredentials(
    workspaceId: string,
    accountId: string,
  ): Promise<{ network: NetworkId; credentials: AccountCredentials }> {
    const a = await scoped(workspaceId).socialAccount.findUnique({
      where: { id: accountId },
      include: { connection: true },
    });
    if (!a || a.status === 'disconnected' || !a.connection) {
      throw notFound('ACCOUNT_NOT_FOUND', 'Account not found or disconnected');
    }
    const token = a.assetTokenEnc ?? a.connection.accessTokenEnc;
    return {
      network: a.network,
      credentials: {
        externalId: a.externalId,
        accessToken: crypto.decrypt(token),
        meta: a.meta as Record<string, unknown>,
      },
    };
  }

  /** The network refused this login's tokens: it and its accounts need reconnecting. */
  async function markReauthRequired(workspaceId: string, connectionId: string, reason: string) {
    const ws = scoped(workspaceId);
    const accounts = await ws.socialAccount.findMany({
      where: { connectionId, status: { in: ['active', 'paused'] } },
      select: { id: true },
    });
    await ws.socialConnection.update({
      where: { id: connectionId },
      data: { status: 'reauth_required', statusReason: reason },
    });
    await ws.socialAccount.updateMany({
      where: { id: { in: accounts.map((a) => a.id) } },
      data: { status: 'reauth_required', statusReason: reason },
    });
    for (const a of accounts) {
      await events.emit('account.reauth_required', {
        workspaceId,
        accountId: a.id,
        connectionId,
        reason,
      });
    }
  }

  return {
    listNetworks: () => registry.networks(),
    startConnect,
    reconnect,
    handleCallback,
    listConnectableAssets,
    addAssets,
    listConnections,
    listAccounts,
    getAccount,
    disconnectAccount,
    removeConnection,
    getCredentials,
    markReauthRequired,
  };
}

export type SocialAccountService = ReturnType<typeof createSocialAccountService>;
