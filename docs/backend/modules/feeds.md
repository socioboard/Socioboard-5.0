# Module: feeds

**Phase:** 6.1 · **Path:** `packages/core/src/modules/feeds` · **Depends on:** providers (`fetchFeed`), social-accounts, posts, workspaces

## Purpose
Replaces 5.0's per-network feeds: for each connected account, show the posts published on that account (including ones not made through Socioboard) and their comments, where the network's API allows it. Read-only in 6.1; replying to comments is part of the parked unified inbox.

## Data
| Table | Key fields | Notes |
| --- | --- | --- |
| `FeedItem` | id, socialAccountId, externalId, text, mediaUrls[], permalink, publishedAt, likeCount, commentCount, postTargetId?, fetchedAt | Cache; refreshed on view and every 6 h |
| `FeedComment` | id, feedItemId, externalId, authorName, authorAvatar, text, createdAt | Latest 50 per item |

## API
| Method | Path | Permission | Description |
| --- | --- | --- | --- |
| GET | `/api/v1/workspaces/:wid/accounts/:aid/feed?cursor=` | `posts:read` + account access | Account's recent posts |
| GET | `/api/v1/workspaces/:wid/accounts/:aid/feed/:itemId/comments` | `posts:read` + account access | Comments on one item |
| POST | `/api/v1/workspaces/:wid/accounts/:aid/feed/refresh` | `posts:read` | Refresh now (rate-limited) |

## Jobs
- `feed-sync` (every 6 h per active account; skipped for networks where reads cost money unless the feed was viewed in the last day).

## Rules
- Network support varies: Facebook Pages, Instagram, LinkedIn orgs, YouTube, Pinterest, Tumblr support reading; X reads are paid and limited; TikTok/Snapchat may be limited. Adapters without `fetchFeed` show "Feed not available for this network".
- Items made through Socioboard link back to their Post.
