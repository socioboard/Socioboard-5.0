# Area: discovery

**Phase:** 6.1 · **Folder:** `features/discovery` · **Backend:** [discovery](../../backend/modules/discovery.md), [media](../../backend/modules/media.md)

## Screens
| Route | Screen | Permission |
| --- | --- | --- |
| `/w/:slug/discovery` | Search across enabled sources (tabs: Images, GIFs, Videos, News); results grid with source + license | `posts:create` |
| `/w/:slug/discovery/feeds` | RSS feeds: add by URL, list items, "Create post from this" | `posts:create` |
| `/w/:slug/discovery/boards` | Keyword/RSS boards: saved searches showing new items | `posts:create` |

## API calls
`GET /discovery/sources`, `GET /discovery/search`, `POST /discovery/import`, RSS feeds and boards CRUD.

## Behavior
- "Save to library" imports into media; "Use in post" imports and opens the composer with it attached (articles pre-fill the link).
- Attribution/license shown on every item and kept on import.
- Sources without API keys don't appear.
