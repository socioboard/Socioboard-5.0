# Module: billing

**Phase:** 5 · **Path:** `packages/billing` (loaded only when `STRIPE_SECRET_KEY` is set) · **Depends on:** workspaces, audit, notifications

## Purpose
Stripe subscriptions, plan limits and AI credits for the hosted cloud. When Stripe isn't configured (self-hosted), this package isn't loaded and every limit check passes.

## Data
| Table | Key fields | Notes |
| --- | --- | --- |
| `Subscription` | workspaceId, stripeCustomerId, stripeSubscriptionId, planKey, status, currentPeriodEnd, cancelAtPeriodEnd, trialEndsAt | Mirror of Stripe, updated by webhooks |
| `PlanLimit` | planKey, limits JSON | Cached from Stripe product metadata |
| `CreditLedger` | id, workspaceId, delta, reason (allowance/usage/grant/refund), aiJobId?, balanceAfter, createdAt | Append-only |
| `UsageRecord` | id, workspaceId, meter (ai_credits, x_posts), quantity, reportedToStripeAt? | Metered billing |

**Limit keys** (from Stripe product metadata): `accounts`, `members`, `scheduledPostsPerMonth`, `aiCreditsPerMonth`, `storageGb`, `analyticsHistoryDays`, feature flags `approvals`, `discovery`, `reports`, `whiteLabel`, `sso`.

## API
| Method | Path | Permission | Description |
| --- | --- | --- | --- |
| GET | `/api/v1/billing/plans` | public | Plans and prices for the pricing page |
| GET | `/api/v1/workspaces/:wid/billing` | `billing:manage` | Current plan, usage vs limits, credit balance |
| POST | `/api/v1/workspaces/:wid/billing/checkout` | `billing:manage` | Stripe Checkout session for a plan |
| POST | `/api/v1/workspaces/:wid/billing/portal` | `billing:manage` | Stripe customer portal session |
| POST | `/api/webhooks/stripe` | Stripe signature | Subscription and invoice events |

## Exports used by other modules
- `requireFeature(key)`: Express middleware.
- `checkLimit(workspaceId, key, increment)`: throws `PLAN_LIMIT_REACHED` (403) with upgrade details.
- `checkCredits(workspaceId, estimate)`, `debitCredits(workspaceId, amount, aiJobId)`.
- When billing is off, all of these are no-ops that allow.

## Webhooks handled
`checkout.session.completed`, `customer.subscription.created|updated|deleted`, `invoice.paid`, `invoice.payment_failed`.

## Rules
- **Grace period:** 7 days after a failed payment, then the workspace becomes read-only (no new schedules); nothing is deleted.
- **Downgrades:** accounts over the new limit are paused (not disconnected); the owner chooses which to keep.
- **Monthly allowance:** AI credits reset each billing period; overage is reported to Stripe as metered usage.
- **X costs:** per-post charges are tracked as `x_posts` usage so pricing can cover them.
- **Waiting on:** pricing and plans (parked business decision).
