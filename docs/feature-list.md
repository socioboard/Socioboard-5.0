# Socioboard 6.0: feature list

For the landing page team. As of 2026-10-08. Kept in step with [the roadmap](roadmap.md) and the [phase docs](stages/README.md); ask engineering before claiming anything not listed here.

**Status labels**

- **Available**: built and working in the 6.0 app today (on staging).
- **At launch**: planned for the public 6.0 launch.
- **6.1**: planned for the first release after launch.

Don't put dates on the page: the plan has estimates, not commitments.

---

## In one line

Open-source social media management: write a post once, tailor it for each network, see exactly how it will look, then publish now, schedule it or add it to a queue, for your whole team. Run it in our cloud or host it yourself, free.

## Why Socioboard

- **Open source, MIT licensed.** The whole app, nothing held back. Use our hosted cloud, or run the same code on your own server for free.
- **One post, every network, each one right.** Write once, then adjust the text, media and settings for any network, with a live preview of how it will actually look there.
- **Built for teams.** Workspaces, roles, account groups, and (at launch) approvals.
- **Reliable publishing.** Scheduled posts go out once and on time, even if a server restarts; failures are explained in plain words with a one-click retry.

---

## Networks

| Network | What you can post | Status |
| --- | --- | --- |
| Facebook Pages | Text, links with a preview card, photos, videos, a first comment | Available (going live after Meta's review) |
| Instagram (business and creator accounts) | Photos, carousels, reels, stories, a first comment; connect through a Facebook Page or directly with Instagram | Available (going live after Meta's review) |
| X | Text, photos, videos, GIFs; warns when a link costs more to post | Available |
| Threads | Text with a link card, photos, videos, carousels, who can reply, a first comment as a reply | Available (going live after Meta's review) |
| LinkedIn (profiles and company pages) | Text, images, videos | At launch |
| YouTube | Video uploads with title, description, privacy and tags | At launch |
| Pinterest | Pins to a chosen board, with title and link | At launch |
| TikTok | Videos with privacy, comment/duet/stitch settings and branded-content disclosure | At launch |
| Tumblr | Posts to a chosen blog | At launch |
| Snapchat | — | Only if Snapchat grants partner access; don't list yet |
| Bitly link shortening | Shorten links in a post, by hand or automatically | At launch |

Several accounts of the same network, even from different logins (for example two people's Facebook Pages), work side by side in one workspace.

---

## Create

- **Composer**: pick the accounts, write once, add photos and videos. **Available**
- **Per-network versions**: change the text, media or settings for one network without touching the others; reset to the shared version any time. **Available**
- **Live preview** that looks like each network (Facebook, Instagram, X, Threads), updating as you type. **Available** (the other networks' previews arrive with them)
- **Checks while you write**: character limits as each network counts them, media rules, missing photos, with the reason and where to fix it. **Available**
- **First comment**: add hashtags or a link as the first comment, posted right after the post. **Available**
- **Network settings**: Instagram feed, reel or story; who can reply on Threads; (at launch) Pinterest board, YouTube title and privacy, TikTok settings. **Available / At launch**
- **Media library**: upload with progress, folders, details and alt text; pick from the library in the composer. **Available**
- **Labels** to organise posts (campaigns, clients, topics), with filters. **Available**
- **Drafts and autosave.** **Available**
- **AI studio**: generate captions, images and video from a prompt and a few settings (tone and length, image shape, video length), saved to the media library; you review every result before it's used. **At launch**

## Publish and schedule

- **Publish now.** **Available**
- **Schedule** for a date and time in the workspace's time zone. **Available**
- **Queue**: set posting times per account, then "Add to queue" fills the next free slot. **Available**
- **Repeating posts**: daily, weekly or monthly, each occurrence its own post. **Available**
- **Calendar**: month and week views, drag a post to reschedule it, click a day to write a post, filter by account, status or label. **Available**
- **Account groups**: save sets of accounts (for example one brand's channels) and pick them in one click. **Available**
- **Post history**: where each post went, with a link to it on the network, and a readable reason plus retry when something fails. **Available**

## Teams and workspaces

- **Workspaces** for each brand or client, with their own accounts, posts and media. **Available**
- **Roles**: owner, admin, editor, contributor, viewer. **Available**
- **Invite people** by email. **Available**
- **Approvals**: contributors submit, editors approve, then it publishes. **At launch**
- **Comments and @mentions on posts, and tasks.** **At launch**
- **Per-person account access**: choose which accounts each member can see and post to; they see only those accounts' posts, calendar and queue. **Available**

## Stay informed

- **Notifications** in the app and by email (a post failed, an account needs reconnecting), with your own preferences. **Available**
- **Weekly digest email** (opt-in). **Available**
- **Live updates**: statuses change on screen without refreshing. **Available**
- **Accounts stay connected**: access is renewed automatically, and you're told straight away when an account needs reconnecting. **Available**

## Analytics and more

- **Account and post analytics, dashboards.** **6.1**
- **Scheduled PDF and CSV reports by email.** **6.1**
- **Content discovery, RSS feeds and boards.** **6.1**
- **Account feeds**: recent posts and comments from your accounts. **6.1**

## Security and privacy

- **Sign-in options**: email and password, magic link, Google or Microsoft. **Available**
- **Two-factor authentication**, active sessions you can sign out. **Available**
- **Workspace data kept separate**, tested on every endpoint. **Available**
- **Audit log** of who did what. **Available** (the screen to browse it: at launch)
- **Data export and account deletion.** **At launch**
- **Single sign-on (SAML / OIDC).** **6.1**

## Cloud or self-hosted

- **Hosted cloud**: sign up and go. **At launch** (paid plans with Stripe at launch)
- **Self-hosted**: the same code with Docker, your own storage (Amazon S3 or any S3-compatible), free. **At launch** (guides per network)
- **Light and dark themes.** **Available**

---

## Wording notes

- Say **"Instagram business and creator accounts"**: personal Instagram accounts can't be posted to by any app.
- Facebook means **Facebook Pages**, not personal profiles (Facebook doesn't allow apps to post to profiles).
- For networks marked "going live after Meta's review", it's fine to list them; avoid "now live" until engineering confirms approval.
- The AI service is open source too and runs with your own model keys when self-hosted.
