# Frontend — Conventions & Area Index

As of 2026-09-23 · App: `apps/web` · See also: [Backend conventions](../backend/README.md), [Architecture](../architecture.md)

A React single-page app built with Vite. It holds no business logic: it calls the API, shows state, and gives fast feedback (live validation, previews). English only at launch, with every string translatable from day one.

## Stack
| Concern | Choice |
| --- | --- |
| Framework | React 19 + TypeScript + Vite |
| Routing | TanStack Router (file-based, type-safe params and search) |
| Server state | TanStack Query (caching, retries, invalidation) |
| API client | Typed client generated from `packages/contracts` (Zod) over `fetch`, cookies included |
| Forms | react-hook-form + Zod resolvers (the same schemas the API validates with) |
| UI | Tailwind CSS + shadcn/ui components in `packages/ui`; lucide icons |
| Calendar | FullCalendar (month/week, drag-and-drop) |
| Charts (6.1) | Recharts |
| Realtime | socket.io-client → invalidates Query caches |
| i18n | react-i18next; strings in `apps/web/src/locales/en/*.json` |
| Tests | Vitest + Testing Library (components), Playwright (end-to-end), MSW (API mocks) |

## Area index
| Area | Screens | Phase |
| --- | --- | --- |
| [auth-onboarding](areas/auth-onboarding.md) | Sign up, sign in, verify, reset, invite accept, first-run onboarding | 0 |
| [app-shell](areas/app-shell.md) | Layout, sidebar, workspace switcher, user menu, banners, command palette | 0 |
| [workspace-settings](areas/workspace-settings.md) | General settings, members, invitations, roles, account access, profile | 0 |
| [media-library](areas/media-library.md) | Media grid, upload, folders, asset details | 0–1 |
| [accounts](areas/accounts.md) | Connected accounts, connect flow + asset picker, groups, queue slots; account feed (6.1) | 1, 3, 6.1 |
| [composer](areas/composer.md) | Create/edit post, per-network overrides, live validation, **live preview** | 1 |
| [posts](areas/posts.md) | Posts list, post detail + history, failures, tasks | 1, 4 |
| [calendar](areas/calendar.md) | Calendar (month/week), queue view, drag-to-reschedule | 2 |
| [notifications](areas/notifications.md) | Bell + feed, preferences | 2 |
| [admin-console](areas/admin-console.md) | Platform admin screens | 2, 5 |
| [approvals](areas/approvals.md) | Review queue, approve / request changes, comments | 4 |
| [ai-studio](areas/ai-studio.md) | Generate text/image/video from prompt or form | 4 |
| [billing](areas/billing.md) | Plan, usage, upgrade, invoices (cloud only) | 5 |
| [analytics-reports](areas/analytics-reports.md) | Dashboards, post performance, report schedules | 6.1 |
| [discovery](areas/discovery.md) | Source search, RSS feeds, boards | 6.1 |

Shared UI components are documented in the [design system](design-system.md). Every screen maps to a phase and task in the [traceability map](../traceability.md).

## Folder layout
```
apps/web/src/
├─ routes/                  TanStack Router file routes (thin: load data, render feature screens)
├─ features/<area>/
│  ├─ components/           screens and pieces for this area
│  ├─ api.ts                Query hooks: useX / useCreateX (wrap the typed client)
│  ├─ hooks.ts              area-specific hooks
│  └─ __tests__/
├─ lib/                     api client, auth, permissions (can()), realtime, i18n, dates, errors
├─ locales/en/              translation files per area
└─ main.tsx
packages/ui/                shadcn/ui-based design system (Button, Dialog, DataTable, EmptyState, …)
```
Features import each other only through `features/<area>/index.ts`.

## Routes
```
/login  /signup  /verify-email  /reset-password  /invite/:invitationId  /onboarding
/w/:slug                        → redirects to /w/:slug/calendar
/w/:slug/compose                /w/:slug/compose/:postId
/w/:slug/calendar               /w/:slug/queue
/w/:slug/posts                  /w/:slug/posts/:postId
/w/:slug/approvals              /w/:slug/tasks
/w/:slug/media                  /w/:slug/ai
/w/:slug/accounts               /w/:slug/accounts/connect/:network
/w/:slug/analytics              /w/:slug/reports              (6.1)
/w/:slug/discovery              (6.1)
/w/:slug/settings/{general,members,billing,audit}
/me/{profile,security,notifications,data}
/w/:slug/accounts/:accountId/feed  (6.1)
/pricing  /data-deletion-status/:code   public pages
/admin/...                      platform admins only
```
The workspace lives in the URL (`/w/:slug`), so links are shareable and tabs can show different workspaces.

## Rules every area follows
- **Permissions:** `can('posts:approve')` from `lib/permissions`, using the same permission map as the backend. Hide actions the user can't take; the API still enforces.
- **Every data view handles four states:** loading (skeletons), empty (explains what to do next), error (message + retry), and success.
- **Errors:** API error `code` maps to a translated message; unknown errors show a generic message plus a request ID.
- **Mutations:** optimistic updates only where rollback is simple (marking read, reordering); otherwise disable and show progress.
- **Realtime:** socket events invalidate the matching Query keys (e.g. `post.status_changed` → `['posts', id]`); no parallel client state.
- **Dates:** shown in the workspace timezone, with the user's timezone on hover when they differ.
- **Accessibility:** keyboard reachable, visible focus, labels on every control, WCAG AA contrast in light and dark themes.
- **Responsive:** works from 360px wide; the composer and calendar have mobile layouts.
- **No `localStorage` for data:** only UI preferences (sidebar collapsed, last view).
