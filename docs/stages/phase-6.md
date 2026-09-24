# Phase 6 · Release 6.1 (5 weeks)

**Goal:** complete 5.0 parity: analytics, reports, discovery, feeds and boards, plus SSO, Threads (tentative) and admin growth dashboards.

**Modules:** [feeds](../backend/modules/feeds.md), [analytics](../backend/modules/analytics.md), [reports](../backend/modules/reports.md), [discovery](../backend/modules/discovery.md), [providers](../backend/modules/providers.md) (metrics + Threads), [auth](../backend/modules/auth.md) (SSO), [admin](../backend/modules/admin.md) (growth) · **Areas:** [analytics-reports](../frontend/areas/analytics-reports.md), [discovery](../frontend/areas/discovery.md), [admin-console](../frontend/areas/admin-console.md) (growth)

## Contracts
- [ ] P6-C1 Analytics, reports, discovery, feeds, SSO schemas

## Backend
- [ ] P6-B1 Prisma: AccountMetricSnapshot, PostMetricSnapshot, ReportSchedule, ReportRun, RssFeed, RssItem, Board
- [ ] P6-B2 `fetchAccountMetrics` / `fetchPostMetrics` for each adapter; normalized metric names
- [ ] P6-B3 `metrics-sync` + `post-metrics` jobs (respecting rate limits and X read costs)
- [ ] P6-B4 Analytics endpoints (overview, account, posts)
- [ ] P6-B5 Reports: schedules, one-off generation, Playwright PDF rendering, CSV, email delivery, white-label
- [ ] P6-B6 Discovery: ContentSource adapters (Giphy, Pixabay, Flickr, Imgur, NewsAPI, Dailymotion), search + import, RSS fetch job, boards
- [ ] P6-B7 [feeds](../backend/modules/feeds.md) module: `fetchFeed` per adapter, FeedItem/FeedComment, `feed-sync` job, endpoints
- [ ] P6-B8 SAML/OIDC SSO (Better Auth SSO plugin)
- [ ] P6-B9 Threads adapter (tentative)
- [ ] P6-B10 Admin growth metrics (nightly precompute)
- [ ] P6-B11 Email template: report ready; SsoProvider table

## Frontend
- [ ] P6-F1 Analytics overview, account and post performance pages (Recharts)
- [ ] P6-F2 Reports: schedule editor, runs list, report render page
- [ ] P6-F3 Discovery search, RSS feeds, boards; "Use in post"
- [ ] P6-F4 SSO settings + SSO sign-in
- [ ] P6-F5 Threads preview + options (if adapter ships)
- [ ] P6-F6 Admin growth charts
- [ ] P6-F7 Account feed screen (`/w/:slug/accounts/:accountId/feed`)
- [ ] P6-F8 Design system additions: chart wrappers, DateRangePicker, MetricDelta

## Quality
- [ ] P6-Q1 E2E: metrics appear after sync; weekly report PDF generated and emailed; discovery item used in a post
- [ ] P6-Q2 SSO sign-in with a test SAML and OIDC provider

## Done when
Every connected account shows 30 days of metrics, a weekly PDF report arrives by email, users can find content in discovery and turn it into a post, and SSO sign-in works. `v6.1.0` is tagged.
