# QA: app frame

Area doc: [app-shell](../frontend/areas/app-shell.md) · Checks for every screen: [README](README.md#every-screen)

## Sidebar and pages
- [ ] **SHELL-01** Sidebar: New post, Search, the bell, Calendar, Queue, Posts, Media, Accounts, Settings; the current page is highlighted.
- [ ] **SHELL-02** Collapse the sidebar (button at the bottom) → icons only; hovering an icon names it; the choice is kept after a reload.
- [ ] **SHELL-03** Posts shows a red count when posts failed (up to "50+"); a dot when the sidebar is collapsed.
- [ ] **SHELL-04** As viewer: no New post; Settings opens Members (read-only); no admin controls anywhere.
- [ ] **SHELL-05** `/` (the bare address) → your workspace's calendar; signed out → sign in.

## Workspace switcher
- [ ] **SHELL-10** With two workspaces: the switcher lists both; picking one opens its calendar; after signing out and in, you land in the last one used.
- [ ] **SHELL-11** "Create workspace" from the switcher → onboarding step 1.
- [ ] **SHELL-12** Opening a workspace address you're not a member of → "Workspace not found" with links to yours (the same whether it exists or not).

## User menu and theme
- [ ] **SHELL-20** User menu: Profile, Security, Notifications, theme (Light / Dark / System), Sign out; platform admins also see "Admin console".
- [ ] **SHELL-21** The sun/moon button switches theme with a circle spreading from the button; halfway through, the page shows the new theme cleanly (no grey, no flash), and nothing jumps at the end.
- [ ] **SHELL-22** Theme "System" follows the computer's setting, also when it changes while the app is open.
- [ ] **SHELL-23** The theme is kept after a reload, and two tabs follow each other's change (two tabs).
- [ ] **SHELL-24** Sign out → `/login`, no message; the back button doesn't show the app's pages.

## Search (command palette)
- [ ] **SHELL-30** ⌘K (Mac) or Ctrl+K (Windows), or the Search button → the palette opens; the same keys close it.
- [ ] **SHELL-31** Type a page name → it's listed; Enter opens it. Every word typed must match ("new post" finds New post).
- [ ] **SHELL-32** Switch workspace, create a workspace, change theme, collapse the sidebar and sign out all work from the palette.
- [ ] **SHELL-33** Arrow keys move through the results and wrap round; Escape closes.

## Session ending
- [ ] **SHELL-40** Sign out in another tab, then use this tab → you're sent to sign in with a message saying why, and come back to the same page after signing in (two tabs).
- [ ] **SHELL-41** Revoke this session from Security → Sessions on another device → this tab, on its next action, goes to sign in.
- [ ] **SHELL-42** A wrong 2FA code anywhere never signs you out.

## Live updates
- [ ] **SHELL-50** Change something in one tab (publish a post, mark notifications read) → the other tab updates within a few seconds, without a reload (two tabs).
- [ ] **SHELL-51** Turn the network off for a minute, then back on → the app catches up by itself; nothing is lost.

## Phone layout (under 768 px)
- [ ] **SHELL-60** The sidebar becomes a bottom bar: four pages, Search and Menu.
- [ ] **SHELL-61** Menu opens a sheet: workspace switcher, New post, the other pages, Notifications (with the unread count) and your account; the Menu tab shows the count too.
- [ ] **SHELL-62** Every page fits the phone: no sideways scrolling, nothing hidden behind the bottom bar.

## Not built yet
Banners for payments and maintenance (phase 5), "support is viewing this account" (phase 5), Approvals, AI Studio, Analytics and Discovery in the sidebar (phases 4 and 6.1), language choice.
