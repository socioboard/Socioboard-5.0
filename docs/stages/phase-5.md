# Phase 5 · Launch 6.0 (4 weeks)

**Goal:** the hosted cloud can take paying customers, operators can run it, legal and platform requirements are met, and the open-source release is tagged.

**Modules:** [billing](../backend/modules/billing.md), [admin](../backend/modules/admin.md) (v2), [compliance](../backend/modules/compliance.md), [audit](../backend/modules/audit.md) (views) · **Areas:** [billing](../frontend/areas/billing.md), [admin-console](../frontend/areas/admin-console.md) (v2), [workspace-settings](../frontend/areas/workspace-settings.md) (audit view)

**Needs before starting:** pricing and plans decided; cloud provider chosen.

## Contracts
- [ ] P5-C1 Billing, admin v2, compliance, public pricing schemas

## Backend
- [ ] P5-B1 `packages/billing`: Stripe products/prices, checkout, portal, webhooks, Subscription mirror
- [ ] P5-B2 `requireFeature` / `checkLimit` wired into every limited action; no-op when billing is off
- [ ] P5-B3 AI credit ledger + metered usage reporting; X per-post usage meter
- [ ] P5-B4 Grace period, read-only mode, downgrade handling (pause over-limit accounts)
- [ ] P5-B5 Admin v2: users (Better Auth admin plugin: search, ban, revoke sessions), workspaces (suspend, plan, trial, credits, **invoices and payment history from Stripe**), view-as (read-only), network quotas, AI costs, billing, flags, announcements, maintenance, abuse flags, audit
- [ ] P5-B6 Compliance: data export, account deletion, workspace export, Meta data-deletion callback + status page, retention job
- [ ] P5-B7 Security pass: rate limits review, CSP, CSRF, secrets audit, dependency scan
- [ ] P5-B8 Prisma: Subscription, PlanLimit, CreditLedger, UsageRecord, Announcement, MaintenanceWindow, AbuseFlag, DataRequest
- [ ] P5-B9 Email templates: payment failed, export ready, account deletion confirmation

## Frontend
- [ ] P5-F1 Billing settings, plan comparison, upgrade dialog on limit errors, payment-failed banner
- [ ] P5-F2 Admin console v2 screens
- [ ] P5-F3 Audit log view in workspace settings
- [ ] P5-F4 Me → export data, delete account (`/me/data`)
- [ ] P5-F5 Public pages: `/pricing`, `/data-deletion-status/:code`
- [ ] P5-F6 Design system additions: UsageMeter, PlanCard, KpiTile

## Infra & release
- [ ] P5-I1 Production environment on the chosen cloud (managed Postgres with backups, Valkey, Amazon S3, CDN for web)
- [ ] P5-I2 Monitoring: Sentry, OpenTelemetry → Grafana, uptime checks
- [ ] P5-I3 Load test: 10k scheduled posts in one hour across accounts; queue stays healthy
- [ ] P5-I4 Self-host package: production Compose (Postgres, Valkey, Caddy, S3 bucket supplied by the installer or optional `minio` profile, optional `ai` profile), `.env` reference, per-network setup guides, upgrade notes
- [ ] P5-I5 Versioned release: images on GHCR, changelog, `v6.0.0` tag

## Quality
- [ ] P5-Q1 E2E: sign up on cloud → Stripe test checkout → hit a limit → upgrade → cancel in portal
- [ ] P5-Q2 E2E: data export and account deletion; Meta data-deletion callback with a signed test request
- [ ] P5-Q3 Self-host install test on a clean VM following only the docs

## Done when
A new customer signs up on the cloud, pays via Stripe, hits and upgrades past a limit, and cancels through the portal. Admins can find and help any workspace. Data export and deletion work. A self-hoster installs from the docs with one `docker compose up`. `v6.0.0` is tagged and the cloud is live.
