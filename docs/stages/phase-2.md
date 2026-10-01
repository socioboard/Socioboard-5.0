# Phase 2 · Scheduling (4 weeks)

**Goal:** schedule posts reliably. Scheduled posts go out on time even after restarts, users see everything on a calendar, and operators can see and fix failures.

**Modules:** [scheduling](../backend/modules/scheduling.md), [publishing](../backend/modules/publishing.md) (hardening), [social-accounts](../backend/modules/social-accounts.md) (token refresh), [notifications](../backend/modules/notifications.md), [admin](../backend/modules/admin.md) (v1) · **Areas:** [calendar](../frontend/areas/calendar.md), [composer](../frontend/areas/composer.md) (schedule controls), [notifications](../frontend/areas/notifications.md), [admin-console](../frontend/areas/admin-console.md) (v1)

## Contracts
- [x] P2-C1 Schedule, reschedule, queue, recurrence, calendar range, queue slots
- [x] P2-C2 Notifications, preferences, socket event payloads
- [x] P2-C3 Admin v1: overview-lite, publishing health, failed targets, expiring accounts

## Backend
- [x] P2-B1 Prisma: RecurringRule, QueueSlot, Notification, NotificationPreference, FeatureFlag; `Post.recurringRuleId` + `occurrenceAt` for occurrence posts (migration `20261001090000_phase2_scheduling_notifications_flags`; seed adds weekday queue slots)
- [x] P2-B2 Schedule/unschedule/reschedule with `scheduleVersion` + deterministic delayed jobs (`packages/core/src/modules/scheduling`; publish-now also takes scheduled posts; accounts added to a scheduled post join at its time)
- [x] P2-B3 Queue slots + "add to queue" (`nextFreeSlot`): slots read and replace, the queue view's next 14 slots with their posts, next free slot per account under a per-account lock; daylight-saving-aware times in `scheduling/time.ts`
- [x] P2-B4 Recurring rules + `recurring` expansion job (template + one post per occurrence a week ahead; `scheduling/recurrence.ts`, `occurrences.ts`; migration `20261001120000_post_customized_at`)
- [x] P2-B5 `reconcile` job: rebuild missing jobs, resolve stuck `publishing` targets (`scheduling/reconcile.ts`, every 5 minutes; over an hour late fails as missed; stuck deliveries are stopped, not retried blindly)
- [x] P2-B6 Per-network/per-account rate limiting in the publish queue (adapter `rateLimits`, Valkey `RateLimiter` in `platform/queue`; held jobs wait without using a try; a network's "slow down" pauses the account, or the app for Meta code 4)
- [x] P2-B7 `token-refresh` + `account-health` jobs; `reauth_required` flow (`social-accounts` service `refreshExpiringTokens` / `checkHealth`, `jobs.ts`; worker schedules hourly and daily; a Facebook login's expiry only stops accounts posting with its token)
- [x] P2-B8 Notifications: event listeners, in-app feed, email templates (React Email), Socket.IO rooms + events (`modules/notifications`: the 5 routes, listeners in api and worker, grouped emails through the `notifications` queue with one plain template, `notification.new` / `notification.read` sent through `platform/realtime`'s Valkey emitter; the Socket.IO server that delivers them is P2-B11, a template per type and the digest P2-B12)
- [ ] P2-B9 Calendar endpoint
- [ ] P2-B10 Admin v1 endpoints + Bull Board mount; platform-admin guard with 2FA check
- [ ] P2-B11 `platform/realtime` (Socket.IO + Valkey adapter) and `platform/flags` (FeatureFlag reader)
- [ ] P2-B12 Email templates: publish failed, account reconnect, digest

## Frontend
- [ ] P2-F1 Composer: Schedule (date/time in workspace timezone), Add to queue, recurrence picker
- [ ] P2-F2 Calendar month/week with event cards, quick preview, click-to-compose, drag-to-reschedule; replaces the placeholder `/w/$slug/calendar` page from P0-F5
- [ ] P2-F3 Queue view per account + queue slots editor
- [ ] P2-F4 Notification bell (in the app shell's sidebar and phone menu), feed page, preferences; toasts for failures
- [ ] P2-F5 Socket client → Query invalidation for post/account status
- [ ] P2-F6 Admin console v1: overview-lite, publishing health, failed targets (retry/cancel), queues, expiring accounts

## Infra
- [ ] P2-I1 Sentry for api, worker and web; alert on failed-publish spikes and queue backlog

## Quality
- [ ] P2-Q1 Chaos tests: restart api, worker and Valkey around scheduled times; every post publishes exactly once
- [ ] P2-Q2 Daylight-saving test for recurring rules
- [ ] P2-Q3 E2E: schedule → appears on calendar → drag to new time → publishes at new time

## Done when
Scheduled and recurring posts publish on time, exactly once, surviving restarts of every component. Users get notified of failures, the calendar reflects reality live, and admins can retry failed posts from the console.
