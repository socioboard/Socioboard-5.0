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
  preview: PreviewSpec;                // layout hints for the frontend live preview
  validate(input: PublishInput): ValidationIssue[];                          // pure, used by composer + API
  publish(input: PublishInput, account: AccountCredentials): Promise<PublishResult>;   // externalId, permalink
  deletePost?(externalId: string, account: AccountCredentials): Promise<void>;
  fetchAccountMetrics?(account: AccountCredentials, range: DateRange): Promise<AccountMetrics>;   // 6.1
  fetchPostMetrics?(externalIds: string[], account: AccountCredentials): Promise<PostMetrics[]>;   // 6.1
  fetchFeed?(account: AccountCredentials, cursor?: string): Promise<FeedPage>;                    // 6.1 (feeds module)
}
```
`AccountCredentials` is the asset's external id plus the token to use (the asset token where the network issues one, else the login's).

**No network SDKs.** Adapters call each network's HTTP API directly through the shared client, not vendor SDKs (e.g. not `facebook-nodejs-business-sdk`, which targets the Marketing API and doesn't cover Instagram Login on graph.instagram.com). Reasons: a phase uses a handful of endpoints per network; the shared client gives every network the same timeouts, token-free logs, error classification and replayable tests; and the API version is one setting (`META_GRAPH_VERSION`) instead of an SDK upgrade. Revisit only for something an SDK does that we can't do simply (e.g. ads management, not in scope).

The shared HTTP client keeps integers too large for a JS number (Instagram's 17-digit ids, which some endpoints send as JSON numbers) as exact strings.

Errors thrown by adapters are always `ProviderError { kind: 'retryable' | 'auth' | 'content' | 'rate_limited', retryAfter?, networkCode, message }`.

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
| Facebook Page | Facebook Login for Business | `/{page}/feed` (text, link, several photos via `attached_media`), `/photos` (one photo), graph-video `/videos` (`file_url`) | Page tokens from `listAssets` (don't expire); first comment needs `pages_manage_engagement`; videos need only `pages_manage_posts` (the old `publish_video` isn't offered to use-case apps) |
| Instagram | FB Login (linked to a Page; graph.facebook.com, Page token) or Instagram Login (graph.instagram.com, login token) | container create → poll `status_code` until FINISHED (up to 10 min, then retried) → `media_publish` | Media fetched from public URL (JPEG images); single videos are reels; carousel = up to 10 child containers; stories drop caption and comment; 100 API posts per account per 24 h |
| LinkedIn person/org | OAuth 2 | Posts API + Images/Videos API | Org needs Community Management access |
| X | OAuth 2 PKCE | `POST /2/tweets` + media upload | Pay-per-post; count cost per publish |
| YouTube | Google OAuth | resumable `videos.insert` | Private-only until audit passes |
| Pinterest | OAuth 2 | `POST /v5/pins` | Needs board id; Standard access for write |
| TikTok | OAuth 2 (Login Kit) | Content Posting API, Direct Post | Must query creator info first; privacy level chosen by user |
| Snapchat | Snap OAuth | Public Profile API | Partner-gated; ships only if approved |
| Tumblr | OAuth 2 | `POST /v2/blog/{blog}/posts` (NPF) | |
| Threads (6.1, tentative) | Threads OAuth (same Meta developer account) | container create → publish | Task P6-B9 |

## Testing
- Contract tests per adapter against `__fixtures__` (success, auth error, rate limit, content rejection).
- Nightly smoke test against sandbox/test accounts (not blocking CI).
