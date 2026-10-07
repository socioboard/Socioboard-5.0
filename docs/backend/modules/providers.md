# Module: providers

**Phase:** 1 (Meta: Facebook Pages + Instagram), 3 (LinkedIn, X, YouTube, Pinterest, TikTok, Snapchat, Tumblr, Bitly) · **Path:** `packages/providers` · **Depends on:** platform (config, http client, logger) only

## Purpose
The only code that talks to social network APIs. Other modules ask the registry for an adapter and never call a network directly.

## Logins and networks
Signing in and posting are separate, because one login can reach several networks: a Facebook login reaches the person's Pages **and** the Instagram accounts linked to those Pages.

- A **login provider** (`LoginProvider`: `facebook`, `instagram`, `linkedin`, `x`, `youtube`, `pinterest`, `tiktok`, `snapchat`, `tumblr`) is one OAuth app, with one callback URL `/api/oauth/<provider>/callback` ([developer apps](../../developer-apps.md)). It signs in, identifies the person and lists what they can post to.
- A **network** (`NetworkId`: `facebook_page`, `instagram`, `linkedin_person`, `linkedin_org`, `x`, `youtube`, `pinterest`, `tiktok`, `snapchat`, `tumblr`) is a kind of postable asset. It has the content rules, the preview spec, validation and publishing.

Each network lists the logins that reach it (`Network.logins` in the contracts): Instagram accounts connect through `facebook` (accounts linked to a Page) or `instagram` (Instagram Login, no Page needed). Most networks have exactly one login provider.

## Interface
```ts
interface LoginAdapter {
  id: LoginProvider;
  networks: NetworkId[];               // what its assets can be: facebook → facebook_page, instagram
  supportsAccountSelection: boolean;   // can the network show an account picker?
  getAuthUrl(input: { state: string; redirectUri: string; pkce?: Pkce; forceAccountSelection?: boolean }): string;
  exchangeCode(input: { code: string; redirectUri: string; pkce?: Pkce }): Promise<TokenSet>;
  refresh?(tokens: TokenSet): Promise<TokenSet>;                   // or re-exchange for long-lived tokens
  getIdentity(tokens: TokenSet): Promise<LoginIdentity>;           // externalUserId + name + avatar of the login
  listAssets(tokens: TokenSet): Promise<ConnectableAsset[]>;       // Pages, IG accounts, orgs, channels, boards… with per-asset tokens where the network issues them
}

interface NetworkAdapter {
  id: NetworkId;
  displayName: string;
  capabilities: NetworkCapabilities;   // postTypes (text, link, image, carousel, video, reel, story), firstComment, altText
  rules: ContentRules;                 // maxChars, hashtags/mentions, media count/kinds/sizes, aspect ratios, video length, link handling
  preview: PreviewSpec;                // layout hints for the frontend live preview (text cut: truncateAt characters, truncateLines lines; caption position; media layout; crop; link card)
  rateLimits: RateLimits;              // perAccount / perApp moving windows ({ max, perSec }), enforced by the publish worker
  validate(input: PublishInput): ValidationIssue[];                          // pure, used by composer + API
  publish(input: PublishInput, account: AccountCredentials): Promise<PublishResult>;   // externalId, permalink
  deletePost?(externalId: string, account: AccountCredentials): Promise<void>;
  optionChoices?(account: AccountCredentials): Promise<AccountOptionChoices>;   // P3-C1: boards, TikTok creator info, YouTube privacy levels
  fetchAccountMetrics?(account: AccountCredentials, range: DateRange): Promise<AccountMetrics>;   // 6.1
  fetchPostMetrics?(externalIds: string[], account: AccountCredentials): Promise<PostMetrics[]>;   // 6.1
  fetchFeed?(account: AccountCredentials, cursor?: string): Promise<FeedPage>;                    // 6.1 (feeds module)
}
```
`AccountCredentials` is the asset's external id plus the token to use (the asset token where the network issues one, else the login's).

**Post options** (P3-C1, `packages/contracts/src/network-options.ts`): each network's settings live under its key in `override.options` (`TargetOptions`; `OPTIONS_NETWORKS` says which networks a key applies to). The contract only bounds stored values; the network's own rules (required board, title length, TikTok's branded-content-can't-be-private) are the adapter's `validate`, reported as issues with `field: 'options'`. A network whose options need something from the account (`AccountOptionChoices`: Pinterest, TikTok, YouTube) implements `optionChoices`; the API refuses to answer for one that doesn't.

**No network SDKs.** Adapters call each network's HTTP API directly through the shared client, not vendor SDKs (e.g. not `facebook-nodejs-business-sdk`, which targets the Marketing API and doesn't cover Instagram Login on graph.instagram.com). Reasons: a phase uses a handful of endpoints per network; the shared client gives every network the same timeouts, token-free logs, error classification and replayable tests; and the API version is one setting (`META_GRAPH_VERSION`) instead of an SDK upgrade. Revisit only for something an SDK does that we can't do simply (e.g. ads management, not in scope).

The shared HTTP client keeps integers too large for a JS number (Instagram's 17-digit ids, which some endpoints send as JSON numbers) as exact strings.

Errors thrown by adapters are always `ProviderError { kind: 'retryable' | 'auth' | 'content' | 'rate_limited', retryAfter?, networkCode, message, limitScope }`. `limitScope` says whose limit a `rate_limited` hit: `account` (default) or `app` (the whole OAuth app; Meta code 4), so the worker holds back the right posts.

## Layout
```
packages/providers/src/
├─ types.ts, errors.ts, registry.ts, http.ts (shared fetch with timeouts + logging)
├─ meta/        facebook-login.ts, instagram-login.ts, facebook-page.ts, instagram.ts, graph-client.ts
├─ linkedin/    person.ts, organization.ts
├─ x/  youtube/  pinterest/  tiktok/  snapchat/  tumblr/
├─ utilities/   bitly.ts (shortener, not a SocialProvider)
└─ __fixtures__/ recorded HTTP responses per network
```

## API
None of its own. Rules and preview specs are exposed through `social-accounts` and `posts`:
- `GET /api/v1/networks`: enabled networks with capabilities, rules and preview spec (used by the composer).

## Multiple accounts per network
Every adapter must support any number of logins per workspace and any number of assets per login (see [social-accounts](social-accounts.md)). `getIdentity` lets us detect when a user connects the same login twice. Where the network has an account-picker or force-login parameter, `getAuthUrl` adds it when `forceAccountSelection` is set (Google/YouTube: `prompt=select_account`; others verified per adapter in phase 1/3).

## Registry
- `registry.login(provider)` and `registry.network(networkId)` return the adapter or throw `NETWORK_NOT_ENABLED`.
- A login registers only when its env keys are set (`META_APP_ID` + `META_APP_SECRET` for `facebook`, `INSTAGRAM_APP_ID` + `INSTAGRAM_APP_SECRET` for `instagram`, …); a network is enabled when at least one of its logins is. Self-hosters see only what they configured.

## Per-network notes (build details)
| Network | Auth | Publish path | Notes |
| --- | --- | --- | --- |
| Facebook Page | Facebook Login for Business | `/{page}/feed` (text, link, several photos via `attached_media`), `/photos` (photos uploaded as `source` bytes), graph-video `/videos` (chunked upload: start → transfer → finish; an answer that doesn't move the offset forward stops the upload as `retryable`) | Page tokens from `listAssets` (don't expire); first comment needs `pages_manage_engagement` and `pages_read_user_content` (#200 without the second); videos need only `pages_manage_posts` (the old `publish_video` isn't offered to use-case apps) |
| Instagram | FB Login (linked to a Page; graph.facebook.com, Page token) or Instagram Login (graph.instagram.com, login token) | container create → poll `status_code` until FINISHED (up to 10 min, then retried) → `media_publish` | Images fetched from the public media address (JPEG; no upload exists); videos of Page-linked accounts uploaded to `rupload.facebook.com` (Facebook Login only), Instagram Login videos fetched; single videos are reels; carousel = up to 10 child containers; stories drop caption and comment; 100 API posts per account per 24 h |
| LinkedIn person/org | OAuth 2 | Posts API + Images/Videos API | Org needs Community Management access |
| X | OAuth 2.0 with PKCE (`x.com/i/oauth2/authorize`, S256; a confidential client, so the token endpoint gets HTTP Basic with the client id and secret). Scopes `tweet.read tweet.write users.read media.write offline.access`. Access tokens last 2 hours and every refresh hands out a new refresh token (the old one stops working): renewed before publishing under a row lock ([social-accounts](social-accounts.md#jobs)). No account picker: a second account means signing out of X first | `POST /2/tweets` (`text`, `media.media_ids`). Photos: `POST /2/media/upload` (multipart, `tweet_image`, 5 MB, fitted by `imagePrep`). Videos and GIFs: `initialize` (JSON) → `append` in 4 MB chunks read from storage by byte range → `finalize` → `STATUS` until `succeeded` (10 minutes, then retried). Delete: `DELETE /2/tweets/:id` | `packages/providers/src/x` (P3-B2). Up to 4 photos, or one GIF or video. Length is X's weighted count (`xTextLength`: links 23, CJK and emoji 2) of what's sent: the post's link is added after the text unless it's in it. A link post warns `X_LINK_COST`; each attempt records its cost in `PublishAttempt.costUnits` (US dollars: 0.015, or 0.20 with a link; X's price list, checked 2026-10-06). 402 (credits used up) holds back every account on the app for an hour; 429 waits until `x-rate-limit-reset`; a duplicate post (403) is a content error. Limits: 100 posts per 15 minutes and 2,400 a day per account |
| YouTube | Google OAuth | resumable `videos.insert` | Private-only until audit passes |
| Pinterest | OAuth 2 | `POST /v5/pins` | Needs board id; Standard access for write |
| TikTok | OAuth 2 (Login Kit) | Content Posting API, Direct Post | Must query creator info first; privacy level chosen by user |
| Snapchat | Snap OAuth | Public Profile API | Partner-gated; ships only if approved |
| Tumblr | OAuth 2 | `POST /v2/blog/{blog}/posts` (NPF) | |
| Threads | Threads login at threads.net (a Threads use case on the same Meta app, `THREADS_APP_ID`/`THREADS_APP_SECRET`; 60-day tokens, refreshed) | graph.threads.net/v1.0: `{user}/threads` container (TEXT with `link_attachment`, IMAGE, VIDEO, or CAROUSEL of 2–20) → poll `status` → `{user}/threads_publish`; `permalink` read back | 500 characters with emoji counted as UTF-8 bytes (`threadsTextLength`); `reply_control` from the post's options; the first comment is a reply (`reply_to_id`, `threads_manage_replies`); with media a link goes at the end of the text. Task P3-B10 |

## Testing
- **Contract tests** (`src/testing/contract.ts`): every login adapter and network adapter runs the same suites, whatever the network. Logins: a sign-in URL carrying state and callback, an identity, complete assets of their own networks, a refused token → `auth`. Networks: valid capabilities/rules/preview, pure validation, a publish returning an external id and link, and each recorded failure (auth, rate limit, content, server) mapped to its `ProviderError` kind. Meta's run in `src/meta/__tests__/contract.test.ts` (P1-B9); phase 3 adapters add theirs the same way.
- **Coverage is enforced** (P3-Q2), three ways, so a network can't land with a case missing:
  1. A network suite won't compile without recorded `auth`, `rate_limited` and `content` failures (`REQUIRED_FAILURES`); a temporary `retryable` failure is optional, since the shared HTTP client handles most of those for every network. The success case is the suite's publish.
  2. Each provider's contract test ends with `describeContractCoverage(provider, factory(...))`, built with every option configured: it fails if any login or network that factory creates has no suite.
  3. `src/__tests__/contract-coverage.test.ts` fails if a provider folder (`src/<provider>/`) has no `__tests__/contract.test.ts` ending in that check.
- **Coverage today:**

| Adapter | Kind | Success | Auth | Rate limit | Content | Temporary |
| --- | --- | --- | --- | --- | --- | --- |
| Facebook Login | login | identity, assets | refused token | — | — | — |
| Instagram Login | login | identity, asset | refused token | — | — | — |
| X login | login | identity, assets | refused token | — | — | — |
| Facebook Page | network | publish | expired token | Page limit | refused post | server error |
| Instagram | network | publish (container, poll, publish) | expired token | 24-hour publishing limit | refused post | server error |
| X | network | publish | expired token | 429 | duplicate post | server error |
- **Fixtures** (`__fixtures__/<network>/`): reads are recorded from the dev apps and sanitized (`recorded/`); publishing calls and errors that can't be caused on demand follow the network's documented shapes. See each network's fixtures README.
- Per-adapter tests cover the rest (uploads, carousels, polling, validation rules).
- Nightly smoke test against sandbox/test accounts (not blocking CI).
