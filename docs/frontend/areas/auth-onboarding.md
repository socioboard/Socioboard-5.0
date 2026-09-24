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
- After sign-in: no workspace → `/onboarding`; one workspace → its calendar; several → last active.
- The onboarding wizard can be skipped at steps 2–3 and resumed from a checklist card on the calendar.
- Password field shows strength and the breached-password error from the API.
- Unverified users can sign in but see a "verify your email" banner and can't create a workspace (cloud).
