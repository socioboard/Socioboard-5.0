# Module: social-accounts

**Phase:** 1 · **Path:** `packages/core/src/modules/social-accounts` · **Depends on:** providers, workspaces, platform (crypto, queue), audit, notifications, billing (account limit, optional)

## Purpose
Connecting social accounts (Facebook Pages, Instagram accounts, LinkedIn profiles/orgs, channels, boards…) to a workspace through each network's OAuth flow. Stores tokens encrypted, keeps them fresh, and tracks account health.

**Multi-account on every network:** a workspace can connect **any number of logins per network** (e.g. three different Facebook users), and **any number of assets per login** (e.g. all the Pages each Facebook user manages). Every network works this way; there is no one-account-per-network limit anywhere in the product (only the plan's total account limit on the hosted cloud).

## Two levels: connection and account
| Level | What it is | Examples |
| --- | --- | --- |
| **SocialConnection** | One login through a login provider (`facebook`, `instagram`, `linkedin`, … see [providers](providers.md#logins-and-networks)), holding that login's OAuth tokens | Facebook user "Priya", Facebook user "Brand Admin", Google account `ops@brand.com`, LinkedIn member "Chethan" |
| **SocialAccount** | One postable asset reached through a connection | Facebook Pages, Instagram professional accounts, LinkedIn profile + company pages, YouTube channels, Pinterest account, TikTok account, Tumblr blogs, X account, Snapchat profile |

A connection has one or more accounts, possibly of more than one network: a Facebook login reaches Pages (`facebook_page`) and the Instagram accounts linked to them (`instagram`). For networks where the login *is* the account (X, TikTok, Pinterest, Snapchat), the connection has exactly one account.

## Data
| Table | Key fields | Notes |
| --- | --- | --- |
| `SocialConnection` | id, workspaceId, provider, externalUserId, displayName, avatarUrl, accessTokenEnc, refreshTokenEnc, tokenExpiresAt, scopes, status (active/reauth_required/revoked), statusReason?, connectedById, lastCheckedAt | Unique (workspaceId, provider, externalUserId) |
| `SocialAccount` | id, workspaceId, connectionId?, network, externalId, displayName, username, avatarUrl, assetTokenEnc?, assetTokenExpiresAt?, meta JSON, status (active/reauth_required/disconnected/paused), statusReason?, connectedById, lastCheckedAt | Unique (workspaceId, network, externalId). `connectionId` is null once its login is removed (the account is then `disconnected`, kept for post history). `assetTokenEnc` only where the network issues per-asset tokens (e.g. Facebook Page tokens) |
| `SocialAccountGroup` | id, workspaceId, name | Saved sets, e.g. "Brand A all channels" |
| `SocialAccountGroupItem` | groupId, socialAccountId | |
| `OAuthState` | id, state, workspaceId, userId, provider, pkceVerifier, connectionId? (for reconnect), forceAccountSelection, expiresAt | 10-minute expiry, single use |

`meta` holds network extras (Pinterest default board, LinkedIn org URN, TikTok creator info cache).

## API
| Method | Path | Permission | Description |
| --- | --- | --- | --- |
| GET | `/api/v1/networks` | signed in | Enabled networks + capabilities/rules/preview spec + the logins that reach each (with whether they can show an account picker) |
| POST | `/api/v1/workspaces/:wid/accounts/connect/:provider` | `accounts:connect` | Start OAuth with a login provider (body: `{ forceAccountSelection: true }` when adding another login); returns the network's auth URL |
| GET | `/api/oauth/:provider/callback` | (state) | OAuth redirect target; creates or updates the SocialConnection, redirects to `/w/:slug/accounts/connect/:provider?connection=…&result=connected\|already_connected\|reconnected`, or `?error=<code>` (`ConnectErrorCode` in the contracts) |
| GET | `/api/v1/workspaces/:wid/connections/:cid/assets` | `accounts:connect` | Connectable assets for this login, marking ones already connected |
| POST | `/api/v1/workspaces/:wid/connections/:cid/assets` | `accounts:connect` | Add the chosen assets as SocialAccounts |
| GET | `/api/v1/workspaces/:wid/connections?provider=` | `accounts:manage` | Logins, each with its accounts |
| POST | `/api/v1/workspaces/:wid/connections/:cid/reconnect` | `accounts:connect` | Re-run OAuth for this login (must return the same user) |
| DELETE | `/api/v1/workspaces/:wid/connections/:cid` | `accounts:manage` | Remove a login and all its accounts |
| GET | `/api/v1/workspaces/:wid/accounts?network=` | `posts:read` | List accounts, with the login each comes through (respects member account access from phase 4; `disconnected` ones left out) |
| GET | `/api/v1/workspaces/:wid/accounts/:aid` | `posts:read` | Details + health + which login it comes through + how many pending posts disconnecting would cancel |
| DELETE | `/api/v1/workspaces/:wid/accounts/:aid` | `accounts:manage` | Disconnect one account; cancels its scheduled targets |
| CRUD | `/api/v1/workspaces/:wid/account-groups` | `accounts:manage` | Account groups (routes arrive with the groups UI, P3-F3; the tables exist from P1-B1) |

## Services
- `startConnect(workspace, user, provider, { forceAccountSelection })` → signed `state` + PKCE saved in `OAuthState`; adapter adds the network's account-picker/force-login parameter where supported.
- `handleCallback(provider, code, state)` → exchange code, fetch the login's identity (`externalUserId`):
  - **new login** → create a SocialConnection;
  - **login already connected** → refresh its tokens and tell the user "You're signed in to Facebook as Priya, who is already connected" with steps to switch accounts (below);
  - **reconnect** → must match the original `externalUserId`, otherwise reject with `RECONNECT_WRONG_ACCOUNT`.
- `saveAssets(connectionId, assetIds)` → encrypt tokens (AES-256-GCM), create SocialAccounts, respect `checkLimit('accounts')`.
- `getTokens(accountId)` → the asset token if the network uses one, else the connection's token; **only** for publishing/analytics workers.
- `markReauthRequired(connectionId, reason)` → marks the connection and all its accounts, notifies admins.

## Callback rules
- The `state` is deleted as it is read, so a callback works once. It must be for the same provider, within 10 minutes, from the **same signed-in person** who started it (the callback route sits behind the session middleware), who must still be a member allowed to `accounts:connect`. Anything else is `OAUTH_STATE_INVALID`.
- An unknown or used `state` gives no workspace to return to: the browser goes to `<APP_URL>/?connectError=<code>`. Otherwise to `/w/:slug/accounts/connect/:provider?…` as above.
- Every error becomes a readable code on that page (`ConnectErrorCode`): cancelled consent → `ACCESS_DENIED`; a login missing the adapter's `requiredScopes` (e.g. Facebook `pages_show_list`) → `MISSING_PERMISSIONS`; code exchange or identity failing → `NETWORK_ERROR`.
- Expired `OAuthState` rows are cleared when the same person starts a new connect (no separate job).
- The redirect is `303` with `Cache-Control: no-store` and `Referrer-Policy: no-referrer` (the URL held a one-time code).

## Errors (API)
| Code | Status | When |
| --- | --- | --- |
| `NETWORK_NOT_ENABLED` | 404 | The login provider has no keys on this server |
| `CONNECTION_NOT_FOUND`, `ACCOUNT_NOT_FOUND` | 404 | Not in this workspace |
| `ASSET_NOT_AVAILABLE` | 422 | Adding something the login no longer lists, or can't post to (`details.externalIds`) |
| `CONNECTION_REAUTH_REQUIRED` | 409 | The network refused the login's token while listing assets; the login and its accounts are marked `reauth_required` |
| `NETWORK_ERROR` | 502 | The network didn't answer while listing assets |

## Adding a second login of the same network
Networks sign the user in with whatever account the browser is already logged into, so a second "Connect" usually returns the same login. We handle it in three ways:
1. **Force the account picker** where the network supports it (adapter declares `supportsAccountSelection`; e.g. Google/YouTube `prompt=select_account`; other networks' parameters to be verified when building each adapter).
2. **Detect a duplicate** login in the callback and explain it, instead of silently doing nothing.
3. **Guide the user** where the network has no picker: "Sign out of Facebook in this browser (or use a private window), then click Connect again." The network chooser shows this tip before redirecting.

## Jobs
Both run in the worker (`upsertJobScheduler`), over `active` logins in live workspaces, at most 500 per run; `refreshExpiringTokens()` and `checkHealth()` on the service (P2-B7).
- `token-refresh` (hourly, `:20`): renews login tokens expiring within 72 hours where the login can (`LoginAdapter.refresh`: Instagram Login's 60-day tokens; the old token goes in, a new token and expiry come back), and asset tokens expiring as soon (listed again through their login). The network refusing the renewal, or a token already expired when it fails, → the login and its accounts `reauth_required` ("Instagram didn't renew the sign-in: …"); a network that doesn't answer is tried next hour. A login that can't be renewed (Facebook: its long-lived user token lasts about 60 days) is left until it expires, then marked `reauth_required` ("The Facebook sign-in expired") with only the accounts that post with its token: a Page posting with its own token, which doesn't expire with the login's, keeps posting. The admin console's expiring list (P2-B10) shows logins before that.
- `account-health` (daily, 04:00 UTC; a login checked in the last 20 hours waits): lists each login's assets, which is its "who am I" and the per-asset access check in one call. Accounts it no longer lists, or can't post to (`unavailableReason`), become `reauth_required` with a reason ("Priya no longer has permission to post here", "… can no longer reach this account on Facebook", "no longer a professional Instagram account"); the login stays active. Accounts listed and usable again come back to `active`; names, pictures and asset tokens are updated; `lastCheckedAt` is set. The network refusing the login → the login and all its accounts `reauth_required`. A network that doesn't answer changes nothing (checked again next run). Accounts of networks switched off on this server are left as they are.

**Reconnect flow:** whatever marks an account (a publish refused for `auth`, listing assets, either job) emits `account.reauth_required` once per account that was working (repeats announce nothing), which audit records and notifications (P2-B8) turn into a message for workspace admins. The accounts page shows "Needs reconnecting" with the reason and a Reconnect button; reconnecting as the same person makes the login and every account it still lists `active` again, with fresh tokens. Scheduled posts to an account needing reconnecting stay scheduled and fail at their time with a reconnect message if it hasn't been reconnected by then.

## Rules
- No per-network account limit. Plan limits (hosted cloud) count **SocialAccounts**, not connections.
- Two logins can reach the same asset (e.g. two Facebook users both admin the same Page). The asset is stored once per workspace, and the login that most recently connected it becomes its connection (the picker shows "already connected via Priya; switch to this login?").
- Tokens never leave the server and are never logged. They're decrypted only inside publishing and analytics workers.
- The same external login or asset may be connected to several workspaces; each workspace keeps its own tokens.
- Disconnecting an account or connection cancels the affected accounts' pending and scheduled PostTargets of non-draft posts (drafts keep theirs; validation flags the account) and emits `account.disconnected` with the cancelled target ids, from which posts recomputes status (P1-B6) and notifications tell authors (phase 2).
- Emits `connection.added`, `connection.removed`, `account.connected`, `account.disconnected`, `account.reauth_required` (audit + notifications).
