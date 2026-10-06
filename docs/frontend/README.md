# Frontend — Conventions & Area Index

As of 2026-09-23 · App: `apps/web` · See also: [Backend conventions](../backend/README.md), [Architecture](../architecture.md)

A React single-page app built with Vite. It holds no business logic: it calls the API, shows state, and gives fast feedback (live validation, previews). English only at launch, with every string translatable from day one.

## Stack
| Concern | Choice |
| --- | --- |
| Framework | React 19 + TypeScript + Vite |
| Routing | TanStack Router (file-based, type-safe params and search). `src/routeTree.gen.ts` is generated (Vite plugin, or `pnpm generate`) and not committed; `tsr.config.json` keeps test files out of the route tree |
| Server state | TanStack Query (caching, invalidation; 4xx never retried, server and network errors retried twice) |
| API client | `lib/api.ts`: `api(route, { params, query, body })` typed by the route definitions in `packages/contracts`, over `fetch` with cookies; failures are `ApiError` (`status`, `code`, `requestId`), network failures `NETWORK_ERROR` |
| Forms | react-hook-form + Zod resolvers (the same schemas the API validates with) |
| UI | Tailwind CSS v4 with the design tokens in `packages/ui/src/styles.css` (glass utilities, light and dark via the `.dark` class), shadcn/ui-based components in `packages/ui`; lucide icons; Instrument Sans self-hosted (`@fontsource-variable`) |
| Calendar | FullCalendar (month/week, drag-and-drop) |
| Charts (6.1) | Recharts |
| Realtime | socket.io-client → invalidates Query caches |
| i18n | react-i18next with typed keys; strings in `apps/web/src/locales/en/*.json` (`common`, `errors`); `errorMessage(error)` maps API error codes to translated text, else a generic message with the request ID |
| Tests | Vitest + Testing Library (components and screens), Playwright (end-to-end); API calls in screen tests go to a small fetch mock keyed by method and path (`src/testing/render.tsx`) |
| Component catalog | Ladle (`pnpm catalog`), stories next to the components in `packages/ui` |

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
| [home](areas/home.md) | What needs attention, up next, get started, quick actions, my tasks; the workspace's landing page from phase 4 | 4 |
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
Features import each other, and routes and `lib` import features, only through `features/<area>/index.ts` (enforced by dependency-cruiser).

## Routes
```
/login  /signup  /verify-email  /reset-password  /invite/:invitationId  /onboarding
/w/:slug                        → redirects to /w/:slug/calendar (Home from phase 4, P4-F8)
/w/:slug/compose                /w/:slug/compose/:postId
/w/:slug/calendar               /w/:slug/queue
/w/:slug/posts                  /w/:slug/posts/:postId
/w/:slug/approvals              /w/:slug/tasks
/w/:slug/media                  /w/:slug/ai
/w/:slug/accounts               /w/:slug/accounts/connect/:provider
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
- **Permissions:** `const can = useCan(); can('posts:approve')` from `lib/permissions` (the role in the current workspace, via `useWorkspace()` in `lib/workspace`), using the same permission map as the backend. Hide actions the user can't take; the API still enforces.
- **Every data view handles four states:** loading (skeletons), empty (explains what to do next), error (message + retry), and success.
- **Errors:** API error `code` maps to a translated message; unknown errors show a generic message plus a request ID.
- **Mutations:** optimistic updates only where rollback is simple (marking read, reordering); otherwise disable and show progress.
- **Realtime:** socket events invalidate the matching Query keys (e.g. `post.status_changed` → the post, its lists, the calendar and the queue); no parallel client state. Built in P2-F5: `lib/realtime.ts` holds one Socket.IO connection per signed-in tab (WebSocket only, same origin, the session cookie; each event checked against its contract, a malformed one ignored) and its status (`connecting`, `live`, `offline`, also on `<html data-live>`); `features/live` maps events to the cache (`notification.new` on top of the bell, `notification.read` everywhere it shows, `post.status_changed` on the post's page at once then re-read, `account.status_changed` refreshes that workspace's accounts and posts). Screens that asked on a timer (the bell, the calendar, a post being sent) stop or slow down while live and pick it up again while the socket is down; after a drop, everything on screen is re-read. The shell connects and disconnects with the session.
- **Dates:** shown in the workspace timezone, with the user's timezone on hover when they differ. Posts' times do this since P2-F1 (`useWorkspaceTime` in `lib/use-workspace-time.ts`, `WorkspaceTime` in `lib/workspace-time.tsx`; the timezone comes with each membership in `GET /me`); account, member and session dates stay on the reader's own clock.
- **Accessibility:** keyboard reachable, visible focus, labels on every control, WCAG AA contrast in light and dark themes.
- **Responsive:** works from 360px wide; the composer and calendar have mobile layouts. The page area (`main` in the app and admin shells) is a CSS container: layouts inside a page switch on the room the page has (`@2xl:` two columns from 672 px, `@4xl:` side panels such as the composer's preview from 896 px, `@max-…:hidden` for table columns), never on the window width, which also counts the sidebar (a 768 px tablet leaves a page about 500 px). The shell itself, dialogs and drawers use window breakpoints. `DataTable` is fixed-layout: give fixed columns a width (narrower under `@xl` on phones) and the main column truncates.
- **No `localStorage` for data:** only UI preferences (sidebar collapsed, last view).
