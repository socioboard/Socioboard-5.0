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

**Built in P1-F1** (`features/accounts`):
- Page: a section per network (enabled networks first, in the server's order), each with its count and "Connect another <network> account"; under it each login (avatar, name, "Facebook login", a red "Needs reconnecting" with Reconnect when its token stopped working, Manage for admins), with a thread down to that login's accounts. Account rows show the avatar with its network tile, the handle (or who connected it and when) and a badge unless it's working (paused is amber, the rest red). Admins also see logins nothing was added from yet ("Nothing added from this login yet", with "Add accounts" to the asset picker), under the first network they reach. Viewers see everything but no connect, reconnect or manage controls, and the page doesn't ask for logins (an admin-only list).
- Network chooser (dialog): enabled networks with what each posts; Instagram then offers "Continue with Facebook" (Page-linked accounts) or "Continue with Instagram" when the server has both logins. Connecting a login the workspace already has sends `forceAccountSelection`, and where the network has no account picker (Facebook) the switch-account tip comes first, with "Continue to Facebook". Leaving for the network is always the user's click, and only ever to an `https:` address.
- Asset picker (`/w/:slug/accounts/connect/:provider`, admins only; others go back to the accounts page): who signed in ("Signed in to Facebook as Priya", "Priya is already connected…" with the tip, or "Reconnected…"), then the login's assets by network. New ones start ticked; ones already here show "Added"; one held by another login shows whose and isn't ticked (adding moves it); one that can't post says why (not a professional Instagram account, access not granted). "Add N accounts" or "Not now", then back to the Accounts page, or to onboarding step 3 when the connect started there ([auth-onboarding](auth-onboarding.md)). Listing fails readably: Facebook refusing the login offers Reconnect, a network timeout offers Try again. The list is asked for once per visit (not again when the tab regains focus), and a failed refresh keeps what's on screen and the ticks. `?error=` shows the code as a sentence with Try again.
- Details drawers (in the URL, `?account=` / `?login=`): an account's health (the network's reason when it needs attention), network, login, who connected it, when, last checked; Reconnect and Disconnect (the confirmation says how many scheduled posts are cancelled). A login's accounts (each opens its drawer), "Add more from this login" (the asset picker for that login), Reconnect and Remove login (says how many accounts go with it).
- `/?connectError=<code>` goes to the accounts page of the workspace the person would land in, with the message as a banner. Codes from the URL are only ever looked up, never shown: anything unknown reads as the network failing.
- Account groups, the link shortener, queue slots and the plan-limit prompt join with their phases (P3-F3, P3-F4, P2-F3, P5).

## Behavior
- A connect that comes back with an unknown or used sign-in link lands on `/?connectError=<code>`: the app shows the same readable message as the asset picker would.
- "Needs reconnect" accounts show a red status and a Reconnect button that re-runs the flow.
- Disconnect confirms and states how many scheduled posts will be cancelled.
- Network-specific notes on connect: TikTok/YouTube posts are private until our app passes review; LinkedIn company pages need admin rights.
- Plan limit reached (cloud) → upgrade prompt in the network chooser.
