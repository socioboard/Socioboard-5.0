# Module: discovery

**Phase:** 6.1 · **Path:** `packages/core/src/modules/discovery` · **Depends on:** media (import), platform (config, queue)

## Purpose
Finding content to share: search stock and news sources (Giphy, Pixabay, Flickr, Imgur, NewsAPI, Dailymotion), follow RSS feeds, and keep keyword/RSS boards. Items can be imported into the media library or used to start a post. Covers 5.0's Content Studio, Discovery, RSS and Boards.

## Content source interface
```ts
interface ContentSource {
  id: 'giphy' | 'pixabay' | 'flickr' | 'imgur' | 'newsapi' | 'dailymotion' | 'rss';
  kind: 'image' | 'gif' | 'video' | 'article';
  search(query: string, page: number): Promise<SourceItem[]>;   // title, url, thumbnail, author, license
}
```
Sources register only if their API keys are set. Each item keeps its license and attribution.

## Data
| Table | Key fields | Notes |
| --- | --- | --- |
| `RssFeed` | id, workspaceId, url, title, lastFetchedAt, etag | |
| `RssItem` | id, feedId, guid, title, link, summary, imageUrl, publishedAt | Kept 60 days |
| `Board` | id, workspaceId, name, type (keyword/rss), keywords[], feedIds[] | |

## API
| Method | Path | Permission | Description |
| --- | --- | --- | --- |
| GET | `/api/v1/discovery/sources` | signed in | Enabled sources |
| GET | `/api/v1/workspaces/:wid/discovery/search?source=&q=&page=` | `posts:create` | Search a source |
| POST | `/api/v1/workspaces/:wid/discovery/import` | `media:upload` | Import an item into the media library |
| CRUD | `/api/v1/workspaces/:wid/rss-feeds` | `posts:create` | RSS feeds |
| GET | `/api/v1/workspaces/:wid/rss-feeds/:fid/items` | `posts:read` | Feed items |
| CRUD | `/api/v1/workspaces/:wid/boards` | `posts:create` | Boards and their items |

## Jobs
- `rss-fetch` (every 30 minutes per feed, conditional GET with ETag).

## Rules
- Check each source's terms before launch: NewsAPI's free plan doesn't allow production use.
- Search results are cached for 10 minutes to protect API quotas.
- Parked for later: competitor tracking, hashtag groups.
