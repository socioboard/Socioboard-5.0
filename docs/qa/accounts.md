# QA: accounts

Area doc: [accounts](../frontend/areas/accounts.md) · Checks for every screen: [README](README.md#every-screen)

Networks available now: **Facebook Pages, Instagram, X**. The others arrive in phase 3, one by one; each adds its own section here.

## The accounts page
- [ ] **ACC-01** Accounts: a section per network with its count and "Connect another <network> account"; under it each login (name, "Facebook login" / "X login") and its accounts.
- [ ] **ACC-02** An account row: picture with the network's mark, name, handle (or who connected it and when); a badge only when it isn't working (paused amber, the rest red).
- [ ] **ACC-03** No accounts yet → an empty state with **Connect account**.
- [ ] **ACC-04** As editor, contributor or viewer: everything is visible, but no connect, reconnect or manage controls.

## Connecting (real network)
- [ ] **ACC-10** Connect account → the network chooser lists only the networks this server has, with what each can post.
- [ ] **ACC-11** **Facebook:** pick Facebook → Facebook's page → approve → back in the app: "Signed in to Facebook as <name>", the Pages and their linked Instagram accounts, new ones ticked → "Add N accounts" → they're on the Accounts page.
- [ ] **ACC-12** **Instagram:** pick Instagram → choose "Continue with Facebook" (accounts linked to a Page) or "Continue with Instagram" (professional accounts without a Page) → each works.
- [ ] **ACC-13** **X:** pick X → X's page → sign in and approve → back with the account (name, @handle) → add it.
- [ ] **ACC-14** In the asset picker: an account already added shows "Added"; one held by another login says whose (adding moves it); one that can't post says why (not a professional Instagram account, permission not granted).
- [ ] **ACC-15** Cancel on the network's page → back in the app with a readable message and **Try again**.
- [ ] **ACC-16** Connect the same login again → "<name> is already connected", with the switch-account tip; anything not yet added is still offered.
- [ ] **ACC-17** Connect a second Facebook or X account: the app first shows the tip "sign out of <network> first, or use a private window", then Continue (they have no account picker). Instagram shows its own account picker.
- [ ] **ACC-18** "Not now" in the asset picker → back to Accounts, nothing added.
- [ ] **ACC-19** Connecting from onboarding step 2 returns to onboarding step 3, not to the Accounts page.

## Account and login details
- [ ] **ACC-20** Click an account → its drawer: health (the network's reason if something's wrong), network, login, who connected it, when, last checked.
- [ ] **ACC-21** **Disconnect** → the confirmation says how many scheduled posts will be cancelled → confirm → it's gone, and those posts show as cancelled.
- [ ] **ACC-22** Click a login's **Manage** → its accounts, "Add more from this login" (back to the asset picker), Reconnect, **Remove login** (says how many accounts go with it).
- [ ] **ACC-23** An account that needs reconnecting → red "Needs reconnecting" and **Reconnect** → the network's page → back and working again.

## Posting times (queue slots)
- [ ] **ACC-30** Account drawer (or the Queue page) → **Posting times**: the week from Monday, each day's times as chips, **Add** a time, remove a chip.
- [ ] **ACC-31** **Start from**: weekdays at 09:00 and 15:00, every day at 10:00, or clear all.
- [ ] **ACC-32** A day's menu → copy its times to the weekdays or to every day.
- [ ] **ACC-33** Time zone picker in the dialog: searchable, **scrolls with the mouse wheel**, defaults to the workspace's zone.
- [ ] **ACC-34** The same time twice in a day isn't possible; times stay sorted; it says how many times a week there are.
- [ ] **ACC-35** **Save posting times** → the Queue page, the composer's "Add to queue" and the calendar's free slots all show them.
- [ ] **ACC-36** As editor or below: no Posting times button.

## Not built yet
LinkedIn, YouTube, Pinterest, TikTok, Snapchat, Tumblr (phase 3, one at a time), account groups and the Bitly link shortener (phase 3), the account feed (6.1), plan limits (phase 5).
