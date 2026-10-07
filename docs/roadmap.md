# Socioboard 6.0 — Roadmap

As of 2026-09-23 · Live doc: [Architecture & Roadmap](https://claude.ai/code/artifact/0d7f3bc1-1b63-43d4-ba00-774c77c511a4) · See also: [Architecture](architecture.md)

## Phases

Socioboard 6.0 launches publicly after phase 5, about 25 weeks in. Phase 6 then completes 5.0 parity as release 6.1. The phases are ordered so that one network works end to end early and the others follow the same pattern. Durations are indicative only (sized for 2–3 full-stack developers); team size and launch date are not fixed. We are creating new developer apps on every network, so app setup and reviews start in phase 0, because they take the longest.

| Phase | Scope | Exit criteria | Est. |
| --- | --- | --- | --- |
| 0. Foundation | Monorepo, CI, Docker Compose, Prisma schema v1, Better Auth + workspaces/invites, S3 uploads, design system (Graphite with glass, light and dark), i18n setup (English strings only). **Create new developer apps (Meta, LinkedIn, TikTok, X, Google/YouTube, Pinterest, Tumblr, Snapchat); publish privacy policy, terms and data-deletion pages; submit app reviews** | A user signs up, creates a workspace, invites a teammate and uploads media locally; all app reviews submitted | 3 wks |
| 1. Publish core | Provider interface, Facebook Pages + Instagram adapters, composer with live validation and per-network live preview, publish now, BullMQ publish queue, retries, post history | A post goes to an FB Page and IG from the UI, and failures show readable errors | 4 wks |
| 2. Scheduling | Scheduled + recurring posts, queue slots, calendar with drag-to-reschedule, reconciler, token refresh, notifications; admin console v1 (queues, publishing health) | Scheduled posts survive an api/worker/Valkey restart and publish on time; operators can see and retry failed posts | 4 wks |
| 3. More networks | LinkedIn (personal + org), X, YouTube, Pinterest, TikTok, Snapchat, Tumblr, Threads, Bitly; per-network content overrides | Every kept network passes its contract tests and a manual publish | 6 wks |
| 4. Teams & AI | Approval workflow, comments, tasks, per-member account access, AI Gateway (mock, then the real service), generation UI, AI results saved to the media library (built in phase 0), AI content labels | A Contributor generates an asset, submits it, an Editor approves, and it publishes | 4 wks |
| 5. Launch 6.0 | Stripe billing, entitlements, AI credit metering, admin console v2 (users and workspaces, billing, AI, controls, audit log), GDPR export/delete, self-host docs per network (incl. the AI service), security review, load test | Paid sign-up works end to end on staging; open-source release tagged; cloud goes live | 4 wks |
| 6. Release 6.1 | Metrics sync, dashboards, scheduled PDF/CSV reports, Discovery sources, RSS, boards, feeds, SSO, admin growth and usage dashboards | Account and post metrics for 30 days; a weekly report email arrives | 5 wks |

This totals about 30 weeks: roughly 25 to the 6.0 launch, then about 5 for 6.1. Phases 3–4 can overlap if there are more developers.

## Open questions

- [ ] Git repository: URL and access to be provided.
- [ ] AI service API spec: coming soon from the Python team, as an OpenAPI file in `socioboard/socioboard-ai` (repo to be created by the Python team). Until then we build against a mock of the expected contract.
- [ ] Cloud hosting provider: to be decided before launch (phase 5); not a blocker.

## Later (parked, not in the current plan)

Ideas reviewed on 2026-09-23 and deliberately deferred. Revisit when planning 6.1+.

- **5.0 features not yet planned:** competitor tracking, hashtag groups, saved caption and media templates.
- **Composer and publishing:** onboarding flow, image alt text, first comment, UTM tags and click tracking, bulk CSV scheduling, notification preferences and digests.
- **Integrations:** public API keys, outbound webhooks, Zapier/Make.
- **Operations:** backups and disaster recovery plan, alerting and a public status page, abuse prevention to protect our developer apps, self-host upgrade path, external security test, help center, product analytics.
- **Business decisions:** pricing and plans (needed before billing is built), 5.0 sunset plan, transactional email provider.

## Decisions log

| Decision | Choice |
| --- | --- |
| Project name / version | Socioboard 6.0, the official successor; Socioboard owns the brand and 5.0 code (repo folder `Socioboard-6.0`) |
| Delivery model | Single edition: one open-source codebase, run as our hosted cloud or self-hosted |
| License | MIT for the whole repo (AGPL-3.0-only from 2026-09-24, back to MIT on 2026-09-28); no paid or closed code. No CLA needed; a CONTRIBUTING guide with DCO sign-off before outside PRs are accepted |
| Repository | One public monorepo; billing activates only when Stripe keys are set. It lives in `socioboard/socioboard`, the renamed Socioboard-5.0 repo so its stars and forks carry over; 5.0, the 2026 prototype and socioboard-core stay on `archive/*` branches (decided by SG on 2026-09-28; progress in [repo migration](repo-migration.md)) |
| Architecture | Modular monolith: one Node.js + TypeScript codebase, api + worker processes; split modules out only if load demands |
| Frontend | React + Vite. Own design system, **Graphite with glass** (Aurora palette, light and dark), chosen on 2026-09-28 from five prototyped directions; components built shadcn-style on Radix with our own styling, not the stock shadcn look (no designer for now; details in [design system](frontend/design-system.md)) |
| Backend | Express 5 + Zod on Node 24 LTS + TypeScript (NestJS dropped: team doesn't know it); structure enforced by module convention and lint |
| Data | PostgreSQL 17+ + Prisma |
| Jobs | BullMQ on Valkey (Redis-compatible) |
| Media storage | Amazon S3 by default; MinIO when the user has no S3 account (decided 2026-09-24). Same S3 client for both. MinIO no longer publishes to Docker Hub, so its image comes from `quay.io/minio/minio` (pinned). Update 2026-09-30: MinIO's images are no longer publicly available (quay.io and Docker Hub refuse anonymous pulls), so the local S3 in dev and CI is RustFS 1.0 (Apache-2.0, built as a MinIO replacement); the same S3 client and settings apply. |
| Auth | Better Auth (organization, two-factor, magic-link, admin, stripe, sso plugins); re-confirmed over Clerk on 2026-09-24 to keep self-hosting free of third-party accounts. Payment admin (invoices, refunds, disputes) uses the Stripe dashboard plus the admin console |
| Billing | Stripe |
| AI | Python team's service, also open source, in its own repo `socioboard/socioboard-ai` (decided 2026-09-24); self-hosters run its Docker image with their own model keys. Its OpenAPI spec is the contract; our `apps/ai-mock` follows it |
| Post content | Users type and edit text freely; media is uploaded or AI-generated; AI output is editable |
| Networks | Everything 5.0 had that still works; dead APIs dropped |
| Developer apps | New apps created and reviewed on every network |
| Migration from 5.0 | None; fresh start |
| Launch scope | 6.0 after phase 5 (publishing, scheduling, networks, teams, AI, billing); analytics/discovery/reports in 6.1 |
| Agency features | Not now (no client approval links or multi-client switcher) |
| Hosting | Docker everywhere; cloud chosen later |
| Mobile | Responsive web only for now |
| Workspace chat | Not rebuilt; comment threads on posts cover collaboration |
| Unified inbox | Not in 6.0; candidate for 6.2 |
| Languages | English only at launch; all UI text goes through i18n (react-i18next) from day one |
| Newer networks | Threads moved into 6.0 (phase 3, P3-B10, decided 2026-10-07) so it joins the Meta App Review with Facebook and Instagram |
| Snapchat | In 6.0 (phase 3); Snap API access requested in phase 0 |
| Multiple accounts | Every network supports any number of connected logins per workspace (e.g. several Facebook users) and any number of Pages/channels per login |
| Live preview | Per-network live preview in the composer, in 6.0 (phase 1, extended per network in phase 3) |
| Team size and launch date | Not fixed; roadmap durations are indicative only |
| Domains | `app.socioboard.com` (API at `/api`), `media.socioboard.com`; staging at `app-dev.socioboard.ai` (one host, media under `/public-media/`; decided 2026-10-06); local dev via `*.dev.socioboard.com` tunnels |
| Recurring posts | A template post holds the content and rule; each occurrence becomes its own ordinary post (own targets, status, history, retry), created about a week ahead. Chosen over many targets per post so publishing, retry and history stay unchanged (decided 2026-09-30, P2-B4) |
| Admin console | Platform admin console in the app for monitoring and operations; support access is view-only |
| Tech lead | Chethan |
| Platform account owner | Chethan owns the Meta Business Manager and the LinkedIn, TikTok, X, Google, Pinterest, Tumblr and Snapchat developer accounts |
