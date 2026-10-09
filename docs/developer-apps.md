# Socioboard 6.0 — Developer Apps Checklist

As of 2026-09-23 · Owner: Chethan · See also: [Architecture](architecture.md), [Roadmap](roadmap.md)

Everything needed to register Socioboard's developer apps on each network and get them approved. Reviews take weeks, so all of this starts in **phase 0, week 1**. Platform rules change often: re-check each portal's current docs when you submit.

## Two findings that affect the plan

1. **X charges per post.** X moved to pay-per-use in Feb 2026: about **$0.015 per post, $0.20 per post that contains a link**, plus $0.005 per post read. There is no free tier. Posting cost must be covered by plan pricing (or metered) on the hosted cloud. Self-hosters pay X directly with their own keys.
2. **Snapchat organic posting is partner-gated.** Posting Stories/Spotlight goes through the Public Profile API inside Snap's Marketing API, which is allowlisted for approved partners. There is no self-serve access. Apply in week 1. If Snap doesn't approve us before phase 3, Snapchat ships in a later release; nothing else depends on it.

## Before you start (one-time prerequisites)

- [ ] **Legal entity details:** registered company name, address, business email on the `socioboard.com` domain, and business registration documents (Meta business verification, LinkedIn and Snap applications ask for these).
- [ ] **Public pages live on `socioboard.com`:** `/privacy`, `/terms`, `/data-deletion`. Every review checks these.
- [ ] **App branding:** name "Socioboard", a 1024×1024 icon, a one-line description, support email.
- [ ] **Domains verified:** `socioboard.com` in Google Search Console (Google OAuth), `media.socioboard.com` with TikTok (URL-prefix verification for pull-from-URL uploads), Meta domain verification in Business Manager.
- [ ] **Test accounts** on each network, **at least two separate logins per network** (to test connecting multiple accounts): a Facebook Page + linked Instagram professional account, a LinkedIn company page you admin, a YouTube channel, a Pinterest business account, a TikTok account, a Snapchat Public Profile, a Tumblr blog.
- [ ] **Demo videos:** most reviews want a screen recording of the login and posting flow. We record them against staging once phase 1/3 builds exist; submit the basic app registrations now and add videos when ready.

## Callback URLs

Each network gets **two apps**: a **production app** (production URLs only, the one that goes through review) and a **development app** (staging + dev URLs, never reviewed).

| App | Callback URL pattern |
| --- | --- |
| Production | `https://app.socioboard.com/api/oauth/<network>/callback` |
| Development | `https://app-dev.socioboard.ai/api/oauth/<network>/callback` |
| Development (local) | `https://dev1.dev.socioboard.com/api/oauth/<network>/callback` (and `dev2`, `dev3`…) |

Most networks need exact-match URLs (no wildcards), so give each developer a fixed tunnel name (`dev1`, `dev2`, …) rather than random ones. `<network>` values: `facebook`, `instagram`, `linkedin`, `x`, `youtube`, `pinterest`, `tiktok`, `snapchat`, `tumblr`, `bitly`.

## Per network

### Meta: Facebook Pages + Instagram
- **Portal:** developers.facebook.com, app type **Business**, owned by Socioboard's Meta Business Manager.
- **Products:** Facebook Login for Business (Pages, and Instagram accounts linked to a Page) and Instagram API with Instagram Login (Instagram professional accounts with no Facebook Page).
- **Permissions (Facebook Login):** `pages_show_list`, `pages_read_engagement`, `pages_manage_posts`, `pages_manage_engagement` and `pages_read_user_content` (first comment: Meta lists the second as a prerequisite of the first, and commenting as the Page fails with #200 without it), `business_management`, `instagram_basic`, `instagram_content_publish`, `instagram_manage_comments` (first comment). Analytics (6.1) adds `read_insights` and `instagram_manage_insights`. Set them in a Login for Business **configuration** (user access token) and put its id in `META_LOGIN_CONFIG_ID`; without it the adapter sends them as `scope`. Video posts need only `pages_manage_posts` (Video API publishing guide, checked 2026-09-29); `publish_video` is an older permission that use-case apps no longer offer.
- **Permissions (Instagram Login):** `instagram_business_basic`, `instagram_business_content_publish`, `instagram_business_manage_comments` (first comment). Analytics (6.1) adds `instagram_business_manage_insights`.
- **Env:** `META_APP_ID`, `META_APP_SECRET`, `META_LOGIN_CONFIG_ID` (Facebook Login); `INSTAGRAM_APP_ID`, `INSTAGRAM_APP_SECRET` (Instagram Login, shown under Instagram → API setup with Instagram login); `META_GRAPH_VERSION` optional (default in `packages/providers`, v25.0 as of 2026-09-29).
- **Local development:** Facebook Login allows `http://localhost` redirect URIs while the app is in Development mode, so `http://localhost:5173/api/oauth/facebook/callback` works without a tunnel. Instagram Login needs HTTPS (the dev tunnel, P0-I8).
- **Review:** business verification of the Business Manager, then App Review for **Advanced Access** on each permission, with a screencast per permission showing where it's used.
- **Also set:** privacy policy URL, data deletion URL, app domain. Set on the development app (2026-10-08): privacy `https://socioboard.ai/privacy-policy`, terms `https://socioboard.ai/terms-and-conditions/`, data deletion instructions `https://socioboard.ai/data-deletion-policy/` (the automatic data-deletion callback `…/api/webhooks/meta/data-deletion` comes with P5-B6).
- **Gotchas:** Instagram fetches media from a public URL (`media.socioboard.com`); images must fit IG aspect ratios. Threads (P3-B10) is a separate use case on the same Meta app, with its own permissions (`threads_basic`, `threads_content_publish`, `threads_manage_replies`) and its own screencast; in Development mode, the Threads account signing in must be a Threads tester.
- [ ] Business Manager created and verified · [ ] Prod app · [ ] Dev app (test app linked to prod) · [ ] Review submitted · [ ] Approved

#### Screencasts

`apps/web/e2e/app-review/record-meta.ts` records the App Review videos (P1-R1): one per sign-in route, from signing in to Socioboard, through Meta's consent screens and the account picker, to writing a post with an image and a first comment, publishing it, and opening the live post on Facebook and Instagram. Captions name each permission where it's used, with the call behind it; a visible pointer shows each click. It publishes for real, to `E2E_META_PAGE` and `E2E_META_INSTAGRAM`.

| Permission | Where the video shows it | Call |
| --- | --- | --- |
| `pages_show_list` | Account picker: the person's Pages | `me/accounts` |
| `business_management` | Account picker: Pages owned through a business portfolio | `me/accounts` |
| `instagram_basic` | Account picker: each Page's linked Instagram account | `instagram_business_account` on the Page |
| `pages_manage_posts` | Publishing; the post on the Page | `{page}/feed`, `{page}/photos` |
| `pages_read_engagement` | "View on Facebook" on the published post | `{post}?fields=permalink_url` |
| `pages_manage_engagement` | The first comment on the Page post | `{post}/comments` |
| `pages_read_user_content` | The first comment on the Page post (required with `pages_manage_engagement`) | `{post}/comments` |
| `instagram_content_publish` | Publishing; the post on Instagram | `{ig-user}/media`, `media_publish` |
| `instagram_manage_comments` | The first comment on the Instagram post | `{media}/comments` |
| `instagram_business_basic` | Instagram Login: the account that signed in | `me` on graph.instagram.com |
| `instagram_business_content_publish` | Instagram Login: publishing | `{ig-user}/media`, `media_publish` |
| `instagram_business_manage_comments` | Instagram Login: the first comment | `{media}/comments` |
| `threads_basic` | Threads: the profile that signed in | `me` on graph.threads.net |
| `threads_content_publish` | Threads: publishing, with who can reply | `{threads-user}/threads`, `threads_publish` |
| `threads_manage_replies` | Threads: the first comment, as a reply | `{threads-user}/threads` with `reply_to_id` |

To record (on staging: Instagram Login needs HTTPS, and it's the URL reviewers get):

1. Save the sessions it starts from, signing in yourself: `pnpm --filter @socioboard/web e2e:meta:login` (the Facebook account that manages the Page) and `… e2e:meta:login instagram` (the Instagram account). For the full consent screens in the video, first remove Socioboard under that Facebook account's **Settings → Business integrations** (and Instagram's **Apps and websites**).
2. In `.env`: `REVIEW_META_THREADS` (the Threads profile, as Socioboard names it) for the Threads video, `REVIEW_META_PAGE` / `REVIEW_META_INSTAGRAM` when the review posts to other accounts than the end-to-end tests, `REVIEW_APP_URL` (default `https://app-dev.socioboard.ai`), `REVIEW_EMAIL` / `REVIEW_PASSWORD` for a Socioboard login there (or sign in in the window when asked), and `REVIEW_FFMPEG` for an ffmpeg with libx264 (any free static build) to get MP4s.
3. `pnpm --filter @socioboard/web app-review:record facebook --dry-run` checks the whole flow and the captions without publishing; then run without `--dry-run`, and the same with `instagram` and `threads` (its session: `e2e:meta:login threads`). Each run makes its own workspace ("Meta review <date>"). If Meta shows a screen the script doesn't know, click through it in the window and the recording carries on.
4. Upload `e2e/app-review/out/meta-review-<route>-<time>.mp4` for every permission of that route; the matching `…-chapters.txt` gives each permission's timestamp for the review notes.

### LinkedIn: personal profiles + company pages
- **Portal:** linkedin.com/developers, app associated with the Socioboard LinkedIn company page.
- **Self-serve products:** Sign In with LinkedIn using OpenID Connect (`openid`, `profile`, `email`) and Share on LinkedIn (`w_member_social`) for personal posting.
- **Company pages:** the **Community Management API** (`w_organization_social`, `r_organization_social`, `rw_organization_admin`) needs an access application with legal name, address, website, privacy policy and a verified business email, followed by review. It is typically requested on its **own app** with no other products; plan a second LinkedIn app for it.
- **Gotchas:** posting to a page only works if the connecting user is an admin of that page. Access tokens last about 60 days; refresh tokens are only for approved partners, so expect periodic reconnects until then.
- **Env and callback:** `LINKEDIN_CLIENT_ID` / `LINKEDIN_CLIENT_SECRET` (the app's Auth tab); redirect URL `<APP_URL>/api/oauth/linkedin/callback`. LinkedIn accepts `http://localhost:5173/api/oauth/linkedin/callback` for local development (checked 2026-10-08), so no tunnel is needed. Every app must be associated with a LinkedIn Page, verified by that Page's admin.
- **Limits seen while building (P3-B1, 2026-10-08):** "Share on LinkedIn" allows 150 calls per member and 100,000 per app a day (UTC). Separately, LinkedIn caps how many posts a member who hasn't verified their identity can share through apps: after several test posts in a day it answers 429 "share limit has been reached for unverified members". Test with a verified member, or spread test posts over days.
- **Community Management access:** Development tier first (500 calls per app and 100 per member a day, 12 months to finish integrating), then Standard tier with a narrated screencast of the OAuth flow, posting to a page and how comments and commenters' data are shown. A rejected app can't re-apply: a new app is needed. Only registered organizations, with a business email on the company domain ([LinkedIn: Community Management app review](https://learn.microsoft.com/en-us/linkedin/marketing/community-management-app-review)).
- [ ] Personal-posting app · [ ] Community Management app · [ ] Access form submitted · [ ] Approved (Development tier) · [ ] Standard tier

### X (Twitter)
- **Portal:** developer.x.com, a Project with one App; pay-per-use billing with a **spending cap** and auto top-up configured.
- **Auth:** OAuth 2.0 with PKCE. Scopes: `tweet.read`, `tweet.write`, `users.read`, `media.write`, `offline.access`.
- **Review:** none, but a payment method is required before any call works.
- **Cost:** ~$0.015/post, ~$0.20/post with a link, $0.005/read. Feed reading in 6.1 also costs money; keep reads minimal.
- **Callbacks** (User authentication settings, type Web App, read and write): `https://app-dev.socioboard.ai/api/oauth/x/callback` and `http://localhost:5173/api/oauth/x/callback`. The **Webhooks** section is something else (X pushing events to us, with a challenge check) and isn't used.
- **Keys:** the OAuth 2.0 Client ID and Secret (`X_CLIENT_ID`, `X_CLIENT_SECRET`), not the OAuth 1.0 consumer keys or the bearer token.
- [x] Project + app ("Socio Board", 2026-10-06) · [x] Billing: prepaid credits, auto-recharge off, which caps spending at the balance · [ ] Dev app (separate project or app)

### YouTube (Google)
- **Portal:** Google Cloud Console, one project for production, one for development. Enable YouTube Data API v3 and YouTube Analytics API.
- **OAuth consent screen:** scopes `https://www.googleapis.com/auth/youtube.upload`, `youtube.readonly`, `yt-analytics.readonly`. These are sensitive scopes, so the app needs **Google OAuth verification** (verified domain, privacy policy, demo video). Unverified apps are limited to 100 test users.
- **Audit:** projects that haven't passed the YouTube **compliance audit** can only upload **private** videos. Submit the *Audit and Quota Extension Form*; it takes weeks to months. Default upload allowance is about 100 uploads/day.
- **Google sign-in** for Socioboard's own login uses a separate OAuth client (`openid`, `email`, `profile`), which needs only basic brand verification.
- [ ] Prod project · [ ] Dev project · [ ] OAuth verification submitted · [ ] Compliance audit submitted · [ ] Approved

### Pinterest
- **Portal:** developers.pinterest.com, connected to a Pinterest **business** account.
- **Scopes:** `boards:read`, `boards:write`, `pins:read`, `pins:write`, `user_accounts:read`.
- **Access tiers:** new apps get **Trial** access (read-only; pins created are visible only to the creator). `pins:write` needs **Standard** access, which requires a video of the app creating a pin.
- [ ] App created · [ ] Trial approved · [ ] Standard requested (video) · [ ] Approved

### TikTok
- **Portal:** developers.tiktok.com, one app with **Login Kit** and **Content Posting API** (Direct Post).
- **Scopes:** `user.info.basic`, `video.upload`, `video.publish`.
- **Audit:** unaudited apps can only post **private (SELF_ONLY)** content, for at most 5 users per 24 hours. Posts made before approval stay private. The audit checks that the posting UI follows TikTok's content-sharing guidelines: show the creator's nickname, let the user choose privacy level, show comment/duet/stitch toggles, and show commercial-content disclosure.
- **Also set:** URL-prefix verification for `https://media.socioboard.com/` so TikTok can pull media from our URLs.
- [ ] App created · [ ] Media domain verified · [ ] Audit submitted (after phase 3 UI exists) · [ ] Approved

### Snapchat
- **Portal:** Snap's business developer platform (Snap Kit / Marketing API).
- **Access:** organic posting (Stories, Spotlight to a Public Profile) is through the **Public Profile API**, which is partner/allowlist-gated. Apply for partner access in week 1 with the company details and use case.
- **Fallback:** if not approved by phase 3, Snapchat moves to the next release.
- [ ] Business account · [ ] Partner/API access application · [ ] Approved

### Tumblr
- **Portal:** tumblr.com/oauth/apps. OAuth 2.0 with scopes `basic`, `write`, `offline_access`.
- **Review:** none.
- [ ] Prod app · [x] Dev app

### Bitly (link shortening)
- **Portal:** Bitly developer settings, register an OAuth app so users can connect their own Bitly accounts.
- **Review:** none. Free plans have low monthly limits; users bring their own plan.
- [ ] Prod app · [ ] Dev app

### Also needed (not social networks)
- [ ] **Microsoft sign-in:** app registration in Microsoft Entra ID (`openid`, `email`, `profile`).
- [ ] **Stripe:** account, products and prices (after pricing is decided), webhook to `https://app.socioboard.com/api/webhooks/stripe`.

## Week-1 submission order

| Order | Network | Why first |
| --- | --- | --- |
| 1 | Meta business verification + app | Longest chain: business verification, then permission review |
| 2 | Snapchat partner access | Gated and unpredictable |
| 3 | LinkedIn Community Management | Manual review of company details |
| 4 | Google OAuth verification + YouTube audit | Weeks to months |
| 5 | TikTok app + domain verification | Audit itself comes after the UI exists |
| 6 | Pinterest trial | Standard access needs a video later |
| 7 | X, Tumblr, Bitly, Microsoft | Self-serve, same day |

## Sources

Checked 2026-09-23:
[X API pricing 2026 (Postproxy)](https://postproxy.dev/blog/x-api-pricing-2026/) ·
[X API tiers and pay-as-you-go (We Are Founders)](https://www.wearefounders.uk/the-x-api-price-hike-a-blow-to-indie-hackers/) ·
[Snapchat API guide 2026 (Mallary)](https://mallary.ai/blog/snapchat-api) ·
[TikTok Content Posting API: Direct Post](https://developers.tiktok.com/docs/en/content-posting-api-reference-direct-post) ·
[TikTok content sharing guidelines](https://developers.tiktok.com/docs/en/content-sharing-guidelines) ·
[LinkedIn Community Management API](https://developer.linkedin.com/product-catalog/marketing/community-management-api) ·
[LinkedIn Community Management overview](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/community-management-overview?view=li-lms-2026-08) ·
[YouTube quota and compliance audits](https://developers.google.com/youtube/v3/guides/quota_and_compliance_audits) ·
[YouTube API quota changes 2026 (OutlierKit)](https://outlierkit.com/resources/youtube-api-quota/) ·
[Pinterest access tiers](https://developers.pinterest.com/docs/key-concepts/access-tiers/) ·
[Instagram API with Instagram Login](https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/) ·
[Instagram content publishing](https://developers.facebook.com/documentation/instagram-platform/content-publishing)
