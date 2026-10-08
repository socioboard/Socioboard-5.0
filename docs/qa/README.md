# QA checklists

As of 2026-10-07 · For the QA team · See also: [Deployment runbook](../deployment.md), [Frontend areas](../frontend/README.md)

What to check in the app, screen by screen, for everything built so far. Each checklist covers one area of the app and grows as features are built: a pull request that adds or changes something people see updates its area's checklist in the same change ([AGENTS.md](../../AGENTS.md)).

| Area | Checklist | What it covers |
| --- | --- | --- |
| Sign up, sign in, onboarding | [auth-onboarding](auth-onboarding.md) | Sign up, email verification, sign in, password reset, 2FA, invitations, first-run setup |
| App frame | [app-shell](app-shell.md) | Sidebar, workspace switcher, user menu, search (⌘K), theme, session ending, phone layout |
| Approvals | [approvals](approvals.md) | Review queue, review panel, approve, approve & schedule, request changes, my submissions |
| Settings and profile | [settings](settings.md) | Workspace settings, members and invitations, profile, security, sessions |
| Media library | [media](media.md) | Upload, processing, folders, filters, details, delete |
| Accounts | [accounts](accounts.md) | Connecting Facebook, Instagram and X, the asset picker, reconnect, disconnect, posting times |
| Composer | [composer](composer.md) | Writing a post, per-network versions, previews, checks, save, publish, schedule, repeat, queue |
| Posts | [posts](posts.md) | Posts list, a post's page, deliveries, failures and retry, labels, duplicate, delete |
| Calendar and queue | [calendar](calendar.md) | Month, week, phone agenda, drag to reschedule, quick look, queue |
| Notifications | [notifications](notifications.md) | The bell, the notifications page, preferences, live updates |
| Admin console | [admin-console](admin-console.md) | Platform admins only: overview, publishing health, queues, accounts |

## Where and with what

- **Staging:** `https://app-dev.socioboard.ai`. It runs the latest `6.0`; each deploy is announced in the team channel.
- **Test logins** (password manager, entry "Socioboard staging – QA"): one person per role in the same workspace (**owner, admin, editor, contributor, viewer**), a second workspace, and a platform admin with 2FA. Never use a personal account.
- **Social accounts:** the test Facebook Pages, Instagram account and X account in the same entry. Posting to them is public: write "Socioboard QA test, please ignore" and delete the post from the network afterwards. Each X post costs credits (about $0.015, $0.20 with a link): keep X posts to what the checklist asks.
- **Email:** sign-up and invitation emails really go out (SendGrid). Use addresses you can open.
- **Browsers:** Chrome (main), Safari, Firefox, Edge; Chrome on Android and Safari on iPhone.
- **Sizes:** phone 360–430 px wide, tablet 768 px, laptop 1280 px, wide 1920 px.

## How to use a checklist

- Each line is one check: what to do → what should happen. Its ID (e.g. `COMP-12`) is what you put in a bug report.
- **Who:** checks marked with a role (e.g. "as viewer") are about permissions: run them with that login. Unmarked checks: owner or admin.
- **(real network)**: posts to or connects a real social account; do it on the test accounts only, and clean up.
- **(two tabs)**: open the app in two tabs or two browsers to see live updates arrive.
- A checklist's **Not built yet** section lists what is planned for later: not a bug.

## Reporting a bug

Title: `[ID] what went wrong`, e.g. `[COMP-31] Publish now stays disabled after fixing the text`. In the report: steps, what you expected (the checklist line), what happened, browser and size, the time it happened (for the server logs), and a screenshot or recording. Mark severity: **blocker** (can't continue or data lost), **major** (a feature doesn't work), **minor** (works, but wrong or confusing), **cosmetic**.

## Every screen

Run these on every screen you test, in addition to its checklist.

- [ ] **ALL-01** Light and dark theme: every text readable, nothing white-on-white or black-on-black, no element that keeps the old theme's colours.
- [ ] **ALL-02** Phone (360 px), tablet (768 px), laptop and wide: no sideways scrolling of the page, nothing cut off or overlapping, buttons reachable.
- [ ] **ALL-03** Mouse pointer: everything clickable shows the hand; anything disabled shows the "not allowed" sign; plain text shows the arrow.
- [ ] **ALL-04** Keyboard only: Tab reaches every control in a sensible order with a visible focus ring; Enter/Space use them; Escape closes dialogs, menus and drawers.
- [ ] **ALL-05** Disabled buttons say why (beside them or on hover), never just go grey.
- [ ] **ALL-06** Loading shows a placeholder or spinner (never a blank page); empty lists say what to do; errors say what went wrong and how to fix it, in plain words, never a raw code.
- [ ] **ALL-07** Wording: sentence case, no typos, no untranslated keys (like `composer.issues.title`), no "undefined", "null" or "NaN".
- [ ] **ALL-08** Times show in the workspace's time zone where they belong to the workspace (posts, calendar), and on hover your own time when your computer is in another zone.
- [ ] **ALL-09** Reduced motion on (system setting): things fade instead of sliding or growing; nothing is broken or missing.
- [ ] **ALL-10** Reload (F5) keeps you on the same page with the same tab, filter and open item (they're in the address).
- [ ] **ALL-11** Back and forward buttons go where you expect; links can be opened in a new tab.
- [ ] **ALL-12** No error in the browser console (F12 → Console) while using the screen.
- [ ] **ALL-13** Animations feel quick (about a third of a second or less) and never block typing or clicking.
- [ ] **ALL-14** As viewer: no buttons for things a viewer can't do (they're hidden, not disabled), and the screen still reads well.
