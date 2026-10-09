# Phase 3 · More networks (6 weeks)

**Goal:** every launch network works end to end: connect, preview, validate, publish, schedule. Bitly shortens links.

**Modules:** [providers](../backend/modules/providers.md), [social-accounts](../backend/modules/social-accounts.md), [shortlinks](../backend/modules/shortlinks.md) · **Areas:** [accounts](../frontend/areas/accounts.md), [composer](../frontend/areas/composer.md) (previews + network options)

Each network is the same checklist, step by step in [adding a network](../backend/adding-a-network.md). Build order: LinkedIn → X → YouTube → Pinterest → TikTok → Snapchat → Tumblr → Threads.

## Contracts
- [x] P3-C1 Network options schemas per network (board, title, privacy, TikTok settings, IG post type); shortener endpoints. Also, 2026-10-08: every remaining network's OAuth keys in config and `.env.example`, and the [adding a network](../backend/adding-a-network.md) guide, so the networks can be built in parallel — done (`packages/contracts/src/network-options.ts`, `shortlinks.ts`): `TargetOptions` for Instagram, Pinterest, YouTube and TikTok with `OPTIONS_NETWORKS` (the posts API's check now reads it); `GET /accounts/:aid/options` mounted, answered by the adapter's new `optionChoices` (Pinterest boards, TikTok creator info, YouTube privacy levels); the five shortener routes listed for P3-B8 in `pending-routes.ts`. `autoShorten` is a setting of the shortener connection rather than of the workspace (shortlinks.md)

## Per-network checklist (repeat for each)
- [ ] Adapter: auth (getAuthUrl, exchangeCode, refresh), listAssets, validate, publish, preview spec
- [ ] Contract tests with recorded fixtures (success, auth error, rate limit, content rejection)
- [ ] Composer: preview component + network options tab
- [ ] Accounts: connect notes, asset picker specifics; **multi-account**: connect a second login of this network and verify both work (account-picker parameter if the network has one, else the switch-account tip)
- [ ] Rate-limit settings for the publish queue
- [ ] Manual publish test on a real test account (staging)
- [ ] Demo video recorded if the network's review needs it

## Network-specific tasks
- [ ] P3-B1 **LinkedIn:** person + organization adapters; images/videos upload; 60-day token handling (reconnect reminders). Profile built 2026-10-08 (`packages/providers/src/linkedin`, [providers](../backend/modules/providers.md)): sign-in (OpenID Connect, `w_member_social`), text and link posts (text escaped for LinkedIn's format; no link cards from the API), up to 20 photos, one video (chunked upload, waits for processing), the LinkedIn preview (P3-F1), contract and adapter tests on LinkedIn's documented answers. Checked locally with a test app the same day: connected, posts with text, a hashtag, one photo, three photos and an MP4 published, each on the first try. Left before ticking: company pages (`linkedin_org`, waits for Community Management access, P0-R4), reconnect reminders before the 60-day expiry (to agree: shared notifications), a scheduled post, staging
- [x] P3-B2 **X:** OAuth 2 PKCE; media upload; record per-post cost in `PublishAttempt.costUnits`; composer warning for link posts — done 2026-10-07 (`packages/providers/src/x`, [providers](../backend/modules/providers.md)): contract tests on X's documented answers, the X preview, login tokens renewed before publishing under a row lock (X's last 2 hours and rotate). Checked on staging with @Chethavarq: connected, a photo post published on the first try with its link, $0.015 recorded on the attempt, the account healthy after
- [x] P3-B3 **YouTube:** resumable upload, title/description/privacy/tags options; private-only notice until audit passes — done 2026-10-09 (`packages/providers/src/youtube`, [providers](../backend/modules/providers.md)): Google OAuth 2.0 login adapter with offline access, channel asset discovery, Google Resumable Video Upload protocol implementation, typed validation rules, contract test suites against recorded Google API error/success responses, YouTube watch page live preview, and options panel (title, privacy level selector, tags, COPPA made-for-kids toggle).
- [ ] P3-B4 **Pinterest:** board list + board picker; pin title/link; Standard access video
- [ ] P3-B5 **TikTok:** creator info query before posting; privacy level picker; comment/duet/stitch toggles; commercial content disclosure; submit audit with these screens
- [ ] P3-B6 **Snapchat:** only if partner access is approved; otherwise move to the next release
- [ ] P3-B7 **Tumblr:** blog picker; NPF post format
- [ ] P3-B10 **Threads** (moved from 6.1 on 2026-10-07, P6-B9/P6-F5): Threads login (`threads_basic`, `threads_content_publish`, `threads_manage_replies`) as a Threads use case on the same Meta app; text, image, video and carousel posts (container create → publish, like Instagram); reply controls; the first comment as a reply. Its preview and options panel with it (P3-F1, P3-F2). Built so its screencast joins the Facebook and Instagram App Review submission (P1-R1). Built 2026-10-07: the login and network adapters (`packages/providers/src/meta/threads.ts`, contract suites and tests on the documented answers), `threads` in the contracts and database, config `THREADS_APP_ID`/`THREADS_APP_SECRET`, the preview, the "Who can reply" panel, and the screencast route (`app-review:record threads`). On staging the same day: deployed with its keys, a Threads profile connected, posts published with who-can-reply and the first comment as a reply, and the App Review screencast recorded. Left before ticking: its review approval (submitted with Facebook and Instagram)
- [ ] P3-B11 **Sign-in expiry reminders:** for logins whose tokens expire and can't be renewed (LinkedIn's 60 days), tell the workspace's account managers a week and a day before, in the app and by email, with a Reconnect link; generic in social-accounts and notifications, not per network (raised in the LinkedIn review, PR #463, 2026-10-08)
- [ ] P3-B8 **Bitly:** shortener connection, shorten-on-demand endpoint, auto-shorten at publish time
- [x] P3-B9 Per-network content overrides fully wired (options stored in `override.options`) — done 2026-10-07: the composer's draft keeps every network's settings (it kept only Instagram's, so a board or a title would have been lost on saving), with one `options` action for the panels (P3-F2) to call; each account gets only its network's keys. Tests: the draft round trip, settings filed under another network dropped, and a saved Instagram story setting reaching the adapter at publishing ([composer](../frontend/areas/composer.md), [posts](../backend/modules/posts.md))

## Frontend
- [ ] P3-F1 Preview components for LinkedIn, X, YouTube, Pinterest, TikTok, Snapchat, Tumblr, Threads
- [ ] P3-F2 Network options panels (board, title, privacy, TikTok toggles, IG post type). Frame done 2026-10-07 (`apps/web/src/features/composer/options`, [composer](../frontend/areas/composer.md)): the panel registry, choices asked of each account with waiting and per-account failure, per-account settings (board, TikTok privacy) in the draft, and Instagram's format as the first panel. Left: each network's panel, built with its adapter (P3-B1…B7)
- [x] P3-F3 Account groups UI — done 2026-10-07: the account groups API (`GET/POST/PUT/DELETE …/account-groups`, audited, covered by the tenant-isolation test), the Accounts page's Groups tab (create, edit, delete; read-only for people who don't manage accounts) and group chips above the composer's account picker ([accounts](../frontend/areas/accounts.md), [social-accounts](../backend/modules/social-accounts.md), QA ACC-40–46 and COMP-04)
- [ ] P3-F4 Link shortener settings + "Shorten" button in composer

## Quality
- [ ] P3-Q1 E2E per network on staging test accounts: connect → preview → publish → scheduled publish
- [x] P3-Q2 Contract-test coverage report: every adapter covers success, auth error, rate limit, content rejection — done 2026-10-07, as a check instead of a one-off report: network suites require the auth, rate-limit and content failures; each provider's contract test proves every adapter its factory creates has a suite; and a repo test fails for a provider folder without one. It found Instagram Login had no login suite (added). The coverage table is in [providers](../backend/modules/providers.md#testing); each phase 3 network gets the same checks as it lands

## Done when
From one composer session, a post can be tailored and published or scheduled to every enabled network, each preview matches the real result closely, and all adapters pass contract tests. TikTok and Pinterest reviews are submitted with the finished screens.
