# Area: workspace-settings

**Phase:** 0 (general, members, invitations), 4 (account access, review setting), 5 (audit view) · **Folder:** `features/settings`, `features/profile` · **Backend:** [workspaces](../../backend/modules/workspaces.md), [auth](../../backend/modules/auth.md), [audit](../../backend/modules/audit.md)

## Screens
| Route | Screen | Permission |
| --- | --- | --- |
| `/w/:slug/settings/general` | Name, logo, timezone, "require review for every post", auto-shorten links; danger zone (transfer ownership, delete workspace) | `workspace:update` (danger zone: owner) |
| `/w/:slug/settings/members` | Members table (name, email, role, account access, joined); invite dialog; pending invitations | view: member · change: `members:manage` |
| `/w/:slug/settings/members/:mid` | Change role; limit to specific social accounts | `members:manage` |
| `/w/:slug/settings/audit` | Activity log with filters | `workspace:update` |
| `/me/profile` | Name, avatar, timezone | self |
| `/me/security` | Password, 2FA setup (QR + backup codes), active sessions | self |

## API calls
`GET/PATCH/DELETE /workspaces/:wid`, `GET/PATCH/DELETE /members`, `POST/GET/DELETE /invitations`, `POST /transfer-ownership`, `GET /audit`, `PATCH /api/v1/me`, `GET/DELETE /me/sessions`, Better Auth 2FA endpoints.

## Behavior
- Role picker explains each role in one line (from the permissions table).
- Deleting a workspace needs typing its name; shows how many scheduled posts will be cancelled.
- Plan limits (cloud): inviting past the member limit shows an upgrade prompt instead of an error.
