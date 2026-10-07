# QA: admin console

Area doc: [admin-console](../frontend/areas/admin-console.md) · Checks for every screen: [README](README.md#every-screen)

For Socioboard staff (platform admins) only. Use the platform-admin test login (with 2FA).

## Getting in
- [ ] **ADMIN-01** As a normal user, open `/admin` → "Page not found" (as if it didn't exist); no "Admin console" in the user menu.
- [ ] **ADMIN-02** Platform admin without 2FA → asked to turn 2FA on (link to Security); nothing else loads.
- [ ] **ADMIN-03** Platform admin who signed in without the 2FA code → asked to sign in again with it, then comes back to the console.
- [ ] **ADMIN-04** User menu → Admin console: its own frame ("Admin console · Every workspace"), an amber-to-orange band across the top, the four pages and "Back to Socioboard".
- [ ] **ADMIN-05** The console never shows the text of anyone's posts.

## Overview
- [ ] **ADMIN-10** Six tiles for the last 24 hours: sign-ups, workspaces that posted in 30 days, published, failed, stuck over 15 minutes, accounts needing attention.
- [ ] **ADMIN-11** Failed, stuck and accounts are coloured when not zero and open the filtered page.
- [ ] **ADMIN-12** The queues' backlog (waiting, delayed, active, failed) with a link to Queues; "Updated 15:10" and a refresh button.

## Publishing
- [ ] **ADMIN-20** Health by network for 24 hours, 7 days or 30 days: success rate (green from 98 %, amber from 90 %, red below; "–" when nothing finished), published / failed / retried, the most common errors.
- [ ] **ADMIN-21** Failed and stuck deliveries below, filtered by state, network and error kind (kept in the address), 25 at a time.
- [ ] **ADMIN-22** **Retry** and **Cancel delivery** ask for a reason (3–500 characters, counted; the button waits for one); a refusal is explained in the dialog; the list refreshes after.
- [ ] **ADMIN-23** Retrying a stuck delivery warns it may already be on the network.

## Queues and accounts
- [ ] **ADMIN-30** Queues: the queue dashboard (read-only) in the page, "Open in a new tab", and a note that retries go through Publishing.
- [ ] **ADMIN-31** Accounts: accounts needing reconnecting (with the network's reason) or expiring within 7, 14 or 30 days, with how many scheduled posts each puts at risk; filtered by state, window and network.

## Phone
- [ ] **ADMIN-40** The pages scroll in a row at the top, with a back arrow; tables fit without sideways page scrolling.

## Not built yet
Users, workspaces, networks, AI, billing, controls and audit pages (phase 5), trend charts, growth (6.1).
