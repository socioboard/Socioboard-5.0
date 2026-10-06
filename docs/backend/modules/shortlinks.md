# Module: shortlinks

**Phase:** 3 · **Path:** `packages/core/src/modules/shortlinks` · **Depends on:** providers (utilities/bitly), social-accounts (for the Bitly connection), posts

## Purpose
Shorten links in posts. Users connect their own Bitly account; the composer can shorten links on demand or automatically at publish time. Built behind a `LinkShortener` interface so other shorteners can be added.

## Data
| Table | Key fields | Notes |
| --- | --- | --- |
| `ShortenerConnection` | id, workspaceId, provider (bitly), tokenEnc, accountName, defaultDomain, groupGuid, autoShorten, connectedById?, createdAt | One per workspace |
| `ShortLink` | id, workspaceId, longUrl, shortUrl, provider, postTargetId?, createdAt | Reused when the same URL is shortened again |

## API
Contracts: `packages/contracts/src/shortlinks.ts` (P3-C1); mounted by P3-B8.

| Method | Path | Permission | Description |
| --- | --- | --- | --- |
| GET | `/api/v1/workspaces/:wid/shortener` | member | `{ available, shortener }`: whether this server has Bitly's keys, and the connection (account name, domain, `autoShorten`, who connected it) or null |
| POST | `/api/v1/workspaces/:wid/shortener/connect/:provider` | `accounts:connect` | Start connecting (`provider`: `bitly`): returns `{ authUrl }`; connecting again replaces the token |
| GET | `/api/oauth/bitly/callback` | (state) | OAuth redirect (the same `/api/oauth/:provider/callback` router as social logins hands `bitly` to this module). Sends the browser to `/w/:slug/accounts/shortener` with `?result=connected` (or `reconnected`), or `?error=` one of `ACCESS_DENIED`, `OAUTH_STATE_INVALID`, `NETWORK_NOT_ENABLED`, `NETWORK_ERROR` |
| PATCH | `/api/v1/workspaces/:wid/shortener` | `accounts:manage` | `{ autoShorten }`: shorten links at publish time on or off. A setting of the connection, not of the workspace: it means nothing without one |
| DELETE | `/api/v1/workspaces/:wid/shortener` | `accounts:manage` | Disconnect; links already shortened keep working |
| POST | `/api/v1/workspaces/:wid/shortlinks` | `posts:create` | `{ url }` (http or https) → `ShortLink`. The same address gives the same short link |

## Errors (API)
| Code | Status | When |
| --- | --- | --- |
| `SHORTENER_NOT_AVAILABLE` | 404 | Connecting when the server has no keys for the shortener |
| `SHORTENER_NOT_CONNECTED` | 409 | Shortening, or changing settings, with no shortener connected |
| `SHORTENER_REAUTH_REQUIRED` | 409 | The shortener refused the connection's token: connect it again |
| `SHORTENER_FAILED` | 502 | The shortener failed or didn't answer; the link stays as it is |

## Rules
- Auto-shorten happens at publish time per target, so each network's post gets its own link (6.1 click analytics can then separate them).
- If Bitly fails, publish with the original URL and record a warning; never fail the post because of the shortener.
- X charges more for posts with links; the composer shows this for X targets.
- Later (parked): UTM parameters and click analytics.
