# Module: auth

**Phase:** 0 · **Path:** `packages/core/src/modules/auth` · **Depends on:** platform (db, mailer, config), audit

## Purpose
Who the user is. Sign-up, sign-in, sessions, email verification, password reset, 2FA and social login for Socioboard itself, built on **Better Auth**. (Connecting social media accounts for *posting* is [social-accounts](social-accounts.md), not this module.)

## Data
Managed by Better Auth's Prisma adapter:

| Table | Key fields | Notes |
| --- | --- | --- |
| `User` | id, email, emailVerified, name, image, timezone, locale, `isPlatformAdmin`, createdAt | Our extra fields are declared as Better Auth `additionalFields` |
| `Session` | id, userId, token, expiresAt, ipAddress, userAgent, `activeWorkspaceId` | httpOnly, Secure, SameSite=Lax cookie |
| `Account` | userId, providerId (`credential`, `google`, `microsoft`), accountId, password hash | Login identities only |
| `Verification` | identifier, value, expiresAt | Email verification, magic links, reset tokens |
| `TwoFactor` | userId, secret, backupCodes | TOTP plugin |

## API
Better Auth mounts its own handler at `/api/auth/*` (sign-up/email, sign-in/email, sign-in/social, sign-out, get-session, magic-link, forget/reset-password, two-factor/*). We add:

| Method | Path | Who | Description |
| --- | --- | --- | --- |
| GET | `/api/v1/me` | signed in | Current user, memberships, active workspace |
| PATCH | `/api/v1/me` | signed in | Update name, avatar, timezone, locale |
| POST | `/api/v1/me/active-workspace` | signed in | Switch the active workspace |
| GET | `/api/v1/me/sessions` | signed in | List active sessions |
| DELETE | `/api/v1/me/sessions/:id` | signed in | Revoke a session |

## Services
- `getSession(req)`: used by the `session` middleware.
- `bootstrapFirstUser()`: on an empty install, the first registered user becomes platform admin and workspace owner.
- `sendVerificationEmail`, `sendResetEmail`, `sendMagicLink`: through `platform/mailer`. If no SMTP is configured, the link is written to the server log (self-host convenience).

## Better Auth plugins used
| Plugin | For | Phase |
| --- | --- | --- |
| organization | Workspaces, members, 5 roles, invitations ([workspaces](workspaces.md)) | 0 |
| two-factor | TOTP + backup codes | 0 |
| magic-link | Passwordless sign-in | 0 |
| **admin** | Platform-admin user management: list/search users, ban/unban, revoke sessions, read-only view-as; wrapped by our [admin](admin.md) module so every action is audited | 2 (guard), 5 (user management) |
| stripe | Links workspaces to Stripe customers and subscriptions ([billing](billing.md)) | 5 |
| sso | SAML/OIDC | 6.1 |

## Rules
- Email verification is required before creating a workspace (cloud); optional when self-hosted with no SMTP.
- 2FA is optional for users and **mandatory for platform admins** (enforced when opening `/admin`).
- Rate limits: sign-in 10/min per IP + email; sign-up 5/hour per IP.
- Password rules: min 10 characters, checked against a breached-password list.
- Google and Microsoft login register only if their client IDs are set.
- Emits `user.signed_up`, `user.signed_in`, `user.password_changed` (audit).

## 6.1 additions: SSO
- SAML 2.0 and OIDC single sign-on per workspace via Better Auth's SSO plugin (task P6-B8).
- Table `SsoProvider` (workspaceId, type, issuer, entryPoint/metadata, certificate, domain).
- Endpoints: `GET/PUT/DELETE /api/v1/workspaces/:wid/sso` (`workspace:update`); sign-in by email domain at `/api/auth/sso/*`.
- Optional "require SSO" for a workspace's members.

## Open points
- Magic link on by default? Proposed: yes, alongside password.
