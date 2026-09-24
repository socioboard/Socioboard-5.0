# Stages — How We Build

As of 2026-09-23 · See also: [Roadmap](../roadmap.md), [Backend](../backend/README.md), [Frontend](../frontend/README.md)

We build in **vertical slices**: each phase delivers working features end to end (database → API → worker → UI), not "all backend first, then all frontend".

**Why:**
1. Network reviews (Meta, TikTok, Pinterest, Google) need a working UI and demo videos. A backend-only build would block approvals for months.
2. Building the screen reveals what the API is missing, early and cheaply.
3. Every few weeks there's something real to show and test.

**How each phase runs:**
1. **Contracts first (days 1–2):** write the Zod request/response schemas in `packages/contracts` for the phase's endpoints and review them together.
2. **Parallel build:** backend implements the endpoints; frontend builds against the contracts with MSW mocks, then switches to the real API.
3. **Integrate and test:** end-to-end Playwright test for the phase's main flow.
4. **Demo + done criteria check** before starting the next phase.

| Phase | Weeks | Delivers |
| --- | --- | --- |
| [0 · Foundation](phase-0.md) | 3 | Monorepo, infra, auth, workspaces, media upload; developer apps submitted |
| [1 · Publish core](phase-1.md) | 4 | Connect Facebook/Instagram, composer with live preview, publish now |
| [2 · Scheduling](phase-2.md) | 4 | Scheduling, calendar, queue, notifications, admin console v1 |
| [3 · More networks](phase-3.md) | 6 | LinkedIn, X, YouTube, Pinterest, TikTok, Snapchat, Tumblr, Bitly |
| [4 · Teams & AI](phase-4.md) | 4 | Approvals, comments, tasks, account access, AI studio |
| [5 · Launch 6.0](phase-5.md) | 4 | Billing, admin console v2, compliance, hardening, release |
| [6 · Release 6.1](phase-6.md) | 5 | Analytics, reports, discovery, SSO, Threads |

Task IDs (`P1-B3`) = phase · area (C contracts, B backend, F frontend, I infra, R reviews, Q quality) · number.

**Every piece of code is built for a task ID in one of these phase docs and lives in one module/area.** The [traceability map](../traceability.md) lists every code unit with its phases and tasks, and the branch/commit/PR rules that keep it that way.
