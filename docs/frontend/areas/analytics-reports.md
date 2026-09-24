# Area: analytics-reports

**Phase:** 6.1 · **Folder:** `features/analytics`, `features/reports` · **Backend:** [analytics](../../backend/modules/analytics.md), [reports](../../backend/modules/reports.md)

## Screens
| Route | Screen | Permission |
| --- | --- | --- |
| `/w/:slug/analytics` | Overview: date range + account filter; KPI tiles (followers, reach, engagement, posts published) with change vs previous period; trend charts; top posts | `analytics:read` |
| `/w/:slug/analytics/accounts/:aid` | One account: follower growth, reach/impressions, engagement rate, best posting times | `analytics:read` |
| `/w/:slug/analytics/posts` | Post performance table, sortable by any metric; opens post detail | `analytics:read` |
| `/w/:slug/reports` | Report schedules (create/edit: frequency, accounts, sections, format, recipients, branding) + past runs with downloads + "Generate now" | `analytics:read` |
| `/report-render/:runId` | Print-only page rendered by the server's headless browser for PDFs (not in navigation) | server token |

## Components
Charts use Recharts with the app's theme tokens (legible in light and dark). Metric names are the normalized ones from the API; network-only metrics appear under "More".

## Behavior
- Empty state for new accounts: "Data appears 24 hours after connecting".
- History beyond the plan limit is shown as locked with an upgrade prompt (cloud).
