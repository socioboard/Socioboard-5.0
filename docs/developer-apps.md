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
| Development | `https://app.staging.socioboard.com/api/oauth/<network>/callback` |
| Development (local) | `https://dev1.dev.socioboard.com/api/oauth/<network>/callback` (and `dev2`, `dev3`…) |

Most networks need exact-match URLs (no wildcards), so give each developer a fixed tunnel name (`dev1`, `dev2`, …) rather than random ones. `<network>` values: `facebook`, `instagram`, `linkedin`, `x`, `youtube`, `pinterest`, `tiktok`, `snapchat`, `tumblr`, `bitly`.

## Per network

### Meta: Facebook Pages + Instagram
- **Portal:** developers.facebook.com, app type **Business**, owned by Socioboard's Meta Business Manager.
- **Products:** Facebook Login for Business (Pages, and Instagram accounts linked to a Page) and Instagram API with Instagram Login (Instagram professional accounts with no Facebook Page).
- **Permissions (Facebook Login):** `pages_show_list`, `pages_read_engagement`, `pages_manage_posts`, `read_insights`, `business_management`, `instagram_basic`, `instagram_content_publish`, `instagram_manage_insights`.
- **Permissions (Instagram Login):** `instagram_business_basic`, `instagram_business_content_publish`, `instagram_business_manage_insights`.
- **Review:** business verification of the Business Manager, then App Review for **Advanced Access** on each permission, with a screencast per permission showing where it's used.
- **Also set:** privacy policy URL, data-deletion callback `https://app.socioboard.com/api/webhooks/meta/data-deletion`, app domain.
- **Gotchas:** Instagram fetches media from a public URL (`media.socioboard.com`); images must fit IG aspect ratios. Threads (6.1) will be a separate use case on the same Meta app.
- [ ] Business Manager created and verified · [ ] Prod app · [ ] Dev app (test app linked to prod) · [ ] Review submitted · [ ] Approved

### LinkedIn: personal profiles + company pages
- **Portal:** linkedin.com/developers, app associated with the Socioboard LinkedIn company page.
- **Self-serve products:** Sign In with LinkedIn using OpenID Connect (`openid`, `profile`, `email`) and Share on LinkedIn (`w_member_social`) for personal posting.
- **Company pages:** the **Community Management API** (`w_organization_social`, `r_organization_social`, `rw_organization_admin`) needs an access application with legal name, address, website, privacy policy and a verified business email, followed by review. It is typically requested on its **own app** with no other products; plan a second LinkedIn app for it.
- **Gotchas:** posting to a page only works if the connecting user is an admin of that page. Access tokens last about 60 days; refresh tokens are only for approved partners, so expect periodic reconnects until then.
- [ ] Personal-posting app · [ ] Community Management app · [ ] Access form submitted · [ ] Approved (Development tier) · [ ] Standard tier

### X (Twitter)
- **Portal:** developer.x.com, a Project with one App; pay-per-use billing with a **spending cap** and auto top-up configured.
- **Auth:** OAuth 2.0 with PKCE. Scopes: `tweet.read`, `tweet.write`, `users.read`, `media.write`, `offline.access`.
- **Review:** none, but a payment method is required before any call works.
- **Cost:** ~$0.015/post, ~$0.20/post with a link, $0.005/read. Feed reading in 6.1 also costs money; keep reads minimal.
- [ ] Project + app · [ ] Billing + spending cap · [ ] Dev app (separate project or app)

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
- [ ] Prod app · [ ] Dev app

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
