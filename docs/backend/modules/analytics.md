# Module: analytics

**Phase:** 6.1 · **Path:** `packages/core/src/modules/analytics` · **Depends on:** providers (`fetchAccountMetrics`, `fetchPostMetrics`), social-accounts, posts, billing (history limit, optional)

## Purpose
Performance data: account growth (followers, reach, impressions) and per-post engagement, collected daily and shown in dashboards. Also feeds reports.

## Data
| Table | Key fields | Notes |
| --- | --- | --- |
| `AccountMetricSnapshot` | socialAccountId, date, followers, impressions, reach, engagements, extra JSON | One row per account per day |
| `PostMetricSnapshot` | postTargetId, capturedAt, impressions, reach, likes, comments, shares, saves, clicks, videoViews, extra JSON | Captured at 1h, 24h, 7d, 30d after publish |

Metric names are normalized across networks; network-specific extras go in `extra`. If volume grows large, these tables can move to TimescaleDB (a Postgres extension).

## API
| Method | Path | Permission | Description |
| --- | --- | --- | --- |
| GET | `/api/v1/workspaces/:wid/analytics/overview?from=&to=&accounts=` | `analytics:read` | Totals and trends across accounts |
| GET | `/api/v1/workspaces/:wid/analytics/accounts/:aid?from=&to=` | `analytics:read` | One account's time series |
| GET | `/api/v1/workspaces/:wid/analytics/posts?from=&to=&sort=` | `analytics:read` | Top posts by engagement |
| GET | `/api/v1/workspaces/:wid/analytics/posts/:pid` | `analytics:read` | One post's metrics per target |

## Jobs
- `metrics-sync` (daily per account, spread across the day): account metrics for yesterday.
- `post-metrics` (delayed jobs at 1h/24h/7d/30d after publish).

## Rules
- Respect each network's rate limits; skip accounts in `reauth_required`.
- History shown is capped by `analyticsHistoryDays` when billing is on.
- X reads cost money; X metrics are fetched only at 24h and 7d.
