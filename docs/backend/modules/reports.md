# Module: reports

**Phase:** 6.1 · **Path:** `packages/core/src/modules/reports` · **Depends on:** analytics, posts, notifications (email), media/storage, billing (`whiteLabel`, optional)

## Purpose
Scheduled and on-demand reports (PDF or CSV) summarizing account and post performance, emailed to chosen recipients. Replaces 5.0's daily/weekly/monthly report emails.

## Data
| Table | Key fields | Notes |
| --- | --- | --- |
| `ReportSchedule` | id, workspaceId, name, frequency (daily/weekly/monthly), dayOfWeek?, dayOfMonth?, time, timezone, accountIds[], sections[], format (pdf/csv), recipients[], branding JSON?, active | |
| `ReportRun` | id, scheduleId?, workspaceId, periodFrom, periodTo, status, fileKey?, error?, createdAt | |

## API
| Method | Path | Permission | Description |
| --- | --- | --- | --- |
| CRUD | `/api/v1/workspaces/:wid/reports/schedules` | `analytics:read` (+ `workspace:update` to create) | Manage schedules |
| POST | `/api/v1/workspaces/:wid/reports/generate` | `analytics:read` | One-off report for a date range |
| GET | `/api/v1/workspaces/:wid/reports/runs` | `analytics:read` | Past runs with download links |

## Jobs
- `reports` (repeatable per schedule): gather data → render → store → email recipients.
- **Rendering:** PDF by headless Chromium (Playwright) printing a React report page (reuses dashboard components); CSV built directly.

## Rules
- White-label (logo, colors, hide Socioboard branding) requires `whiteLabel` when billing is on; always available when self-hosted.
- Download links are signed and expire after 7 days.
