# Backend — Conventions & Module Index

As of 2026-09-23 · Stack: Node.js 24 LTS + TypeScript + Express 5 + Zod + Prisma (PostgreSQL 17+) + BullMQ (Valkey) · See also: [Architecture](../architecture.md)

The backend is one Node.js + TypeScript codebase that runs as two processes:

- **api** (`apps/api`): Express 5 HTTP server plus Socket.IO. Handles every browser request.
- **worker** (`apps/worker`): BullMQ processors and repeatable jobs. Handles everything slow or external.

Both import the same feature modules from `packages/core/src/modules/*`.

## Module index

| Module | What it owns | Phase |
| --- | --- | --- |
| [platform](modules/platform.md) | Shared infrastructure: config, db + seeds, http middleware, queue, storage, mailer + email templates, events, realtime, crypto, flags | 0 |
| [auth](modules/auth.md) | Sign-up, sign-in, sessions, 2FA, OAuth login (Better Auth); SSO in 6.1 | 0, 6.1 |
| [workspaces](modules/workspaces.md) | Workspaces, members, roles, invitations, workspace settings | 0 |
| [media](modules/media.md) | Uploads, media library, processing, public URLs | 0–1 |
| [audit](modules/audit.md) | Audit log of sensitive actions | 0 (used by all) |
| [providers](modules/providers.md) | One adapter per social network; content rules; registry | 1, 3 |
| [social-accounts](modules/social-accounts.md) | Connecting accounts via OAuth, tokens, groups, member access | 1 |
| [posts](modules/posts.md) | Posts, per-account targets, drafts, overrides, validation, previews | 1 |
| [publishing](modules/publishing.md) | Publish jobs, media preparation, retries, results | 1–2 |
| [scheduling](modules/scheduling.md) | Scheduled and recurring posts, queue slots, calendar, reconciler | 2 |
| [notifications](modules/notifications.md) | In-app and email notifications, realtime delivery | 2 |
| [admin](modules/admin.md) | Platform admin console APIs | 2, 5 |
| [shortlinks](modules/shortlinks.md) | Bitly and link shortening in posts | 3 |
| [approvals](modules/approvals.md) | Review workflow and post comments | 4 |
| [ai](modules/ai.md) | AI generation jobs via the Python AI service | 4 |
| [tasks](modules/tasks.md) | Tasks and assignees on posts | 4 |
| [billing](modules/billing.md) | Stripe plans, limits, AI credits (only when Stripe is configured) | 5 |
| [compliance](modules/compliance.md) | GDPR export and deletion, Meta data-deletion callback | 5 |
| [analytics](modules/analytics.md) | Metric sync, snapshots, dashboards | 6.1 |
| [reports](modules/reports.md) | Scheduled PDF/CSV reports | 6.1 |
| [discovery](modules/discovery.md) | Content sources, RSS, boards | 6.1 |
| [feeds](modules/feeds.md) | Per-account feed of published posts and comments | 6.1 |

Shared infrastructure lives in `packages/core/src/platform/` (see [platform](modules/platform.md)). Request/response schemas live in [`packages/contracts`](contracts.md). Every piece of code maps to a phase and task in the [traceability map](../traceability.md).

## Module layout

Every feature module has the same shape:

```
packages/core/src/modules/posts/
├─ index.ts          public surface: the only file other modules may import
├─ routes.ts         Express router: validate() → permission check → service call
├─ service.ts        business logic; no Express objects, no raw HTTP
├─ repository.ts     Prisma queries; always workspace-scoped
├─ jobs.ts           BullMQ processors and job producers (if any)
├─ events.ts         domain events this module emits or listens to (if any)
├─ errors.ts         module error codes
└─ __tests__/        unit + integration tests
```

Request and response schemas live in `packages/contracts/src/<module>.ts` (Zod), shared with the frontend.

**Wiring:** each module exports a `createXModule(deps)` factory that receives its dependencies (db, queue, storage, other modules' services, config). `apps/api` and `apps/worker` call the factories at startup. No module creates its own singletons.

**Boundaries:** a module imports another module only through its `index.ts`. `dependency-cruiser` fails CI on any deep import or circular dependency.

## HTTP conventions

- **Base path:** `/api/v1`. Workspace resources live under `/api/v1/workspaces/:workspaceId/...`.
- **Reserved paths:** `/api/auth/*` (Better Auth), `/api/oauth/:network/*` (social account connect), `/api/webhooks/*` (Stripe, AI service, Meta), `/api/admin/*` (platform admin console), `/api/health`.
- **IDs:** UUIDv7 strings (time-ordered). Never expose sequential integers.
- **Time:** ISO-8601 UTC in and out. The client converts to the workspace or user timezone.
- **Success:** return the resource (or `{ items, nextCursor }` for lists) with 200/201; 204 for deletes.
- **Pagination:** cursor-based, `?cursor=<opaque>&limit=<1..100>` (default 25).
- **Errors:** always `{ "error": { "code": "POST_NOT_FOUND", "message": "…", "details": { … } } }`. Codes are `SCREAMING_SNAKE`, defined per module. HTTP status: 400 validation, 401 no session, 403 no permission or plan limit, 404 not found or not in workspace, 409 conflict, 422 business-rule violation, 429 rate limit.
- **Idempotency:** POSTs that create external side effects (publish now, AI generate) accept an `Idempotency-Key` header.

## Middleware chain

```
requestId → logger → rateLimit → session (Better Auth) → workspace(:workspaceId)
          → requirePermission('posts:create') → requireFeature('approvals') → validate(schema) → handler
          → errorHandler
```

- `workspace` loads the membership for the session user and 404s if they aren't a member, so other workspaces look like they don't exist.
- `requirePermission` checks the member's role against the permission map below.
- `requireFeature` / `checkLimit` come from billing and always pass when billing is off.
- Every Prisma call goes through a client extension that injects `workspaceId`; queries without a workspace scope fail in tests.
- The extension does not see nested writes, so relations between workspace-owned tables use **composite foreign keys** `(xId, workspaceId) → (id, workspaceId)` (with `@@unique([id, workspaceId])` on the target), so Postgres rejects a row in one workspace pointing at a row in another. Never link rows by a foreign key alone.

## Permissions

| Permission | Owner | Admin | Editor | Contributor | Viewer |
| --- | :-: | :-: | :-: | :-: | :-: |
| `workspace:delete`, `billing:manage` | ✓ | | | | |
| `workspace:update`, `members:manage`, `accounts:connect`, `accounts:manage` | ✓ | ✓ | | | |
| `posts:approve`, `posts:publish` (skip review) | ✓ | ✓ | ✓ | | |
| `posts:create`, `posts:update-own`, `media:upload`, `ai:generate`, `tasks:manage` | ✓ | ✓ | ✓ | ✓ | |
| `posts:read`, `calendar:read`, `analytics:read`, `media:read` | ✓ | ✓ | ✓ | ✓ | ✓ |

Members can also be limited to specific social accounts (`MemberAccountAccess`). Services must check account access, not just role.

Platform admins (`User.isPlatformAdmin`) are a separate axis, checked only on `/api/admin/*`.

## Events

Modules talk asynchronously through an in-process typed event bus (`platform/events`). Events that must survive a crash are also enqueued to BullMQ. Examples: `post.submitted`, `post.approved`, `target.published`, `target.failed`, `account.reauth_required`, `ai.job.completed`. `notifications` and `audit` are the main listeners.

## Jobs

- **Queue names** are kebab-case and owned by one module: `publish`, `media-prepare`, `token-refresh`, `metrics-sync`, `recurring`, `reconcile`, `ai-result`, `reports`, `notifications`.
- **Job IDs** are deterministic where duplicates would be harmful (e.g. `publish:<targetId>:v<scheduleVersion>`).
- **Processors are idempotent:** re-running a job must never double-post.
- **Retries:** exponential backoff; errors are classified `retryable`, `auth` or `content` (see [publishing](modules/publishing.md)).

## Config

One `.env`, validated at startup with Zod (`platform/config`). The process refuses to start on invalid config. A network adapter registers only if its keys are present. Billing loads only if `STRIPE_SECRET_KEY` is set.

## Testing

- **Unit:** services with in-memory fakes (Vitest).
- **Integration:** routes against a real Postgres + Valkey in Docker (Supertest).
- **Provider contract tests:** adapters against recorded HTTP fixtures.
- **Tenant isolation tests:** every list and get endpoint is called from a second workspace and must return 404 or empty.
