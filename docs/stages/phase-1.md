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
- [x] P1-B4 Instagram adapter (FB Login + Instagram Login): container flow, carousel, reels; validate aspect ratios
- [x] P1-B5 Connect flow endpoints + OAuth callback + asset save; token encryption; `GET /networks`; **multi-account**: SocialConnection (login) + SocialAccount (asset), any number of logins per network, duplicate-login detection, force account selection where supported
- [x] P1-B6 Posts CRUD, `validate`, `resolveContent`, status derivation; add sample draft and scheduled posts to `pnpm db:seed`
- [x] P1-B7 Publishing worker: `publish` + `media-prepare` processors (media-prepare runs inline in `publish` for now; a queue of its own when video transcoding arrives), error classification, retries, attempts, idempotency
- [x] P1-B8 Media public URLs on `media.<domain>` for networks to fetch
- [x] P1-B9 Contract tests for both Meta adapters
- [x] P1-B10 `media-purge` nightly job (soft-deleted assets after 7 days, and uploads left in `uploading` over a day: abort multipart, delete rows); media `prepareVariant` (resize/transcode with sharp + ffmpeg)
- [x] P1-B11 Post labels (`PostLabel` + endpoints)

## Frontend
- [x] P1-F1 Accounts page grouped by network → login → accounts, "Connect another account" per network with switch-account tip, network chooser, asset picker, account and login details (reconnect, disconnect, remove login)
- [x] P1-F2 Composer: account picker, editor with per-network counters, media strip + picker, per-network tabs/overrides
- [x] P1-F3 **Live preview** framework + Facebook and Instagram preview components
- [x] P1-F4 Validation: client quick checks + debounced server validation; issues panel
- [x] P1-F5 Save draft, Publish now, autosave
- [x] P1-F6 Posts list + post detail with targets and publishing history; retry failed target
- [x] P1-F7 Onboarding steps 2 (connect account) and 3 (first post)
- [x] P1-F8 Labels: picker in composer, filter + label management in posts list
- [x] P1-F9 Design system additions: AccountPicker, NetworkIcon, StatusChip, MediaThumb, CharacterCounter, IssueList, PreviewFrame

## Reviews
- [ ] P1-R1 Record Meta screencasts on staging for each requested permission; submit App Review

## Quality
- [x] P1-Q1 E2E (against Meta test users): connect Page → compose with image → preview matches → publish → permalink shown (`apps/web/e2e/phase-1/meta-publish.spec.ts`, `pnpm --filter @socioboard/web e2e:meta`: real accounts named in `E2E_META_PAGE` / `E2E_META_INSTAGRAM`, a Facebook session saved once by `e2e:meta:login`; Meta no longer lets test users own Pages, so it uses the team's test Page and Instagram account. It connects in onboarding step 2, publishes an image post through S3, checks both links, then deletes the Facebook copy with `pnpm --filter @socioboard/api delete-network-post`; Instagram has no delete API, so its copy stays)
- [x] P1-Q2 Failure drills: expired token, content rejected, network timeout; each shows the right message (`packages/core/src/modules/publishing/__tests__/meta-drills.int.test.ts`: the real Facebook Page adapter, Graph client, publish job, Postgres and API against Meta's real error answers (190/463 expired session, 368 refused with its message for people, a timeout, a 503 then recovery, 4 rate limit, retry after reconnecting); the post page's wording for each kind is tested in `apps/web/src/features/posts`)
- [x] P1-Q3 Multi-account: connect two different Facebook logins with Pages each, publish one post to Pages from both logins; reconnect one login without affecting the other (`apps/web/e2e/phase-1/meta-two-logins.spec.ts`, in `e2e:meta`: switches the browser's Facebook session between two saved accounts, connects the second through "Connect another Facebook account" and its tip, publishes to both Pages, reconnects the first login, then publishes again through the second; every Facebook post is deleted after)

## Done when
A user connects a Facebook Page and Instagram account, sees accurate previews while writing, publishes an image post to both, and gets a readable error and retry option when publishing fails. Meta App Review is submitted.
