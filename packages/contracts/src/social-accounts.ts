import { z } from 'zod';

import { Id, IsoDateTime } from './common';
import { AccountOptionChoices } from './network-options';
import { LoginProvider, NetworkId } from './networks';
import { defineRoute } from './route';

/** A login's tokens work (`active`), need the user to sign in again, or were revoked. */
export const ConnectionStatus = z.enum(['active', 'reauth_required', 'revoked']);
export type ConnectionStatus = z.infer<typeof ConnectionStatus>;

/** `disconnected` accounts are kept for post history and come back when connected again. */
export const AccountStatus = z.enum(['active', 'reauth_required', 'disconnected', 'paused']);
export type AccountStatus = z.infer<typeof AccountStatus>;

const Person = z.object({ id: Id, name: z.string() });

/** The login an account is reached through, as shown next to the account. */
export const ConnectionSummary = z.object({
  id: Id,
  provider: LoginProvider,
  displayName: z.string(),
  avatarUrl: z.url().nullable(),
  status: ConnectionStatus,
});
export type ConnectionSummary = z.infer<typeof ConnectionSummary>;

/** One postable asset: a Facebook Page, an Instagram account, a channel, a board… */
export const SocialAccount = z.object({
  id: Id,
  network: NetworkId,
  displayName: z.string(),
  /** Handle without the @, where the network has one. */
  username: z.string().nullable(),
  avatarUrl: z.url().nullable(),
  status: AccountStatus,
  /** Null once its login was removed (the account is then `disconnected`). */
  connection: ConnectionSummary.nullable(),
  connectedBy: Person.nullable(),
  createdAt: IsoDateTime,
});
export type SocialAccount = z.infer<typeof SocialAccount>;

export const SocialAccountDetails = SocialAccount.extend({
  lastCheckedAt: IsoDateTime.nullable(),
  /** Why the account needs attention, in the network's words; null when healthy. */
  statusReason: z.string().nullable(),
  /** Scheduled or pending deliveries that disconnecting would cancel. */
  pendingPostCount: z.number().int().nonnegative(),
});
export type SocialAccountDetails = z.infer<typeof SocialAccountDetails>;

/** One login to a network with the accounts added through it. */
export const SocialConnection = ConnectionSummary.extend({
  connectedBy: Person.nullable(),
  createdAt: IsoDateTime,
  lastCheckedAt: IsoDateTime.nullable(),
  accounts: z.array(SocialAccount),
});
export type SocialConnection = z.infer<typeof SocialConnection>;

/** Something a login can post to, as offered by the asset picker. */
export const ConnectableAsset = z.object({
  externalId: z.string(),
  network: NetworkId,
  displayName: z.string(),
  username: z.string().nullable(),
  avatarUrl: z.url().nullable(),
  /** Already in this workspace (through this login or another). */
  account: z.object({ id: Id, status: AccountStatus }).nullable(),
  /** Set when another login of this workspace holds it; adding it here moves it to this login. */
  connectedVia: z.object({ connectionId: Id, displayName: z.string() }).nullable(),
  /** Why it can't be added (e.g. an Instagram account that isn't a professional account). */
  unavailableReason: z.enum(['not_professional', 'missing_permission']).nullable(),
});
export type ConnectableAsset = z.infer<typeof ConnectableAsset>;

export const StartConnectBody = z.object({
  /** Ask the network for its account picker (adding another login), where it has one. */
  forceAccountSelection: z.boolean().default(false),
});

export const StartConnectResponse = z.object({
  /** Send the browser here; the network redirects back to `/api/oauth/:provider/callback`. */
  authUrl: z.url(),
});

/**
 * Where the OAuth callback sends the browser: `/w/:slug/accounts/connect/:provider` with
 * `?connection=<id>&result=<ConnectResult>` on success, or `?error=<ConnectErrorCode>`.
 */
export const ConnectResult = z.enum(['connected', 'already_connected', 'reconnected']);
export type ConnectResult = z.infer<typeof ConnectResult>;
export const ConnectErrorCode = z.enum([
  /** The person cancelled on the network's consent screen. */
  'ACCESS_DENIED',
  /** Unknown, used or expired `state` (over 10 minutes). */
  'OAUTH_STATE_INVALID',
  /** Reconnecting signed in as a different person than the login being reconnected. */
  'RECONNECT_WRONG_ACCOUNT',
  /** Permissions needed for posting were not granted. */
  'MISSING_PERMISSIONS',
  'NETWORK_NOT_ENABLED',
  /** The network failed or answered something unexpected. */
  'NETWORK_ERROR',
]);
export type ConnectErrorCode = z.infer<typeof ConnectErrorCode>;

export const ListConnectableAssetsResponse = z.object({
  connection: ConnectionSummary,
  items: z.array(ConnectableAsset),
});

export const AddAssetsBody = z.object({
  externalIds: z.array(z.string().min(1)).min(1).max(100),
});

export const ListAccountsQuery = z.object({ network: NetworkId.optional() });
export const ListConnectionsQuery = z.object({ provider: LoginProvider.optional() });

/**
 * A saved set of accounts, e.g. "Brand A: all channels" (P3-F3): picking it in the composer
 * selects its accounts that can post. Accounts in it keep their place while disconnected.
 */
export const AccountGroup = z.object({
  id: Id,
  name: z.string(),
  /** In the order they were picked. */
  accountIds: z.array(Id),
  createdAt: IsoDateTime,
});
export type AccountGroup = z.infer<typeof AccountGroup>;

/** Names are unique in a workspace, ignoring case. */
export const AccountGroupBody = z.object({
  name: z.string().trim().min(1).max(60),
  accountIds: z
    .array(Id)
    .min(1)
    .max(100)
    .refine((ids) => new Set(ids).size === ids.length, 'The same account is chosen twice'),
});
export type AccountGroupBody = z.infer<typeof AccountGroupBody>;

const workspaceParams = z.object({ workspaceId: Id });
const connectionParams = workspaceParams.extend({ connectionId: Id });
const accountParams = workspaceParams.extend({ accountId: Id });
const groupParams = workspaceParams.extend({ groupId: Id });

export const socialAccountRoutes = {
  startConnect: defineRoute({
    method: 'POST',
    path: '/api/v1/workspaces/:workspaceId/accounts/connect/:provider',
    access: 'accounts:connect',
    summary: "Start connecting: returns the network's sign-in URL",
    params: workspaceParams.extend({ provider: LoginProvider }),
    body: StartConnectBody,
    responses: { 200: StartConnectResponse },
  }),

  listConnections: defineRoute({
    method: 'GET',
    path: '/api/v1/workspaces/:workspaceId/connections',
    access: 'accounts:manage',
    summary: 'Logins, each with the accounts added through it',
    params: workspaceParams,
    query: ListConnectionsQuery,
    responses: { 200: z.object({ items: z.array(SocialConnection) }) },
  }),
  listConnectableAssets: defineRoute({
    method: 'GET',
    path: '/api/v1/workspaces/:workspaceId/connections/:connectionId/assets',
    access: 'accounts:connect',
    summary: 'What this login can post to, marking what is already connected',
    params: connectionParams,
    responses: { 200: ListConnectableAssetsResponse },
  }),
  addAssets: defineRoute({
    method: 'POST',
    path: '/api/v1/workspaces/:workspaceId/connections/:connectionId/assets',
    access: 'accounts:connect',
    summary: 'Add the chosen assets as accounts of the workspace',
    params: connectionParams,
    body: AddAssetsBody,
    responses: { 201: z.object({ items: z.array(SocialAccount) }) },
  }),
  reconnect: defineRoute({
    method: 'POST',
    path: '/api/v1/workspaces/:workspaceId/connections/:connectionId/reconnect',
    access: 'accounts:connect',
    summary: 'Sign in again as the same person to refresh this login',
    params: connectionParams,
    responses: { 200: StartConnectResponse },
  }),
  removeConnection: defineRoute({
    method: 'DELETE',
    path: '/api/v1/workspaces/:workspaceId/connections/:connectionId',
    access: 'accounts:manage',
    summary: 'Remove a login and disconnect its accounts (cancels their pending posts)',
    params: connectionParams,
    responses: { 204: null },
  }),

  listAccounts: defineRoute({
    method: 'GET',
    path: '/api/v1/workspaces/:workspaceId/accounts',
    access: 'posts:read',
    summary: 'Connected accounts (not disconnected ones)',
    params: workspaceParams,
    query: ListAccountsQuery,
    responses: { 200: z.object({ items: z.array(SocialAccount) }) },
  }),
  getAccount: defineRoute({
    method: 'GET',
    path: '/api/v1/workspaces/:workspaceId/accounts/:accountId',
    access: 'posts:read',
    summary: 'Account details, health and the login it comes through',
    params: accountParams,
    responses: { 200: SocialAccountDetails },
  }),
  getAccountOptions: defineRoute({
    method: 'GET',
    path: '/api/v1/workspaces/:workspaceId/accounts/:accountId/options',
    access: 'posts:create',
    summary: "What the account offers for its network's post options (boards, privacy levels…)",
    params: accountParams,
    responses: { 200: AccountOptionChoices },
  }),
  disconnectAccount: defineRoute({
    method: 'DELETE',
    path: '/api/v1/workspaces/:workspaceId/accounts/:accountId',
    access: 'accounts:manage',
    summary: 'Disconnect one account; cancels its pending posts',
    params: accountParams,
    responses: { 204: null },
  }),

  listAccountGroups: defineRoute({
    method: 'GET',
    path: '/api/v1/workspaces/:workspaceId/account-groups',
    access: 'posts:read',
    summary: 'The workspace’s account groups, by name',
    params: workspaceParams,
    responses: { 200: z.object({ items: z.array(AccountGroup) }) },
  }),
  createAccountGroup: defineRoute({
    method: 'POST',
    path: '/api/v1/workspaces/:workspaceId/account-groups',
    access: 'accounts:manage',
    summary: 'Save a set of accounts under a name',
    params: workspaceParams,
    body: AccountGroupBody,
    responses: { 201: AccountGroup },
  }),
  updateAccountGroup: defineRoute({
    method: 'PUT',
    path: '/api/v1/workspaces/:workspaceId/account-groups/:groupId',
    access: 'accounts:manage',
    summary: 'Rename a group and replace its accounts',
    params: groupParams,
    body: AccountGroupBody,
    responses: { 200: AccountGroup },
  }),
  deleteAccountGroup: defineRoute({
    method: 'DELETE',
    path: '/api/v1/workspaces/:workspaceId/account-groups/:groupId',
    access: 'accounts:manage',
    summary: 'Delete a group; its accounts and posts stay',
    params: groupParams,
    responses: { 204: null },
  }),
};
