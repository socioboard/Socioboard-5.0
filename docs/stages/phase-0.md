# Phase 0 · Foundation (3 weeks)

**Goal:** the project skeleton runs locally and in CI; a user can sign up, create a workspace, invite a teammate and upload media. All developer-app applications are submitted.

**Modules:** [auth](../backend/modules/auth.md), [workspaces](../backend/modules/workspaces.md), [media](../backend/modules/media.md) (upload), [audit](../backend/modules/audit.md) (write path) · **Areas:** [auth-onboarding](../frontend/areas/auth-onboarding.md) (steps 1 only), [app-shell](../frontend/areas/app-shell.md), [workspace-settings](../frontend/areas/workspace-settings.md), [media-library](../frontend/areas/media-library.md)

## Infra & tooling
- [x] P0-I1 Monorepo: pnpm workspaces + Turborepo; `apps/api`, `apps/worker`, `apps/web`, `packages/{core,contracts,providers,db,ui,billing,emails}`
- [x] P0-I2 TypeScript strict config, ESLint, Prettier, dependency-cruiser boundary rules
- [x] P0-I3 Docker Compose (dev): Postgres 17, Valkey 8, Mailpit (catches emails); optional MinIO profile for developers without S3; apps run on the host with `pnpm dev`
- [ ] P0-I4 GitHub Actions: lint, typecheck, unit + integration tests, build images (worker image includes ffmpeg/ffprobe); smoke test that starts the built api and worker images and waits for `/api/health` 200 (a bundling bug once broke only the built app), and sends SIGTERM to check graceful shutdown
- [x] P0-I5 `platform/*`: config (Zod-validated env), logger (Pino), db (Prisma + workspace-scope extension), queue (BullMQ), storage (S3 client: Amazon S3 or MinIO), mailer, events, crypto, http errors
- [ ] P0-I6 Automated Postgres backups (daily + point-in-time) on staging; restore tested once
- [ ] P0-I7 Staging environment on a temporary host; `app.staging.socioboard.com`
- [ ] P0-I9 Repo migration into one `socioboard/socioboard` repo (5.0 renamed; 6.0 on `main`; 5.0, the prototype and socioboard-core on `archive/*` branches); runbook and progress in [repo-migration](../repo-migration.md)
- [ ] P0-I8 Cloudflare Tunnel dev hostnames `dev1..dev3.dev.socioboard.com`

## Contracts
- [x] P0-C1 Error envelope, pagination, ID and date types
- [x] P0-C2 Schemas: me, workspaces, members, invitations, media uploads

## Backend
- [x] P0-B1 Prisma schema v1: User/Session/Account/Verification/TwoFactor, Workspace, Member, Invitation, MediaAsset, MediaFolder, AuditLog (MemberAccountAccess moved to P4-B1, when SocialAccount exists). Relations between workspace-owned tables use composite foreign keys `(xId, workspaceId)`; add each workspace-owned model to `WORKSPACE_SCOPED_MODELS`
- [x] P0-B2 Better Auth (UUIDv7 ids via `generateId`): email/password, verification, reset, magic link, Google + Microsoft (if keys), 2FA plugin, organization plugin with 5 roles
- [x] P0-B3 Middleware chain: requestId, rateLimit, session, workspace, requirePermission, validate, errorHandler
- [x] P0-B4 `/api/v1/me`, avatar upload, sessions endpoints; first-user bootstrap
- [x] P0-B5 Workspaces (incl. logo upload, transfer ownership), members, invitations (incl. public preview) endpoints + invitation email
- [x] P0-B6 Media upload (single PUT or multipart), complete, list, get, update, delete, folders; `media-process` job (dimensions, thumbnail)
- [x] P0-B7 Audit `record()` + listeners for member events
- [x] P0-B8 OpenAPI generation (Zod 4 JSON Schema, validated against OpenAPI 3.1) served at `/api/docs` in dev
- [x] P0-B9 Tenant isolation test harness: every endpoint from a second workspace returns 404/empty; nested `connect` and foreign-key writes across workspaces are rejected; `WORKSPACE_SCOPED_MODELS` matches every model with a `workspaceId` column
- [x] P0-B10 Seed scripts: dev users (one per role), demo workspace, sample media ([platform](../backend/modules/platform.md))
- [x] P0-B11 `/api/health` (db, Valkey, storage), graceful shutdown for api and worker
- [x] P0-B12 `packages/contracts` base: `defineRoute`, permissions map, error envelope ([contracts](../backend/contracts.md))
- [x] P0-B13 `packages/emails` base layout + auth/invitation templates

## Frontend
- [x] P0-F0 Visual direction: 2–3 directions for the key screens (app shell, composer, calendar, media) in light and dark, built with the real Socioboard logo (the only brand asset kept from 5.0); references Framer, Linear, Raycast. The chosen one sets the tokens (color, type, spacing, radius, motion) for `packages/ui` and every P0-F task. Chosen: Graphite with glass, Aurora palette, light and dark ([design system](../frontend/design-system.md#visual-direction-p0-f0-chosen-2026-09-28))
- [x] P0-F1 Vite app, TanStack Router/Query, typed API client, i18n setup, theme tokens (light/dark)
- [x] P0-F2 Design system base in `packages/ui` (shadcn/ui): Button, Input, Select, Dialog, Drawer, Toast, DataTable, EmptyState, Skeleton, Avatar, Badge
- [x] P0-F3 Sign up, sign in, verify email, reset password, 2FA, invitation accept
- [ ] P0-F4 Onboarding step 1 (create workspace); replaces the placeholder `/onboarding` route from P0-F3
- [ ] P0-F5 App shell: layout, sidebar, workspace switcher, user menu, route guards, banners; replaces the temporary start page from P0-F1 (`routes/index.tsx`) with a redirect and the placeholder `/w/$slug` route from P0-F3. Handles a session that ends mid-use: any 401 from the API clears the cached `me` and goes to `/login?redirect=<here>` (the P0-F3 route guards reuse the cached `me` and don't re-ask the server on every navigation)
- [ ] P0-F6 Settings: general, members, invitations; profile; security (password, 2FA, sessions)
- [ ] P0-F7 Media library: uploader with progress, grid, details drawer, folders
- [ ] P0-F8 Component catalog (Ladle) for `packages/ui`; replaces the development-only preview route `/dev/components` ([design system](../frontend/design-system.md))

## Platform reviews (Chethan) — see [developer-apps.md](../developer-apps.md)
- [ ] P0-R1 Publish `socioboard.com/privacy`, `/terms`, `/data-deletion`
- [ ] P0-R2 Meta Business Manager verification + prod/dev apps
- [ ] P0-R3 Snapchat partner access application
- [ ] P0-R4 LinkedIn apps + Community Management access form
- [ ] P0-R5 Google Cloud projects, OAuth consent screen, verification + YouTube audit form
- [ ] P0-R6 TikTok app + media domain verification; Pinterest trial; X project + billing cap; Tumblr, Bitly, Microsoft apps
- [ ] P0-R7 Contributor agreement for AGPL-3.0: pick a CLA (e.g. CLA Assistant bot) so Socioboard can keep running the hosted cloud on contributed code; required before accepting outside PRs

## Quality
- [ ] P0-Q1 Playwright E2E: sign up → create workspace → invite → accept → upload image

## Done when
A new user signs up, verifies email, creates a workspace, invites a teammate who joins with a role, and both see an uploaded image in the media library, locally and on staging. CI is green. All network applications are submitted.
