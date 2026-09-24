# Module: providers

**Phase:** 1 (Meta: Facebook Pages + Instagram), 3 (LinkedIn, X, YouTube, Pinterest, TikTok, Snapchat, Tumblr, Bitly) · **Path:** `packages/providers` · **Depends on:** platform (config, http client, logger) only

## Purpose
The only code that talks to social network APIs. Each network is one adapter implementing a shared interface. Other modules ask the registry for an adapter and never call a network directly.

## Interface
```ts
interface SocialProvider {
  id: NetworkId;                       // 'facebook_page' | 'instagram' | 'linkedin_person' | 'linkedin_org' | 'x' | 'youtube' | 'pinterest' | 'tiktok' | 'snapchat' | 'tumblr'
  displayName: string;
  capabilities: Capabilities;          // postTypes (text, image, carousel, video, story, reel, short), firstComment, altText, scheduling-native?
  rules: ContentRules;                 // maxChars, maxMedia, allowed mime, aspect ratios, max video secs/size, link handling

  auth: {
    getAuthUrl(state: string, pkce?: Pkce, opts?: { forceAccountSelection?: boolean }): string;
    getIdentity(tokens: TokenSet): Promise<LoginIdentity>;       // externalUserId + name + avatar of the login
    supportsAccountSelection: boolean;                           // can the network show an account picker?
    exchangeCode(code: string, pkce?: Pkce): Promise<TokenSet>;
    refresh(tokens: TokenSet): Promise<TokenSet>;
    listAssets(tokens: TokenSet): Promise<ConnectableAsset[]>;   // Pages, orgs, channels, boards...
  };

  validate(input: PublishInput): ValidationIssue[];              // pure, used by composer + API
  publish(input: PublishInput, tokens: TokenSet): Promise<PublishResult>;   // externalId, permalink
  deletePost?(externalId: string, tokens: TokenSet): Promise<void>;
  fetchAccountMetrics?(tokens: TokenSet, range: DateRange): Promise<AccountMetrics>;   // 6.1
  fetchPostMetrics?(externalIds: string[], tokens: TokenSet): Promise<PostMetrics[]>;   // 6.1
  fetchFeed?(tokens: TokenSet, cursor?: string): Promise<FeedPage>;                      // 6.1 (feeds module)
  preview: PreviewSpec;                // layout hints for the frontend live preview
}
```

Errors thrown by adapters are always `ProviderError { kind: 'retryable' | 'auth' | 'content' | 'rate_limited', retryAfter?, networkCode, message }`.

## Layout
```
packages/providers/src/
├─ types.ts, errors.ts, registry.ts, http.ts (shared fetch with timeouts + logging)
├─ meta/        facebook-page.ts, instagram.ts, graph-client.ts
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
- `registry.get(networkId)` returns the adapter or throws `NETWORK_NOT_ENABLED`.
- An adapter registers only when its env keys are set, so self-hosters see only configured networks.

## Per-network notes (build details)
| Network | Auth | Publish path | Notes |
| --- | --- | --- | --- |
| Facebook Page | Facebook Login for Business | `/{page}/feed`, `/photos`, `/videos` | Page tokens from `listAssets` |
| Instagram | FB Login (linked) or Instagram Login | container create → publish | Media fetched from public URL; carousel = child containers |
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
