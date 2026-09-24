# Module: shortlinks

**Phase:** 3 · **Path:** `packages/core/src/modules/shortlinks` · **Depends on:** providers (utilities/bitly), social-accounts (for the Bitly connection), posts

## Purpose
Shorten links in posts. Users connect their own Bitly account; the composer can shorten links on demand or automatically at publish time. Built behind a `LinkShortener` interface so other shorteners can be added.

## Data
| Table | Key fields | Notes |
| --- | --- | --- |
| `ShortenerConnection` | id, workspaceId, provider (bitly), tokenEnc, defaultDomain, groupGuid | One per workspace |
| `ShortLink` | id, workspaceId, longUrl, shortUrl, provider, postTargetId?, createdAt | Reused when the same URL is shortened again |

## API
| Method | Path | Permission | Description |
| --- | --- | --- | --- |
| POST | `/api/v1/workspaces/:wid/shortener/connect/bitly` | `accounts:connect` | Start Bitly OAuth |
| GET | `/api/oauth/bitly/callback` | (state) | OAuth redirect |
| DELETE | `/api/v1/workspaces/:wid/shortener` | `accounts:manage` | Disconnect |
| POST | `/api/v1/workspaces/:wid/shortlinks` | `posts:create` | Shorten a URL now |
| PATCH | `/api/v1/workspaces/:wid` (setting) | `workspace:update` | `autoShortenLinks` on/off |

## Rules
- Auto-shorten happens at publish time per target, so each network's post gets its own link (6.1 click analytics can then separate them).
- If Bitly fails, publish with the original URL and record a warning; never fail the post because of the shortener.
- X charges more for posts with links; the composer shows this for X targets.
- Later (parked): UTM parameters and click analytics.
