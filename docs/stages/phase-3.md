# Phase 3 · More networks (6 weeks)

**Goal:** every launch network works end to end: connect, preview, validate, publish, schedule. Bitly shortens links.

**Modules:** [providers](../backend/modules/providers.md), [social-accounts](../backend/modules/social-accounts.md), [shortlinks](../backend/modules/shortlinks.md) · **Areas:** [accounts](../frontend/areas/accounts.md), [composer](../frontend/areas/composer.md) (previews + network options)

Each network is the same checklist. Build order: LinkedIn → X → YouTube → Pinterest → TikTok → Snapchat → Tumblr.

## Contracts
- [x] P3-C1 Network options schemas per network (board, title, privacy, TikTok settings, IG post type); shortener endpoints — done (`packages/contracts/src/network-options.ts`, `shortlinks.ts`): `TargetOptions` for Instagram, Pinterest, YouTube and TikTok with `OPTIONS_NETWORKS` (the posts API's check now reads it); `GET /accounts/:aid/options` mounted, answered by the adapter's new `optionChoices` (Pinterest boards, TikTok creator info, YouTube privacy levels); the five shortener routes listed for P3-B8 in `pending-routes.ts`. `autoShorten` is a setting of the shortener connection rather than of the workspace (shortlinks.md)

## Per-network checklist (repeat for each)
- [ ] Adapter: auth (getAuthUrl, exchangeCode, refresh), listAssets, validate, publish, preview spec
- [ ] Contract tests with recorded fixtures (success, auth error, rate limit, content rejection)
- [ ] Composer: preview component + network options tab
- [ ] Accounts: connect notes, asset picker specifics; **multi-account**: connect a second login of this network and verify both work (account-picker parameter if the network has one, else the switch-account tip)
- [ ] Rate-limit settings for the publish queue
- [ ] Manual publish test on a real test account (staging)
- [ ] Demo video recorded if the network's review needs it

## Network-specific tasks
- [ ] P3-B1 **LinkedIn:** person + organization adapters; images/videos upload; 60-day token handling (reconnect reminders)
- [x] P3-B2 **X:** OAuth 2 PKCE; media upload; record per-post cost in `PublishAttempt.costUnits`; composer warning for link posts — done 2026-10-07 (`packages/providers/src/x`, [providers](../backend/modules/providers.md)): contract tests on X's documented answers, the X preview, login tokens renewed before publishing under a row lock (X's last 2 hours and rotate). Checked on staging with @Chethavarq: connected, a photo post published on the first try with its link, $0.015 recorded on the attempt, the account healthy after
- [ ] P3-B3 **YouTube:** resumable upload, title/description/privacy/tags options; private-only notice until audit passes
- [ ] P3-B4 **Pinterest:** board list + board picker; pin title/link; Standard access video
- [ ] P3-B5 **TikTok:** creator info query before posting; privacy level picker; comment/duet/stitch toggles; commercial content disclosure; submit audit with these screens
- [ ] P3-B6 **Snapchat:** only if partner access is approved; otherwise move to the next release
- [ ] P3-B7 **Tumblr:** blog picker; NPF post format
- [ ] P3-B8 **Bitly:** shortener connection, shorten-on-demand endpoint, auto-shorten at publish time
- [x] P3-B9 Per-network content overrides fully wired (options stored in `override.options`) — done 2026-10-07: the composer's draft keeps every network's settings (it kept only Instagram's, so a board or a title would have been lost on saving), with one `options` action for the panels (P3-F2) to call; each account gets only its network's keys. Tests: the draft round trip, settings filed under another network dropped, and a saved Instagram story setting reaching the adapter at publishing ([composer](../frontend/areas/composer.md), [posts](../backend/modules/posts.md))

## Frontend
- [ ] P3-F1 Preview components for LinkedIn, X, YouTube, Pinterest, TikTok, Snapchat, Tumblr
- [ ] P3-F2 Network options panels (board, title, privacy, TikTok toggles, IG post type)
- [ ] P3-F3 Account groups UI
- [ ] P3-F4 Link shortener settings + "Shorten" button in composer

## Quality
- [ ] P3-Q1 E2E per network on staging test accounts: connect → preview → publish → scheduled publish
- [ ] P3-Q2 Contract-test coverage report: every adapter covers success, auth error, rate limit, content rejection

## Done when
From one composer session, a post can be tailored and published or scheduled to every enabled network, each preview matches the real result closely, and all adapters pass contract tests. TikTok and Pinterest reviews are submitted with the finished screens.
