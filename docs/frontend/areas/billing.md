# Area: billing

**Phase:** 5 · **Folder:** `features/billing` · **Backend:** [billing](../../backend/modules/billing.md)

Visible only on the hosted cloud (when the API reports billing is enabled).

## Screens
| Route | Screen | Permission |
| --- | --- | --- |
| `/w/:slug/settings/billing` | Current plan, renewal date, usage meters (accounts, members, scheduled posts this month, AI credits, storage), buttons: Change plan, Manage billing | `billing:manage` (others see plan name only) |
| (dialog) | Plan comparison + upgrade → Stripe Checkout | `billing:manage` |
| `/pricing` (public) | Plans from `GET /billing/plans` (can also live on the marketing site) | public |

## Upgrade prompts
Any `PLAN_LIMIT_REACHED` error anywhere in the app opens a shared `UpgradeDialog` naming the limit hit and the plan that removes it (non-owners see "Ask your workspace owner").

## API calls
`GET /billing/plans`, `GET /workspaces/:wid/billing`, `POST /billing/checkout` → redirect, `POST /billing/portal` → redirect (invoices, payment method, cancel).

## Behavior
- Payment failed → app-wide banner with "Update payment method" (owner only).
- Read-only mode after the grace period: composer shows why scheduling is disabled.
- **Waiting on:** pricing and plans.
