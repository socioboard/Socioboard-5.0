# Area: workspace-settings

**Phase:** 0 (general, members, invitations), 4 (account access, review setting), 5 (audit view) · **Folder:** `features/settings`, `features/profile` · **Backend:** [workspaces](../../backend/modules/workspaces.md), [auth](../../backend/modules/auth.md), [audit](../../backend/modules/audit.md)

## Screens
| Route | Screen | Permission |
| --- | --- | --- |
| `/w/:slug/settings/general` | Name, URL, logo, timezone, "require review for every post" (phase 4); danger zone (transfer ownership, delete workspace) | `workspace:update` (danger zone: owner) |
| `/w/:slug/settings/members` | Members table (name, email, role, accounts, joined); invite dialog; account access dialog; pending invitations | view: member · change: `members:manage` |
| `/w/:slug/settings/audit` | Activity log with filters | `workspace:update` |
| `/me/profile` | Name, avatar, timezone | self |
| `/me/security` | Password, 2FA setup (QR + backup codes), active sessions | self |

## API calls
`GET/PATCH/DELETE /workspaces/:wid`, `GET/PATCH/DELETE /members`, `POST/GET/DELETE /invitations`, `POST /transfer-ownership`, `GET /audit`, `PATCH /api/v1/me`, `GET/DELETE /me/sessions`, Better Auth 2FA endpoints.

## Behavior
- Role picker explains each role in one line (from the permissions table).
- Deleting a workspace needs typing its name; shows how many scheduled posts will be cancelled.
- Plan limits (cloud): inviting past the member limit shows an upgrade prompt instead of an error.

**Built in P0-F6** (`features/settings`, `features/profile`):
- `/w/:slug/settings` opens General for roles with `workspace:update`, else Members (everyone can see who is in the workspace). The tabs are links, so each page has its own URL.
- General: name, URL (slug) and time zone save only the fields that changed; a new URL moves the page to it. Logo: pick an image (JPEG, PNG or WebP under 2 MB, checked before upload), upload it with the presigned URL, then save the key. Danger zone (owner only): transfer ownership to an admin; delete by typing the workspace name. After deleting or leaving, the app opens another workspace (or setup) before refreshing, so the old page never flashes "not found". The count of scheduled posts to be cancelled joins the delete dialog once posts exist (phase 2).
- Members: people with `members:manage` change roles inline and remove members, except the owner and themselves; everyone else sees the list only. Anyone but the owner can leave. The invite dialog's role picker explains each role in one line; pending invitations can be revoked or their link copied (to send another way). Account access is a dialog from the members table rather than a page per member (decided 2026-10-08: one choice, so a page added a click and a route for nothing).

**Built in P4-F5** (account access): the members table's Accounts column says "All accounts", "N accounts" or "No accounts". For people with `members:manage`, an editor's, contributor's or viewer's cell is a button opening the access dialog: "All accounts" (including ones connected later) or "Only some accounts" with the account picker; picking none warns that they'll see no account. Owners and admins always show "All accounts", with no button. Saving updates the row at once. The "require review for every post" switch comes with approvals (P4-B2): turned on before then, nothing could be published.
- `/me/profile` and `/me/security` render in the app shell on the active workspace (people without a workspace set one up first). Profile: name, photo, time zone (email changes come later).
- Security: change password (signs out other devices by default). People who sign in with Google, Microsoft or an email link have no password; "Set a password" emails the reset link, which creates one. Two-factor: password → QR code (drawn as SVG, dark on white for scanners) and the key in groups of four → a code from the app turns it on → backup codes to copy or download; turning it off and making new codes ask for the password. Sessions: device from the user agent ("Chrome on Windows"), IP (Better Auth keeps only the /64 network of IPv6 addresses), sign out one, or everywhere else.
