import { createHash, randomBytes } from 'node:crypto';

import {
  can,
  LoginProvider,
  NoChoices,
  type AccountOptionChoices,
  realtimeRooms,
  type AccountStatus,
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
  ProviderError,
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
  type Realtime,
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
  /** Live updates: `account.status_changed` to the workspace's room. */
  realtime: Realtime;
}

/** `token-refresh`: tokens expiring within this long are renewed (social-accounts.md, Jobs). */
export const TOKEN_REFRESH_AHEAD_HOURS = 72;
/**
 * Publishing renews a login token that expires within this long first (X's last two hours, so
 * the hourly job alone can't be relied on: a worker that was down would post with an expired one).
 */
export const TOKEN_FRESH_FOR_MINUTES = 10;
/** `account-health`: a login checked more recently than this is left until the next run. */
export const HEALTH_CHECK_EVERY_HOURS = 20;
/** Logins handled per run of either job; the rest wait for the next run. */
const JOB_BATCH = 500;
const HOUR = 3_600_000;

/** How reasons name each login's network. */
const PROVIDER_NAMES: Record<LoginProvider, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  x: 'X',
  youtube: 'YouTube',
  pinterest: 'Pinterest',
  tiktok: 'TikTok',
  snapchat: 'Snapchat',
  tumblr: 'Tumblr',
  threads: 'Threads',
};

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
  /** Tells the workspace's open pages (accounts, composer) that an account's status changed. */
  const announce = (workspaceId: string, accountId: string, status: AccountStatus) => {
    deps.realtime.emit(realtimeRooms.workspace(workspaceId), 'account.status_changed', {
      workspaceId,
      accountId,
      status,
    });
  };
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
      if (account.status === 'reauth_required') announce(workspaceId, account.id, 'active');
    }
  }

  // ---------------------------------------------------------------- background checks

  /** Usable logins in live workspaces (optionally one workspace: tests, an admin repair). */
  const usableConnections = (workspaceId: string | undefined) =>
    ({
      ...(workspaceId ? { workspaceId } : {}),
      status: 'active',
      workspace: { deletedAt: null },
    }) satisfies Prisma.SocialConnectionWhereInput;

  /**
   * `token-refresh` (hourly): renews login tokens expiring within 72 hours where the network
   * allows it (Instagram Login), and asset tokens expiring as soon (fetched again through their
   * login). A login the network refuses, or one that expired with no way to renew it, needs
   * reconnecting. A network that doesn't answer is tried again next hour.
   */
  /**
   * Renews a login's token if it still expires before `needBefore`, holding the connection's row
   * lock (`FOR UPDATE`) while asking the network. Networks that rotate refresh tokens (X) accept
   * each one once, so the job and a publish renewing at the same moment must not both use it: the
   * second waits for the lock, sees the new expiry and keeps the new token. Returns the row as it
   * is after, and whether it was renewed here. Throws the network's ProviderError.
   */
  async function renewLoginToken(connectionId: string, needBefore: Date) {
    return db.client.$transaction(
      async (tx) => {
        await tx.$queryRaw`SELECT id FROM "SocialConnection" WHERE id = ${connectionId}::uuid FOR UPDATE`;
        const c = await tx.socialConnection.findUniqueOrThrow({ where: { id: connectionId } });
        const login = registry.login(c.provider);
        if (!login.refresh || !c.tokenExpiresAt || c.tokenExpiresAt > needBefore) {
          return { row: c, renewed: false };
        }
        const fresh = await login.refresh(tokensOf(c));
        const row = await tx.socialConnection.update({
          where: { id: c.id },
          data: {
            accessTokenEnc: crypto.encrypt(fresh.accessToken),
            ...(fresh.refreshToken ? { refreshTokenEnc: crypto.encrypt(fresh.refreshToken) } : {}),
            tokenExpiresAt: fresh.expiresAt,
            ...(fresh.scopes.length ? { scopes: fresh.scopes } : {}),
          },
        });
        return { row, renewed: true };
      },
      { timeout: 60_000 },
    );
  }

  async function refreshExpiringTokens({ workspaceId }: { workspaceId?: string } = {}) {
    const now = clock.now();
    const soon = new Date(now.getTime() + TOKEN_REFRESH_AHEAD_HOURS * HOUR);
    const report = { refreshed: 0, assetsRefreshed: 0, reauth: 0, failed: 0 };
    const due = await db.client.socialConnection.findMany({
      where: {
        ...usableConnections(workspaceId),
        OR: [
          { tokenExpiresAt: { lte: soon } },
          {
            accounts: {
              some: { status: { in: ['active', 'paused'] }, assetTokenExpiresAt: { lte: soon } },
            },
          },
        ],
      },
      orderBy: [{ tokenExpiresAt: { sort: 'asc', nulls: 'last' } }, { id: 'asc' }],
      take: JOB_BATCH,
    });
    for (const c of due) {
      if (!registry.hasLogin(c.provider)) continue;
      const login = registry.login(c.provider);
      const name = PROVIDER_NAMES[c.provider];
      let current = c;
      if (c.tokenExpiresAt && c.tokenExpiresAt <= soon) {
        const expired = c.tokenExpiresAt <= now;
        if (!login.refresh) {
          // Nothing to renew it with: once it expires, whatever posts with it needs a new sign-in.
          if (expired) {
            await needsReconnect(c.workspaceId, c.id, `The ${name} sign-in expired`, {
              onlyLoginToken: true,
            });
            report.reauth++;
          }
          continue;
        }
        try {
          const renewal = await renewLoginToken(c.id, soon);
          current = renewal.row;
          if (renewal.renewed) report.refreshed++;
        } catch (err) {
          const refused = isProviderError(err) && err.kind === 'auth';
          if (refused || expired) {
            const why = refused ? err.message : 'it expired';
            await needsReconnect(c.workspaceId, c.id, `${name} didn’t renew the sign-in: ${why}`);
            report.reauth++;
          } else {
            logger.warn({ err, connectionId: c.id }, 'renewing a sign-in failed; next run retries');
            report.failed++;
          }
          continue;
        }
      }
      const assetsExpiring = await scoped(c.workspaceId).socialAccount.count({
        where: {
          connectionId: c.id,
          status: { in: ['active', 'paused'] },
          assetTokenExpiresAt: { lte: soon },
        },
      });
      if (assetsExpiring > 0) {
        const outcome = await checkAssets(current, { markLost: false });
        if (outcome === 'ok') report.assetsRefreshed += assetsExpiring;
        else if (outcome === 'reauth') report.reauth++;
        else report.failed++;
      }
    }
    if (report.refreshed || report.assetsRefreshed || report.reauth || report.failed) {
      logger.info(report, 'token-refresh finished');
    }
    return report;
  }

  /**
   * `account-health` (daily): asks each login's network what it can post to now (who it is, and
   * its access to each asset, e.g. still an admin of the Page). Accounts it can no longer post to
   * need reconnecting, with the reason; ones that came back are active again; names, pictures and
   * asset tokens are brought up to date. A login the network refuses needs reconnecting with all
   * its accounts. A network that doesn't answer changes nothing.
   */
  async function checkHealth({ workspaceId }: { workspaceId?: string } = {}) {
    const now = clock.now();
    const report = { checked: 0, reauth: 0, failed: 0 };
    const due = await db.client.socialConnection.findMany({
      where: {
        ...usableConnections(workspaceId),
        OR: [
          { lastCheckedAt: null },
          { lastCheckedAt: { lt: new Date(now.getTime() - HEALTH_CHECK_EVERY_HOURS * HOUR) } },
        ],
      },
      orderBy: [{ lastCheckedAt: { sort: 'asc', nulls: 'first' } }, { id: 'asc' }],
      take: JOB_BATCH,
    });
    for (const c of due) {
      if (!registry.hasLogin(c.provider)) continue;
      const outcome = await checkAssets(c, { markLost: true });
      if (outcome === 'ok') report.checked++;
      else if (outcome === 'reauth') report.reauth++;
      else report.failed++;
    }
    if (report.checked || report.reauth || report.failed) {
      logger.info(report, 'account-health finished');
    }
    return report;
  }

  /**
   * Lists the login's assets and brings its accounts up to date. With `markLost` (the health
   * check), an account the login no longer reaches, or can't post to, needs reconnecting; a token
   * refresh leaves that for the health check to judge.
   */
  async function checkAssets(
    c: ConnectionRow,
    { markLost }: { markLost: boolean },
  ): Promise<'ok' | 'reauth' | 'failed'> {
    const ws = scoped(c.workspaceId);
    const name = PROVIDER_NAMES[c.provider];
    let assets: ProviderAsset[];
    try {
      assets = await registry.login(c.provider).listAssets(tokensOf(c));
    } catch (err) {
      if (isProviderError(err) && err.kind === 'auth') {
        await needsReconnect(c.workspaceId, c.id, `${name} refused the sign-in: ${err.message}`);
        return 'reauth';
      }
      logger.warn(
        { err, connectionId: c.id },
        'checking a login’s accounts failed; next run retries',
      );
      return 'failed';
    }
    await ws.socialConnection.update({ where: { id: c.id }, data: { lastCheckedAt: clock.now() } });
    const accounts = await ws.socialAccount.findMany({
      where: { connectionId: c.id, status: { in: ['active', 'paused', 'reauth_required'] } },
    });
    for (const account of accounts) {
      // A network switched off on this server says nothing about the account.
      if (!registry.isEnabled(account.network)) continue;
      const asset = assets.find(
        (a) => a.network === account.network && a.externalId === account.externalId,
      );
      if (asset && !asset.unavailableReason) {
        await ws.socialAccount.update({
          where: { id: account.id },
          data: {
            ...assetFields(asset),
            ...(account.status === 'reauth_required'
              ? { status: 'active', statusReason: null }
              : {}),
          },
        });
        if (account.status === 'reauth_required') announce(c.workspaceId, account.id, 'active');
        continue;
      }
      if (!markLost || account.status === 'reauth_required') continue;
      const reason = !asset
        ? `${c.displayName} can no longer reach this account on ${name}`
        : asset.unavailableReason === 'not_professional'
          ? 'This is no longer a professional Instagram account'
          : `${c.displayName} no longer has permission to post here`;
      await accountNeedsReconnect(c.workspaceId, c.id, account.id, reason);
    }
    return 'ok';
  }

  /** One account the login can no longer post to; the login itself still works. */
  async function accountNeedsReconnect(
    workspaceId: string,
    connectionId: string,
    accountId: string,
    reason: string,
  ) {
    const moved = await scoped(workspaceId).socialAccount.updateMany({
      where: { id: accountId, status: { in: ['active', 'paused'] } },
      data: { status: 'reauth_required', statusReason: reason },
    });
    if (moved.count === 0) return;
    announce(workspaceId, accountId, 'reauth_required');
    await events.emit('account.reauth_required', { workspaceId, accountId, connectionId, reason });
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
      if (existing?.status !== 'active') announce(member.workspaceId, row.id, 'active');
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

  /**
   * What the account offers for its network's post options (Pinterest boards, TikTok creator
   * info…), asked of the network each time: boards change, and TikTok requires a fresh look before
   * every post. Networks whose options need nothing from the account answer with their id only.
   */
  async function getAccountOptions(
    member: MemberContext,
    accountId: string,
  ): Promise<AccountOptionChoices> {
    const a = await findAccount(member.workspaceId, accountId);
    if (a.status === 'disconnected' || !a.connection) {
      throw notFound('ACCOUNT_NOT_FOUND', 'Account not found or disconnected');
    }
    if (!registry.isEnabled(a.network)) {
      throw notFound('NETWORK_NOT_ENABLED', `${a.network} is not enabled on this server`);
    }
    const adapter = registry.network(a.network);
    if (!adapter.optionChoices) {
      // Networks whose options need choices (NoChoices excludes them) must implement the hook.
      return NoChoices.parse({ network: a.network });
    }
    if (a.status === 'reauth_required') {
      throw new AppError(409, 'ACCOUNT_REAUTH_REQUIRED', 'Reconnect this account first');
    }
    const { credentials } = await getCredentials(member.workspaceId, a.id);
    let choices: AccountOptionChoices;
    try {
      choices = await adapter.optionChoices(credentials);
    } catch (err) {
      if (isProviderError(err) && err.kind === 'auth') {
        await needsReconnect(member.workspaceId, a.connection.id, err.message);
        throw new AppError(
          409,
          'ACCOUNT_REAUTH_REQUIRED',
          `Reconnect this account: ${err.message}`,
        );
      }
      logger.warn({ err, network: a.network, accountId: a.id }, 'listing option choices failed');
      throw new AppError(502, 'NETWORK_ERROR', `${adapter.displayName} did not answer; try again`);
    }
    if (choices.network !== a.network) {
      throw new Error(`${a.network} answered option choices for ${choices.network}`);
    }
    return choices;
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
    announce(member.workspaceId, a.id, 'disconnected');
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
      announce(member.workspaceId, a.id, 'disconnected');
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
    let connection = a.connection;
    const freshUntil = new Date(clock.now().getTime() + TOKEN_FRESH_FOR_MINUTES * 60_000);
    // Posting with the login's token: renew it first if it's about to run out.
    if (
      !a.assetTokenEnc &&
      connection.tokenExpiresAt &&
      connection.tokenExpiresAt <= freshUntil &&
      registry.hasLogin(connection.provider) &&
      registry.login(connection.provider).refresh
    ) {
      try {
        connection = (await renewLoginToken(connection.id, freshUntil)).row;
      } catch (err) {
        if (isProviderError(err) && err.kind === 'auth') {
          const name = PROVIDER_NAMES[connection.provider];
          await needsReconnect(
            workspaceId,
            connection.id,
            `${name} didn’t renew the sign-in: ${err.message}`,
          );
          throw err;
        }
        // The network didn't answer: a token that still works is used; an expired one waits.
        if (!connection.tokenExpiresAt || connection.tokenExpiresAt <= clock.now()) {
          throw new ProviderError({
            kind: 'retryable',
            message: `Couldn't renew the ${PROVIDER_NAMES[connection.provider]} sign-in; trying again`,
            cause: err,
          });
        }
        logger.warn(
          { err, connectionId: connection.id },
          'renewing a sign-in before publishing failed',
        );
      }
    }
    const token = a.assetTokenEnc ?? connection.accessTokenEnc;
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
  function markReauthRequired(workspaceId: string, connectionId: string, reason: string) {
    return needsReconnect(workspaceId, connectionId, reason);
  }

  /**
   * The login needs signing in again. Its accounts do too, except, with `onlyLoginToken`, those
   * posting with their own token that still works (a Facebook Page token outlives its login's).
   * Only accounts that were working are moved and announced, so a repeat notifies nobody twice.
   */
  async function needsReconnect(
    workspaceId: string,
    connectionId: string,
    reason: string,
    { onlyLoginToken = false }: { onlyLoginToken?: boolean } = {},
  ) {
    const ws = scoped(workspaceId);
    const accounts = await ws.socialAccount.findMany({
      where: {
        connectionId,
        status: { in: ['active', 'paused'] },
        ...(onlyLoginToken
          ? { OR: [{ assetTokenEnc: null }, { assetTokenExpiresAt: { lte: clock.now() } }] }
          : {}),
      },
      select: { id: true },
    });
    await ws.socialConnection.update({
      where: { id: connectionId },
      data: { status: 'reauth_required', statusReason: reason },
    });
    await ws.socialAccount.updateMany({
      where: { id: { in: accounts.map((a) => a.id) }, status: { in: ['active', 'paused'] } },
      data: { status: 'reauth_required', statusReason: reason },
    });
    for (const a of accounts) {
      announce(workspaceId, a.id, 'reauth_required');
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
    getAccountOptions,
    disconnectAccount,
    removeConnection,
    getCredentials,
    markReauthRequired,
    refreshExpiringTokens,
    checkHealth,
  };
}

export type SocialAccountService = ReturnType<typeof createSocialAccountService>;
