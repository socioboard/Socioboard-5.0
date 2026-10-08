# Phase 4 · Teams & AI (4 weeks)

**Goal:** teams can review before publishing, discuss posts, assign tasks and limit who posts where; users generate text, images and video with AI and publish them.

**Modules:** [approvals](../backend/modules/approvals.md), [tasks](../backend/modules/tasks.md), [workspaces](../backend/modules/workspaces.md) (account access, review setting), [ai](../backend/modules/ai.md), [publishing](../backend/modules/publishing.md) (AI labels) · **Areas:** [approvals](../frontend/areas/approvals.md), [posts](../frontend/areas/posts.md) (tasks, comments), [workspace-settings](../frontend/areas/workspace-settings.md), [ai-studio](../frontend/areas/ai-studio.md), [composer](../frontend/areas/composer.md) (AI panel, submit)

## Contracts
- [x] P4-C1 Submit/approve/request-changes/withdraw, comments, tasks — done 2026-10-08 (`packages/contracts/src/approvals.ts`, `tasks.ts`; member account access in `workspaces.ts`): review steps kept as a history (`GET …/posts/:pid/review`), the review queue at `GET …/reviews`, approve with an optional schedule, comments one level deep with @mentions by user id. All routes listed in `pending-routes.ts` with the task that mounts them
- [x] P4-C2 AI: fixed inputs per type (no templates, decided 2026-10-08), jobs, and our two endpoints for the AI service, the upload slot and the result update ([ai-callbacks.openapi.yaml](../backend/ai-callbacks.openapi.yaml)); align with their OpenAPI for `POST /jobs` and `GET /jobs/{id}` when it arrives. Done 2026-10-08 (`packages/contracts/src/ai.ts`): fixed inputs per type, jobs, follow-ups, and our two endpoints under `/api/v1/ai/callbacks/` (every route lives under `/api/v1`); their side is checked in P4-B8

## Backend
- [x] P4-B1 Prisma: PostApproval, PostComment, Task, AiJob, MemberAccountAccess (composite keys to Member and SocialAccount; moved from P0-B1); foreign key MediaAsset.aiJobId → AiJob — done 2026-10-08, migrations `20261008120000_phase4_teams_ai` and `20261008130000_phase4_workspace_keys` (composite keys between workspace-owned rows, as the schema test requires): `Member.accountsLimited` (a flag, so a limited member never falls back to all accounts) with `MemberAccountAccess` rows; `PostApproval` as the review history (submitted, approved, changes requested, withdrawn); `PostComment` with `mentionedUserIds`; `Task` with `reminderSentAt`; `AiJob` (`externalJobId` unique, text variations, usage) and `MediaAsset.aiJobId` → `AiJob`; `Task.postId` without a foreign key, like `Post.recurringRuleId`
- [ ] P4-B2 Approval workflow + "editing resets approval" rule + review queue
- [ ] P4-B3 Comments with @mentions; notifications for review events
- [x] P4-B4 Member account access enforced across posts, scheduling, calendar — done 2026-10-08: the membership on each request carries the member's account ids (`MemberContext.accountIds`, null = all); `GET/PUT …/members/:mid/account-access`; enforced in social accounts (list, details, options, groups), posts (list shows only posts whose every account is theirs; get, create, edit, validate, duplicate, delete, publish, retry) and scheduling (schedule, queue, unschedule, reschedule, repeat, calendar, queue slots), outside access answering 404. Owners and admins always have every account. Tests: `workspaces/__tests__/account-access.int.test.ts`, and the routes in the tenant-isolation harness. Not yet: notifications about posts a member can't see (with P4-B3), labels' post counts
- [ ] P4-B5 Tasks CRUD + due reminders
- [ ] P4-B6 **AI mock service** (`apps/ai-mock`) implementing the AI service's two endpoints and calling ours back (upload slots, then the result update, with sample outputs); once `socioboard/socioboard-ai` publishes its OpenAPI spec, a CI check that the mock still matches it
- [ ] P4-B7 AI gateway: job create (including follow-ups: `refinesJobId`, with the earlier outputs sent to the AI service as context), upload slots (media uploads tied to the job), result update (HMAC), `ai-result` completing the uploads, `ai-poll` fallback ([ai](../backend/modules/ai.md))
- [ ] P4-B8 Switch from mock to the real Python service once the spec is ready
- [ ] P4-B9 AI content labels: mark assets, set network disclosure flags where supported
- [ ] P4-B10 Basic abuse limits (per-workspace posting and AI rate limits) to protect our developer apps
- [ ] P4-B11 Email templates: review request, approved, changes requested, task assigned

## Frontend
- [ ] P4-F1 Composer: Submit for review path; banner when editing an approved post
- [ ] P4-F2 Approvals queue + review panel (previews, approve, approve & schedule, request changes)
- [ ] P4-F3 Comments thread on review panel and post detail; @mention autocomplete
- [ ] P4-F4 Tasks page + task creation from a post
- [ ] P4-F5 Settings: review requirement toggle; per-member account access. Account access done 2026-10-08 (`features/settings/components/account-access-dialog.tsx`, [workspace-settings](../frontend/areas/workspace-settings.md)): an accounts line under each member's role, and the dialog; `Member.accountIds` in the members list; QA SET-28/29. Left: the review switch, with P4-B2 (before approvals exist, turning it on would stop all publishing)
- [ ] P4-F6 AI studio page + composer side panel; a fixed form per type; job states; results to library/editor, shown as proposals that are applied explicitly and can be undone ([ai-studio](../frontend/areas/ai-studio.md#how-results-are-shown-show-then-apply-then-undo))
- [ ] P4-F7 Design system additions: CommentThread, MentionInput, JobProgress, AvatarStack (reviewers, commenters)
- [ ] P4-F8 Home page: needs attention, up next, get started (moved from the calendar), quick actions, my tasks, recent activity; `/w/:slug` opens it instead of the calendar ([home](../frontend/areas/home.md), decided 2026-10-06)

## Quality
- [ ] P4-Q1 E2E: Contributor generates with AI (mock) → submits → Editor comments, approves and schedules → publishes
- [ ] P4-Q2 Permission tests: account-limited member can't list, target or schedule other accounts

## Done when
A Contributor generates an image and caption with AI, submits the post; an Editor gets notified, comments, approves and schedules it; it publishes with AI labels set. A member limited to two accounts can't see or post to others.
