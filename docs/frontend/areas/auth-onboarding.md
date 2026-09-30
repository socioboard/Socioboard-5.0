# Area: auth-onboarding

**Phase:** 0 · **Folder:** `features/auth`, `features/onboarding` · **Backend:** [auth](../../backend/modules/auth.md), [workspaces](../../backend/modules/workspaces.md)

## Screens
| Route | Screen | Notes |
| --- | --- | --- |
| `/signup` | Sign up | Name, email, password; or Google / Microsoft buttons (shown only if enabled) |
| `/login` | Sign in | Email + password, magic link, social; "Forgot password" |
| `/verify-email` | Check your inbox | Resend button (rate-limited) |
| `/reset-password` | Request / set new password | Token from email link |
| `/login/2fa` | Enter 2FA code | Also backup codes |
| `/invite/:invitationId` | Accept invitation | Shows workspace name and role; sign in or sign up first if needed |
| `/onboarding` | First-run wizard | Step 1: create workspace (name, timezone) → Step 2: connect first account → Step 3: create first post |

## API calls
Better Auth client (`/api/auth/*`) for sign-up, sign-in, social, magic link, reset, 2FA. `GET /api/v1/me` after sign-in to route the user. `POST /api/v1/workspaces`, `POST /api/v1/invitations/:id/accept`.

## Behavior
- `?redirect=` is followed only for paths inside the app (`lib/redirect.ts`); other sites, `//host` and `/\host` are dropped. Routes always return the validated key, because the router overlays validated search params on the raw ones.
- Signed-in visitors to `/login` and `/signup` go straight on (redirect target, else the rule below). Pages that need a session send signed-out visitors to `/login?redirect=…`.
- `/verify-email` asks the server whether the email is verified (a link lands there with no flag to trust) and shows a placeholder until it knows. Resend has a 60 s cooldown.
- Password reset and magic link answer the same whether or not the address has an account.
- Links that leave the app and come back (verification email, magic link, social sign-in, and their error redirects) carry `redirect`. The verification link usually opens in a new tab, and an invitee who signs up must land back on the invitation, not on onboarding.
- Social sign-in failures return to `/login?error=<code>`. OAuth codes are lowercase and have their own messages (`errors.providers`), because `invalid_code` would otherwise read as a wrong 2FA code.
- The invite page explains which address an invitation went to when the signed-in account differs (the API answers 404 so it never confirms the invitation to someone else), and asks to verify the email first when required.
- After sign-in: no workspace → `/onboarding`; one workspace → its calendar; several → last active.
- The onboarding wizard can be skipped at steps 2–3 and resumed from a checklist card on the calendar.
- Step 1 (P0-F4) asks for the workspace name and time zone only; the server makes the URL slug from the name (changeable later in settings). The time zone defaults to the profile's, else the browser's; the list shows every IANA zone by city with its current offset, searchable by city, country, region or long name ("India Standard Time"), with today's city names for renamed ones (Kolkata, Kyiv). Visitors who must verify their email go to `/verify-email?redirect=/onboarding` first. Someone who already has a workspace can create another here and has a link back.
- Steps 2–3 (P1-F7) are `/w/:slug/welcome` (`?step=post` for step 3), where creating a workspace lands. Step 2 connects a first account through the usual network chooser; once the accounts are added, the flow comes back to step 3 instead of the Accounts page (the way back is kept in `sessionStorage` for that tab, `lib/return-to.ts`; a connect started anywhere else forgets it). With accounts connected, step 2 lists them with Continue and "Connect another". Step 3 opens the composer (with no account yet, the post is kept as a draft). Each step has "Skip for now"; people who can't connect accounts or write posts are told who does and carry on.
- The calendar's **Get started** card lists the three steps with what's done (a connected account, any post), linking each open one to where it's done. It's for people who can connect accounts, goes away once everything is done, and can be hidden (remembered in the browser per workspace).
- Password field shows strength and the breached-password error from the API.
- Unverified users can sign in but see a "verify your email" banner and can't create a workspace (cloud).
