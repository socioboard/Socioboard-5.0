# Module: auth

**Phase:** 0 · **Path:** `packages/core/src/modules/auth` · **Depends on:** platform (db, mailer, config), audit

## Purpose
Who the user is. Sign-up, sign-in, sessions, email verification, password reset, 2FA and social login for Socioboard itself, built on **Better Auth**. (Connecting social media accounts for *posting* is [social-accounts](social-accounts.md), not this module.)

## Data
Managed by Better Auth's Prisma adapter:

| Table | Key fields | Notes |
| --- | --- | --- |
| `User` | id, email, emailVerified, name, image, avatarKey, timezone, locale, `isPlatformAdmin`, twoFactorEnabled, createdAt | Our extra fields are declared as Better Auth `additionalFields`. `image` is a social-login avatar URL; `avatarKey` an uploaded one, which wins |
| `Session` | id, userId, token, expiresAt, ipAddress, userAgent, `activeWorkspaceId` | httpOnly, Secure, SameSite=Lax cookie |
| `Account` | userId, providerId (`credential`, `google`, `microsoft`), accountId, password hash | Login identities only |
| `Verification` | identifier, value, expiresAt | Email verification, magic links, reset tokens |
| `TwoFactor` | userId, secret, backupCodes | TOTP plugin |

## API
Better Auth mounts its own handler at `/api/auth/*` (sign-up/email, sign-in/email, sign-in/social, sign-out, get-session, magic-link, forget/reset-password, two-factor/*). We add:

| Method | Path | Who | Description |
| --- | --- | --- | --- |
| GET | `/api/v1/auth/options` | public | What the sign-in screens offer on this server: `socialProviders` (Google/Microsoft when configured) and `emailVerificationRequired` (when SMTP is set). No secrets |
| GET | `/api/v1/me` | signed in | Current user, memberships, active workspace |
| PATCH | `/api/v1/me` | signed in | Update name, avatar (`avatarKey`), timezone, locale |
| POST | `/api/v1/me/avatar-upload` | signed in | Presigned URL for an avatar image (JPEG/PNG/WebP, max 2 MB; the URL only accepts the declared size); then PATCH `avatarKey`, which checks the object exists under the caller's own prefix. Replacing or removing an avatar deletes the old file. 503 `STORAGE_NOT_CONFIGURED` without S3/MinIO |
| POST | `/api/v1/me/active-workspace` | signed in | Switch the active workspace (404 if not a member); `/me` reports null when the active one was deleted or left |
| GET | `/api/v1/me/sessions` | signed in | List active sessions |
| DELETE | `/api/v1/me/sessions/:sessionId` | signed in | Revoke one of your own sessions (another user's id is 404) |

Request and response schemas: `packages/contracts/src/auth.ts`.

## Services
- `getSession(req)`: used by the `session` middleware.
- `promoteFirstUser()`: on an empty install, the first registered user becomes platform admin (they become workspace owner by creating the first workspace). Runs after every sign-up under a Postgres advisory lock and promotes only if no admin exists and the user is the oldest account, so racing first sign-ups yield exactly one admin and an install that lost its admin never promotes a later sign-up (restore an admin with SQL instead).
- `sendVerificationEmail`, `sendResetEmail`, `sendMagicLink`: through `platform/mailer`. If no SMTP is configured, the link is written to the server log (self-host convenience).

## Better Auth plugins used
| Plugin | For | Phase |
| --- | --- | --- |
| organization | Workspaces, members, 5 roles, invitations ([workspaces](workspaces.md)) | 0 |
| two-factor | TOTP + backup codes | 0 |
| magic-link | Passwordless sign-in for existing accounts (`disableSignUp`: asking for a link never creates an account; the link email still goes out, so the form doesn't reveal who has one) | 0 |
| **admin** | Platform-admin user management: list/search users, ban/unban, revoke sessions, read-only view-as; wrapped by our [admin](admin.md) module so every action is audited | 2 (guard), 5 (user management) |
| stripe | Links workspaces to Stripe customers and subscriptions ([billing](billing.md)) | 5 |
| sso | SAML/OIDC | 6.1 |

## Rules
- Better Auth is configured to generate **UUIDv7** ids (`advanced.database.generateId`), so users, sessions and workspaces follow the API's id rule.
- Email verification is required before creating a workspace (cloud); optional when self-hosted with no SMTP.
- 2FA is optional for users and **mandatory for platform admins** (enforced when opening `/admin`).
- Rate limits per client IP, counted in Valkey: sign-in 10/min; sign-up 5/hour; magic link 5/min; password-reset and verification emails 5/hour each; 2FA code 10/min; everything else under `/api/auth` 100/min. The IP is the one Express resolves under `TRUST_PROXY` (our router passes it to Better Auth), so clients can't spoof it.
- Password rules: 10–128 characters, checked against Have I Been Pwned's range API (only the first 5 characters of the password's hash leave the server). `AUTH_BREACHED_PASSWORD_CHECK=false` turns the check off for installs without internet access.
- Google and Microsoft login register only if both their client ID and secret are set (Google always shows the account picker).
- Better Auth's organization endpoints (`/api/auth/organization/*`) are not exposed: workspaces, members and invitations go through our `/api/v1` routes, which call Better Auth server-side, so permissions, limits and audit stay in one place.
- Sessions are stored in Postgres (listed and revoked from `/me/sessions`) and cached in Valkey. Cookies use the `sb` prefix; OAuth tokens of login accounts are stored encrypted.
- Auth emails are sent in the background, so response times don't reveal whether an address has an account. Templates live in `@socioboard/emails` (P0-B13).
- Events: `user.signed_up` (user created), `user.signed_in` (session created), `user.password_changed` (reset or change).
- Config: `AUTH_SECRET` (32+ characters; the example value is refused in production), `AUTH_BREACHED_PASSWORD_CHECK`, `GOOGLE_CLIENT_ID/SECRET`, `MICROSOFT_CLIENT_ID/SECRET/TENANT_ID`.
- Emits `user.signed_up`, `user.signed_in`, `user.password_changed` (audit).

## 6.1 additions: SSO
- SAML 2.0 and OIDC single sign-on per workspace via Better Auth's SSO plugin (task P6-B8).
- Table `SsoProvider` (workspaceId, type, issuer, entryPoint/metadata, certificate, domain).
- Endpoints: `GET/PUT/DELETE /api/v1/workspaces/:wid/sso` (`workspace:update`); sign-in by email domain at `/api/auth/sso/*`.
- Optional "require SSO" for a workspace's members.

## Open points
- None for phase 0. (Magic link: on, alongside password, sign-in only; decided in P0-F3.)
