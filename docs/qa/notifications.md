# QA: notifications

Area doc: [notifications](../frontend/areas/notifications.md) · Checks for every screen: [README](README.md#every-screen)

Notifications are made by things that happen: a post going out, a post failing, an account needing reconnecting (real network).

## The bell
- [ ] **NOTIF-01** The bell beside search shows the unread count (up to 9, then "9+"); it rings once when the count goes up.
- [ ] **NOTIF-02** Open it → the latest 20, unread first (bold with a dot), each with a coloured mark (failed red, published green, reconnect amber), the wording, the workspace and how long ago.
- [ ] **NOTIF-03** Click one → it's marked read and its page opens (a failed post → that post's page).
- [ ] **NOTIF-04** **Mark all read** → the count goes to zero; **See all notifications** → the notifications page.
- [ ] **NOTIF-05** Nothing there → "You're all caught up".
- [ ] **NOTIF-06** The browser tab says "(3) Socioboard" while there are unread ones.
- [ ] **NOTIF-07** Phone: the Menu tab carries the count; the Menu sheet has Notifications.

## Live
- [ ] **NOTIF-10** A post fails or an account needs reconnecting while the app is open → a toast with **Open** (once per event), and the bell updates at once.
- [ ] **NOTIF-11** Read a notification in one tab → the other tab's count updates (two tabs).
- [ ] **NOTIF-12** On reopening the app, old notifications don't pop up as toasts again.

## Notifications page
- [ ] **NOTIF-20** User menu → Notifications: all of them, newest first, 25 at a time with **Load more**.
- [ ] **NOTIF-21** **All / Unread (n)** and a kind filter, kept in the address.
- [ ] **NOTIF-22** **What you hear about:** a row per kind with in-app and email switches; a switch applies at once; a channel a kind doesn't have shows "–" (the weekly summary is email only).
- [ ] **NOTIF-23** Turn email off for a kind → that kind's emails stop; turn in-app off → it no longer appears in the bell.

## Emails
- [ ] **NOTIF-30** A failed post and an account needing reconnecting send an email (when on), with a link that opens the right page.

## Not built yet
Approval requests and mentions (phase 4).
