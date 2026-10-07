# QA: sign up, sign in, onboarding

Area doc: [auth-onboarding](../frontend/areas/auth-onboarding.md) · Checks for every screen: [README](README.md#every-screen)

## Sign up
- [ ] **AUTH-01** `/signup` with name, a new email and a strong password → "Check your inbox" page; the verification email arrives.
- [ ] **AUTH-02** Weak password → strength shown as you type; a password known from data breaches is refused with a plain explanation.
- [ ] **AUTH-03** An email that already has an account → a clear message, no second account.
- [ ] **AUTH-04** Empty or invalid fields → each field says what's wrong; nothing is sent.
- [ ] **AUTH-05** "Resend" on the check-your-inbox page → a new email; the button then waits 60 seconds before it can be used again.
- [ ] **AUTH-06** Open the verification link (often in a new tab) → you're verified and continue to onboarding (or back to an invitation you started from).
- [ ] **AUTH-07** Open the verification link a second time, or an old one → a readable message, not an error page.
- [ ] **AUTH-08** Signed in but not verified → a "verify your email" banner, and creating a workspace sends you to verify first.

## Sign in
- [ ] **AUTH-10** `/login` with the right email and password → your workspace's calendar (the last one you used, if several).
- [ ] **AUTH-11** Wrong password → "wrong email or password" (it never says which one was wrong).
- [ ] **AUTH-12** "Email me a sign-in link instead" → the email arrives; its link signs you in. Asking for an address with no account shows the same message (nothing is revealed).
- [ ] **AUTH-13** Opening a page while signed out (e.g. `/w/<slug>/posts`) → sign in → you land on that page, not the calendar.
- [ ] **AUTH-14** A link like `/login?redirect=https://example.com` → after sign-in you stay in the app (other sites are never followed).
- [ ] **AUTH-15** Already signed in and opening `/login` or `/signup` → you go straight to the app.
- [ ] **AUTH-16** Sign in with Google or Microsoft (only if those buttons show) → signed in; cancelling on Google's page brings you back with a readable message.

## Forgotten password
- [ ] **AUTH-20** "Forgot password?" → enter the email → the reset email arrives; an unknown address shows the same message.
- [ ] **AUTH-21** The reset link → set a new password → sign in with it works, the old one doesn't.
- [ ] **AUTH-22** A used or expired reset link → a readable message with a way to ask for a new one.

## Two-factor sign-in
- [ ] **AUTH-30** With 2FA on (set it up in [settings](settings.md)): sign in → asked for the 6-digit code → the right code signs you in.
- [ ] **AUTH-31** A wrong code → "that code didn't work"; you are not signed out and can try again.
- [ ] **AUTH-32** Use a backup code instead → signed in; the same backup code doesn't work twice.

## Invitations
- [ ] **AUTH-40** Open an invitation link signed out → the page shows the workspace's name and your role, with sign in or create an account.
- [ ] **AUTH-41** Create an account from the invitation → verify the email → you come back to the invitation → "Accept invitation" → you're in that workspace with that role.
- [ ] **AUTH-42** Open an invitation while signed in with a different email than it was sent to → it explains which address it was sent to; it can't be accepted with the wrong account.
- [ ] **AUTH-43** A revoked or already used invitation → a readable message.
- [ ] **AUTH-44** "Decline" → the invitation is gone; the inviter's pending list no longer shows it.

## First-run setup (onboarding)
- [ ] **AUTH-50** New verified account → `/onboarding` → workspace name and time zone (pre-filled with yours) → "Create workspace" → step 2.
- [ ] **AUTH-51** Time zone list: search by city ("Kolkata"), country ("India"), or long name ("India Standard Time"); each shows its current offset; the list scrolls with the mouse wheel.
- [ ] **AUTH-52** Step 2 "Connect your first account" → connect a Facebook Page (real network) → you come back to step 3, not to the Accounts page.
- [ ] **AUTH-53** Step 3 "Write your first post" → opens the composer; with no account connected, the post can only be saved as a draft.
- [ ] **AUTH-54** "Skip for now" on steps 2 and 3 → you reach the calendar, which shows a **Get started** card listing the steps and what's done.
- [ ] **AUTH-55** Get started card: each open step links to where it's done; it disappears once everything is done; hiding it keeps it hidden after a reload.
- [ ] **AUTH-56** As a member without permission to connect accounts or write posts → the steps tell you who does them and let you carry on.
- [ ] **AUTH-57** Someone who already has a workspace can create another from `/onboarding` and has a link back to the one they were in.

## Not built yet
Sign-in with SSO (6.1), email change from the profile, plan limits (phase 5).
