# Area: accounts

**Phase:** 1 (Meta), 3 (other networks, groups, queue slots) · **Folder:** `features/accounts` · **Backend:** [social-accounts](../../backend/modules/social-accounts.md), [scheduling](../../backend/modules/scheduling.md) (queue slots), [shortlinks](../../backend/modules/shortlinks.md)

## Screens
| Route | Screen | Permission |
| --- | --- | --- |
| `/w/:slug/accounts` | Connected accounts grouped by network, then by **login** (e.g. Facebook → "Priya" → her 3 Pages; Facebook → "Brand Admin" → 2 Pages): avatar, name, status (active / needs reconnect), connected by, date. Each network section has **"+ Connect another <network> account"** | `posts:read` |
| `/w/:slug/accounts` → "Connect" | Network chooser: enabled networks only, with a note on what each supports | `accounts:connect` |
| `/w/:slug/accounts/connect/:provider` | **Asset picker** after OAuth: shows which login was used ("Signed in as Priya"), lists that login's Pages / orgs / channels / boards, marks ones already connected | `accounts:connect` |
| (drawer) | Account details: health, which login it comes through, reconnect, disconnect, queue slots editor | `accounts:manage` |
| (drawer) | Login details: its accounts, "Add more Pages from this login", reconnect, remove login (and all its accounts) | `accounts:manage` |
| (tab) | Account groups: create, name, pick accounts | `accounts:manage` |
| (tab) | Link shortener: connect Bitly, auto-shorten toggle | `accounts:connect` |

## 6.1: Account feed
| Route | Screen | Permission |
| --- | --- | --- |
| `/w/:slug/accounts/:accountId/feed` | Recent posts on the account (including ones not made in Socioboard) with likes/comments counts; expand to read comments; items made in Socioboard link to their post | `posts:read` + account access |

API: `GET /accounts/:aid/feed`, `GET …/feed/:itemId/comments`, `POST …/feed/refresh` ([feeds](../../backend/modules/feeds.md)). Networks without feed support show a short explanation.

## Flow: connect an account (first or additional login)
1. User picks a network (or "+ Connect another Facebook account"); where a network has more than one login (Instagram: "Continue with Facebook" for accounts linked to a Page, or "Continue with Instagram"), they pick one → `POST /accounts/connect/:provider` → browser goes to the network's consent screen.
   - Adding another login: we ask the network to show its account picker where supported. Where it isn't, a tip appears first: "You'll be signed in as whoever is logged in to Facebook in this browser. To add a different account, sign out of Facebook first or use a private window."
2. Network redirects to `/api/oauth/:provider/callback` → server creates or updates the login → redirects to `/w/:slug/accounts/connect/:provider?connection=…&result=…` (or `?error=…`, shown as a readable message with a "Try again").
3. If that login was already connected, the page says so ("Priya is already connected") with the switch-account tip, and still offers any of her assets not yet added.
4. Asset picker loads `GET /connections/:cid/assets` → user ticks assets → `POST /connections/:cid/assets` → accounts appear under that login.

The composer's account picker lists every account across all logins (grouped by network, showing the login on hover), so posting to Pages from different Facebook users in one post just works.

## Behavior
- A connect that comes back with an unknown or used sign-in link lands on `/?connectError=<code>`: the app shows the same readable message as the asset picker would.
- "Needs reconnect" accounts show a red status and a Reconnect button that re-runs the flow.
- Disconnect confirms and states how many scheduled posts will be cancelled.
- Network-specific notes on connect: TikTok/YouTube posts are private until our app passes review; LinkedIn company pages need admin rights.
- Plan limit reached (cloud) → upgrade prompt in the network chooser.
