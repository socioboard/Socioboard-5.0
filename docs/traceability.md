# Traceability Map

As of 2026-09-23 · See also: [Stages](stages/README.md), [Backend](backend/README.md), [Frontend](frontend/README.md), [Infra](infra.md)

**Rule: every line of code belongs to one module (or area/package) and is written for a task ID in a phase doc.** If work comes up that has no task, add the task to the phase doc first, then build it. This page lists every code unit in the repo, its path, its doc, and the phases and tasks that build it.

## Apps
| Unit | Path | Doc | Phases · Tasks |
| --- | --- | --- | --- |
| API server | `apps/api` | [platform](backend/modules/platform.md) | 0 · P0-I1, P0-B3, P0-B11 |
| Worker | `apps/worker` | [platform](backend/modules/platform.md) | 0–1 · P0-I1, P0-B11, P1-B7 |
| Web app | `apps/web` | [frontend](frontend/README.md) | 0 · P0-F1 (then every F task) |
| AI mock | `apps/ai-mock` | [ai](backend/modules/ai.md) | 4 · P4-B6 |

## Packages
| Unit | Path | Doc | Phases · Tasks |
| --- | --- | --- | --- |
| Platform (config, logger, http, queue, storage, mailer, events, crypto, clock) | `packages/core/src/platform` | [platform](backend/modules/platform.md) | 0 · P0-I5, P0-B3, P0-B8 (OpenAPI), P0-B9 (tenant-isolation harness), P0-B11 · 5 · P5-B7 (security pass) |
| Platform realtime + flags | `packages/core/src/platform` | [platform](backend/modules/platform.md) | 2 · P2-B11 |
| Platform: every network's keys in config | `packages/core/src/platform/config` | [adding a network](backend/adding-a-network.md) | 3 · P3-C1 |
| Platform: member account access on each request (`MemberContext.accountIds`, `canUseAccount`, `onlyMemberAccounts`) | `packages/core/src/platform/http/context.ts` | [workspaces](backend/modules/workspaces.md) | 4 · P4-B4 |
| Database schema, migrations, seeds | `packages/db`; seed in `packages/core/src/seed.ts` | [platform](backend/modules/platform.md) | 0 · P0-B1, P0-B10; each phase adds its tables (P1-B1, P2-B1, P4-B1, P5-B8, P6-B1) |
| Contracts | `packages/contracts` | [contracts](backend/contracts.md) | 0 · P0-B12, P0-C1–C2 · 1 · P1-C1–C2 · 2 · P2-C1–C3 · 3 · P3-C1 · 4 · P4-C1–C2 · 5 · P5-C1 · 6.1 · P6-C1 |
| Email templates | `packages/emails` | [platform](backend/modules/platform.md) | 0 · P0-B13; 2 · P2-B12; 4 · P4-B11; 5 · P5-B9; 6.1 · P6-B11 |
| Design system | `packages/ui` | [design system](frontend/design-system.md) | 0 · P0-F2, P0-F4, P0-F5, P0-F6, P0-F7, P0-F8; 1 · P1-F9; 4 · P4-F7; 5 · P5-F6; 6.1 · P6-F8 |
| Provider core (types, registry, http, errors, shared validation, replay fixtures) | `packages/providers/src` (`__fixtures__/<network>/` recordings, `testing/replay.ts`) | [providers](backend/modules/providers.md) | 1 · P1-B2 |
| Facebook Page adapter | `packages/providers/src/meta` | [providers](backend/modules/providers.md) | 1 · P1-B3, P1-B9 |
| Instagram adapter | `packages/providers/src/meta` | [providers](backend/modules/providers.md) | 1 · P1-B4, P1-B9 |
| LinkedIn adapters | `packages/providers/src/linkedin` | [providers](backend/modules/providers.md) | 3 · P3-B1 |
| X adapter | `packages/providers/src/x` | [providers](backend/modules/providers.md) | 3 · P3-B2 |
| YouTube adapter | `packages/providers/src/youtube` | [providers](backend/modules/providers.md) | 3 · P3-B3 |
| Pinterest adapter | `packages/providers/src/pinterest` | [providers](backend/modules/providers.md) | 3 · P3-B4 |
| TikTok adapter | `packages/providers/src/tiktok` | [providers](backend/modules/providers.md) | 3 · P3-B5 |
| Snapchat adapter | `packages/providers/src/snapchat` | [providers](backend/modules/providers.md) | 3 · P3-B6 (if approved) |
| Tumblr adapter | `packages/providers/src/tumblr` | [providers](backend/modules/providers.md) | 3 · P3-B7 |
| Bitly shortener | `packages/providers/src/utilities` | [shortlinks](backend/modules/shortlinks.md) | 3 · P3-B8 |
| Threads adapter | `packages/providers/src/meta` | [providers](backend/modules/providers.md) | 3 · P3-B10 |
| Metrics + feed methods on adapters | `packages/providers/src/*` | [analytics](backend/modules/analytics.md), [feeds](backend/modules/feeds.md) | 6.1 · P6-B2, P6-B7 |
| Billing | `packages/billing` | [billing](backend/modules/billing.md) | 5 · P5-B1–B4 |

## Backend modules (`packages/core/src/modules/*`)
| Module | Doc | Phases · Tasks |
| --- | --- | --- |
| auth | [auth](backend/modules/auth.md) | 0 · P0-B2, P0-B4 · 6.1 · P6-B8 (SSO) |
| workspaces | [workspaces](backend/modules/workspaces.md) | 0 · P0-B5 · 4 · P4-B4 (account access) |
| media | [media](backend/modules/media.md) | 0 · P0-B6 · 1 · P1-B8, P1-B10 |
| audit | [audit](backend/modules/audit.md) | 0 · P0-B7 · 5 · P5-F3 (view) |
| social-accounts | [social-accounts](backend/modules/social-accounts.md) | 1 · P1-B5 · 2 · P2-B7 · 3 · P3-F3 (groups) · 4 · P4-B4 (account access) |
| posts | [posts](backend/modules/posts.md) | 1 · P1-B6, P1-B11 · 3 · P3-B9 (overrides) · 4 · P4-B4 (account access) |
| publishing | [publishing](backend/modules/publishing.md) | 1 · P1-B7 · 2 · P2-B5, P2-B6 · 4 · P4-B9 (AI labels) |
| scheduling | [scheduling](backend/modules/scheduling.md) | 2 · P2-B2–B5, P2-B9 · 4 · P4-B4 (account access) |
| notifications | [notifications](backend/modules/notifications.md) | 2 · P2-B8, P2-B12 · 4 · P4-B3, P4-B11 |
| admin | [admin](backend/modules/admin.md) | 2 · P2-B10 · 5 · P5-B5 · 6.1 · P6-B10 |
| shortlinks | [shortlinks](backend/modules/shortlinks.md) | 3 · P3-B8 |
| approvals | [approvals](backend/modules/approvals.md) | 4 · P4-B2, P4-B3 |
| ai | [ai](backend/modules/ai.md) | 4 · P4-B6–B9 |
| tasks | [tasks](backend/modules/tasks.md) | 4 · P4-B5 |
| abuse limits (in platform/http + publishing) | [publishing](backend/modules/publishing.md) | 4 · P4-B10 |
| billing | [billing](backend/modules/billing.md) | 5 · P5-B1–B4 |
| compliance | [compliance](backend/modules/compliance.md) | 5 · P5-B6 |
| analytics | [analytics](backend/modules/analytics.md) | 6.1 · P6-B2–B4 |
| reports | [reports](backend/modules/reports.md) | 6.1 · P6-B5 |
| discovery | [discovery](backend/modules/discovery.md) | 6.1 · P6-B6 |
| feeds | [feeds](backend/modules/feeds.md) | 6.1 · P6-B7 |

## Frontend areas (`apps/web/src/features/*`)
| Area | Doc | Phases · Tasks |
| --- | --- | --- |
| auth-onboarding | [auth-onboarding](frontend/areas/auth-onboarding.md) | 0 · P0-F3, P0-F4 · 1 · P1-F7 · 6.1 · P6-F4 (SSO) |
| app-shell (incl. public pages) | [app-shell](frontend/areas/app-shell.md) | 0 · P0-F1, P0-F5 · 2 · P2-F5 · 5 · P5-F5 |
| workspace-settings | [workspace-settings](frontend/areas/workspace-settings.md) | 0 · P0-F6 · 4 · P4-F5 · 5 · P5-F3, P5-F4 |
| media-library | [media-library](frontend/areas/media-library.md) | 0 · P0-F7 |
| accounts | [accounts](frontend/areas/accounts.md) | 1 · P1-F1 · 2 · P2-F3 (slots) · 3 · P3-F3, P3-F4 · 6.1 · P6-F7 (feed) |
| composer | [composer](frontend/areas/composer.md) | 1 · P1-F2–F5, P1-F8 · 2 · P2-F1 · 3 · P3-F1, P3-F2, P3-B10 (Threads preview and panel) · 4 · P4-F1, P4-F6 |
| posts (+ tasks) | [posts](frontend/areas/posts.md) | 1 · P1-F6, P1-F8 · 4 · P4-F3, P4-F4 |
| calendar | [calendar](frontend/areas/calendar.md) | 2 · P2-F2, P2-F3 |
| home | [home](frontend/areas/home.md) | 4 · P4-F8 |
| notifications | [notifications](frontend/areas/notifications.md) | 2 · P2-F4 |
| admin-console | [admin-console](frontend/areas/admin-console.md) | 2 · P2-F6 · 5 · P5-F2 · 6.1 · P6-F6 |
| approvals | [approvals](frontend/areas/approvals.md) | 4 · P4-F2, P4-F3 |
| ai-studio | [ai-studio](frontend/areas/ai-studio.md) | 4 · P4-F6 |
| billing | [billing](frontend/areas/billing.md) | 5 · P5-F1, P5-F5 |
| analytics-reports | [analytics-reports](frontend/areas/analytics-reports.md) | 6.1 · P6-F1, P6-F2 |
| discovery | [discovery](frontend/areas/discovery.md) | 6.1 · P6-F3 |

## Tests (end-to-end and cross-module)
Unit and integration tests live next to the code they test (`__tests__/` in each module or area). Integration tests store files in the dev compose's local S3 (RustFS, `COMPOSE_PROFILES=local-s3`), never in the S3 bucket `.env` points at; `S3_BUCKET=` (empty) runs them with storage off. Cross-module E2E suites live in `apps/web/e2e/` and chaos/load tests in `tests/`. `pnpm e2e` runs the app suites against the dev services (storage from `.env`, else MinIO); suites that publish to real networks have their own Playwright project and command (`pnpm --filter @socioboard/web e2e:meta`):

| Suite | Path | Phases · Tasks |
| --- | --- | --- |
| Calendar UI (fixture API; real browser and drag engine) | `apps/web/e2e/phase-2/calendar.spec.ts` | P2-F2 |
| Schedule → calendar → drag → publishes at the new time (a real Facebook Page; Meta project, never in CI: it publishes) | `apps/web/e2e/phase-2/meta-schedule.spec.ts` | P2-Q3 |
| E2E per phase | `apps/web/e2e/phase-<n>/` | P0-Q1 · P1-Q1, P1-Q2, P1-Q3 · P2-Q3 · P3-Q1 · P4-Q1, P4-Q2 · P5-Q1, P5-Q2 · P6-Q1, P6-Q2 |
| Chaos (`pnpm test:chaos`: real api and worker processes, the suite's own Valkey in Docker, a ledger network counting every send) + DST (`pnpm test:dst`: every clock change in every timezone against a walk of the real clock, and repeating posts through the real pipeline across the next changes) | `tests/chaos/`, `tests/scheduling/` | P2-Q1, P2-Q2 |
| Adapter coverage | `packages/providers/src/**/__tests__/`; every provider proven covered by `src/__tests__/contract-coverage.test.ts` | P1-B9 (Meta) · P3-Q2 |
| App Review screencasts (`pnpm --filter @socioboard/web app-review:record <facebook, instagram or threads>`: drives staging, publishes for real, never in CI) | `apps/web/e2e/app-review/` | P1-R1 · P3-B10 |
| Self-host install | `tests/selfhost/` | P5-Q3 |
| Load | `tests/load/` (k6) | P5-I3 |

## Platform reviews (not code, owned by Chethan)
P0-R1…R6, P1-R1, plus review submissions inside the per-network checklist in phase 3. See [developer-apps.md](developer-apps.md).

## Infra & tooling
See [infra.md](infra.md): every item there carries its phase and task ID (P0-I1…I8, P2-I1, P5-I1…I5).

## Working rules (so code stays phase- and module-wise)
- **Branches:** `p<phase>/<module>/<task-id>-short-name`, e.g. `p1/posts/P1-B6-post-crud`.
- **Commits:** Conventional Commits with the module as scope and the task ID in the body: `feat(posts): add validate endpoint` + `Task: P1-B6`.
- **Pull requests:** title starts with the task ID (`P1-B6: posts CRUD and validation`); one task per PR where possible; the PR ticks the task's checkbox in the phase doc.
- **New folders** under `modules/`, `features/` or `packages/` need a doc in this repo first (module/area doc + a row on this page).
- **Definition of done for a task:** code + tests + contracts updated + module/area doc still accurate + checkbox ticked.
- **Changing scope:** edit the phase doc (add, move or drop the task) in the same PR, so the docs always match the code.
