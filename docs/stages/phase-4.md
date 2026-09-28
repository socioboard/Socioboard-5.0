# Phase 4 · Teams & AI (4 weeks)

**Goal:** teams can review before publishing, discuss posts, assign tasks and limit who posts where; users generate text, images and video with AI and publish them.

**Modules:** [approvals](../backend/modules/approvals.md), [tasks](../backend/modules/tasks.md), [workspaces](../backend/modules/workspaces.md) (account access, review setting), [ai](../backend/modules/ai.md), [publishing](../backend/modules/publishing.md) (AI labels) · **Areas:** [approvals](../frontend/areas/approvals.md), [posts](../frontend/areas/posts.md) (tasks, comments), [workspace-settings](../frontend/areas/workspace-settings.md), [ai-studio](../frontend/areas/ai-studio.md), [composer](../frontend/areas/composer.md) (AI panel, submit)

## Contracts
- [ ] P4-C1 Submit/approve/request-changes/withdraw, comments, tasks
- [ ] P4-C2 AI templates, jobs, webhook payload (align with the Python team's spec when it arrives)

## Backend
- [ ] P4-B1 Prisma: PostApproval, PostComment, Task, AiJob, AiTemplate, MemberAccountAccess (composite keys to Member and SocialAccount; moved from P0-B1); foreign key MediaAsset.aiJobId → AiJob
- [ ] P4-B2 Approval workflow + "editing resets approval" rule + review queue
- [ ] P4-B3 Comments with @mentions; notifications for review events
- [ ] P4-B4 Member account access enforced across posts, scheduling, calendar
- [ ] P4-B5 Tasks CRUD + due reminders
- [ ] P4-B6 **AI mock service** (`apps/ai-mock`) implementing the expected contract (async jobs, webhook, sample outputs); once `socioboard/socioboard-ai` publishes its OpenAPI spec, a CI check that the mock still matches it
- [ ] P4-B7 AI gateway: templates sync, job create (including follow-ups: `refinesJobId`, with the earlier outputs sent to the AI service as context), webhook (HMAC), `ai-result` import to media, `ai-poll` fallback
- [ ] P4-B8 Switch from mock to the real Python service once the spec is ready
- [ ] P4-B9 AI content labels: mark assets, set network disclosure flags where supported
- [ ] P4-B10 Basic abuse limits (per-workspace posting and AI rate limits) to protect our developer apps
- [ ] P4-B11 Email templates: review request, approved, changes requested, task assigned

## Frontend
- [ ] P4-F1 Composer: Submit for review path; banner when editing an approved post
- [ ] P4-F2 Approvals queue + review panel (previews, approve, approve & schedule, request changes)
- [ ] P4-F3 Comments thread on review panel and post detail; @mention autocomplete
- [ ] P4-F4 Tasks page + task creation from a post
- [ ] P4-F5 Settings: review requirement toggle; per-member account access
- [ ] P4-F6 AI studio page + composer side panel; schema-driven forms; job states; results to library/editor, shown as proposals that are applied explicitly and can be undone ([ai-studio](../frontend/areas/ai-studio.md#how-results-are-shown-show-then-apply-then-undo))
- [ ] P4-F7 Design system additions: CommentThread, MentionInput, SchemaForm, JobProgress, AvatarStack (reviewers, commenters)

## Quality
- [ ] P4-Q1 E2E: Contributor generates with AI (mock) → submits → Editor comments, approves and schedules → publishes
- [ ] P4-Q2 Permission tests: account-limited member can't list, target or schedule other accounts

## Done when
A Contributor generates an image and caption with AI, submits the post; an Editor gets notified, comments, approves and schedules it; it publishes with AI labels set. A member limited to two accounts can't see or post to others.
