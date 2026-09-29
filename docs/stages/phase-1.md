# Phase 1 · Publish core (4 weeks)

**Goal:** connect a Facebook Page and an Instagram account, write a post with live preview and validation, and publish it now, with clear errors when something fails.

**Modules:** [providers](../backend/modules/providers.md) (interface + Meta), [social-accounts](../backend/modules/social-accounts.md), [posts](../backend/modules/posts.md), [publishing](../backend/modules/publishing.md), [media](../backend/modules/media.md) (public URLs, prepare) · **Areas:** [accounts](../frontend/areas/accounts.md), [composer](../frontend/areas/composer.md), [posts](../frontend/areas/posts.md), onboarding steps 2–3

## Contracts
- [x] P1-C1 Networks (capabilities, rules, preview spec), accounts, connect flow
- [x] P1-C2 Posts, targets, overrides, validation issues, publish-now, attempts

## Backend
- [x] P1-B1 Prisma: SocialConnection, SocialAccount, SocialAccountGroup(+Item), OAuthState, Post, PostTarget, PublishAttempt
- [x] P1-B2 `packages/providers`: types, errors, registry, shared HTTP client, fixtures setup
- [x] P1-B3 Facebook Page adapter: auth, listAssets, validate, publish (text, link, photo, video), preview spec
- [ ] P1-B4 Instagram adapter (FB Login + Instagram Login): container flow, carousel, reels; validate aspect ratios
- [ ] P1-B5 Connect flow endpoints + OAuth callback + asset save; token encryption; `GET /networks`; **multi-account**: SocialConnection (login) + SocialAccount (asset), any number of logins per network, duplicate-login detection, force account selection where supported
- [ ] P1-B6 Posts CRUD, `validate`, `resolveContent`, status derivation; add sample draft and scheduled posts to `pnpm db:seed`
- [ ] P1-B7 Publishing worker: `publish` + `media-prepare` processors, error classification, retries, attempts, idempotency
- [ ] P1-B8 Media public URLs on `media.<domain>` for networks to fetch
- [ ] P1-B9 Contract tests for both Meta adapters
- [ ] P1-B10 `media-purge` nightly job (soft-deleted assets after 7 days, and uploads left in `uploading` over a day: abort multipart, delete rows); media `prepareVariant` (resize/transcode with sharp + ffmpeg)
- [ ] P1-B11 Post labels (`PostLabel` + endpoints)

## Frontend
- [ ] P1-F1 Accounts page grouped by network → login → accounts, "Connect another account" per network with switch-account tip, network chooser, asset picker, account and login details (reconnect, disconnect, remove login)
- [ ] P1-F2 Composer: account picker, editor with per-network counters, media strip + picker, per-network tabs/overrides
- [ ] P1-F3 **Live preview** framework + Facebook and Instagram preview components
- [ ] P1-F4 Validation: client quick checks + debounced server validation; issues panel
- [ ] P1-F5 Save draft, Publish now, autosave
- [ ] P1-F6 Posts list + post detail with targets and publishing history; retry failed target
- [ ] P1-F7 Onboarding steps 2 (connect account) and 3 (first post)
- [ ] P1-F8 Labels: picker in composer, filter + label management in posts list
- [ ] P1-F9 Design system additions: AccountPicker, NetworkIcon, StatusChip, MediaThumb, CharacterCounter, IssueList, PreviewFrame

## Reviews
- [ ] P1-R1 Record Meta screencasts on staging for each requested permission; submit App Review

## Quality
- [ ] P1-Q1 E2E (against Meta test users): connect Page → compose with image → preview matches → publish → permalink shown
- [ ] P1-Q2 Failure drills: expired token, content rejected, network timeout; each shows the right message
- [ ] P1-Q3 Multi-account: connect two different Facebook logins with Pages each, publish one post to Pages from both logins; reconnect one login without affecting the other

## Done when
A user connects a Facebook Page and Instagram account, sees accurate previews while writing, publishes an image post to both, and gets a readable error and retry option when publishing fails. Meta App Review is submitted.
