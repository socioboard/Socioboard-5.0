# Module: workspaces

**Phase:** 0 · **Path:** `packages/core/src/modules/workspaces` · **Depends on:** auth, audit, notifications (invites), billing (limits, optional)

## Purpose
Workspaces (teams), their members and roles, invitations, per-member account access and workspace settings. Built on Better Auth's **organization plugin** (organization = workspace) with our five custom roles. We expose our own `/api/v1` routes so permission checks, limits and audit logging stay consistent.

## Data
| Table | Key fields | Notes |
| --- | --- | --- |
| `Workspace` | id, name, slug, logo (storage key), timezone, `requireReviewForAll`, createdAt, deletedAt | Better Auth organization + extra fields; soft delete |
| `Member` | id, workspaceId, userId, role, createdAt | role ∈ owner, admin, editor, contributor, viewer |
| `Invitation` | id, workspaceId, email, role, status, expiresAt, invitedById | 7-day expiry |
| `MemberAccountAccess` | workspaceId, memberId, socialAccountId | The accounts a member may use when `Member.accountsLimited` is set; otherwise they may use all. A flag rather than "no rows means all", so removing a limited member's last account can't widen their access (P4-B1) |

## API
`:wid`, `:mid`, `:iid` stand for `:workspaceId`, `:memberId`, `:invitationId`. Schemas: `packages/contracts/src/workspaces.ts`.

| Method | Path | Permission | Description |
| --- | --- | --- | --- |
| POST | `/api/v1/workspaces` | signed in | Create a workspace (caller becomes owner) |
| GET | `/api/v1/workspaces` | signed in | Workspaces I belong to |
| GET | `/api/v1/workspaces/:wid` | member | Workspace details + my role |
| PATCH | `/api/v1/workspaces/:wid` | `workspace:update` | Name, slug, logo (`logoKey`), timezone, review setting |
| POST | `/api/v1/workspaces/:wid/logo-upload` | `workspace:update` | Presigned URL for the logo image; then PATCH `logoKey` |
| DELETE | `/api/v1/workspaces/:wid` | `workspace:delete` | Soft-delete (body `confirmName` must equal the name); hard-deleted after 30 days. Nothing more is published: its scheduled posts are cancelled (jobs dropped) and its repeating rules stopped ([scheduling](scheduling.md)) |
| GET | `/api/v1/workspaces/:wid/members` | member | List members |
| PATCH | `/api/v1/workspaces/:wid/members/:mid` | `members:manage` | Change role |
| GET | `/api/v1/workspaces/:wid/members/:mid/account-access` | `members:manage` or self | `{ accountIds }`; null = all accounts |
| PUT | `/api/v1/workspaces/:wid/members/:mid/account-access` | `members:manage` | Limit to a list of accounts, or `null` for all (P4-B4) |
| DELETE | `/api/v1/workspaces/:wid/members/:mid` | `members:manage` or self | Remove member / leave |
| POST | `/api/v1/workspaces/:wid/invitations` | `members:manage` | Invite by email + role |
| GET | `/api/v1/workspaces/:wid/invitations` | `members:manage` | Pending invitations |
| DELETE | `/api/v1/workspaces/:wid/invitations/:iid` | `members:manage` | Revoke invitation |
| GET | `/api/v1/invitations/:iid` | public | Preview for the invite page: workspace name and logo, role, inviter name, masked email, status |
| POST | `/api/v1/invitations/:iid/accept` | signed in (matching email) | Accept |
| POST | `/api/v1/invitations/:iid/decline` | signed in | Decline |
| POST | `/api/v1/workspaces/:wid/transfer-ownership` | owner | Make another admin the owner; the old owner becomes admin |

## Services
- `createWorkspace`, `updateWorkspace`, `deleteWorkspace`
- `inviteMember` → email via notifications; `acceptInvitation`
- `changeRole`, `removeMember`, `getAccountAccess`, `setAccountAccess`
- `createMembershipLookup`: the membership the route middleware puts on each request, with the member's `accountIds` (null = all)
- `canUseAccount(member, accountId)` and `onlyMemberAccounts(member, key)` (platform): used by social accounts, posts and scheduling

## How it's built
- Better Auth's organization plugin creates the workspace (with its owner membership) and switches the active workspace. Everything else (members, invitations, roles, ownership) is this module's own service, so permission checks, errors, emails and events have one path; Better Auth's organization HTTP endpoints are closed.
- Slugs are generated from the name (`Acme Marketing` → `acme-marketing`, a short random suffix when taken); an explicit taken slug is 409 `SLUG_TAKEN`.
- Invitation statuses map from Better Auth's: `rejected` → declined, `canceled` → revoked, and a pending one past `expiresAt` → expired.
- Jobs: `workspace-purge`, nightly at 03:00 UTC in the worker, permanently deletes workspaces soft-deleted more than 30 days ago, removing their stored files (logo, media, thumbnails) before the rows.

## Rules
- Creating a workspace and accepting an invitation need a verified email whenever the server can send email (SMTP configured); otherwise anyone could register an invitee's address without owning it and take the seat. 403 `EMAIL_NOT_VERIFIED`.
- Only the invited address can accept or decline; anyone else gets 404, so the invitation's existence isn't confirmed to them.
- A workspace always has exactly one owner. The owner can't leave or be removed; they must transfer ownership first.
- Admins can't change the owner's role or promote anyone to owner.
- Member count respects `checkLimit('members')` when billing is on.
- Deleting a workspace cancels all scheduled jobs and revokes stored social tokens.
- **Account access (P4-B4):** a member limited to some accounts sees and posts to only those. Accounts and their details, account groups (only their accounts; groups with none are hidden), posts (only posts whose every account is theirs), creating, editing, validating, publishing, scheduling, queueing, repeating and moving posts, the calendar and queue slots all apply it; anything outside it answers 404 like another workspace's (`ACCOUNT_NOT_FOUND`, `POST_NOT_FOUND`). Owners and admins always have every account and can't be limited (422 `ROLE_HAS_ALL_ACCOUNTS`); a limited member promoted to admin gets every account, and the limit applies again if they go back. Accounts connected later aren't added to a limit. Read on every request, so a change applies at once. Audited as `member.account_access_changed`.
- Role changes, removals and ownership transfers re-check roles inside the write, so two admins acting at once can't leave a workspace without an owner or with two.
- Error codes: `SLUG_TAKEN`, `EMAIL_NOT_VERIFIED`, `CONFIRMATION_MISMATCH`, `OWNER_ONLY`, `TARGET_NOT_ADMIN`, `CANNOT_CHANGE_OWNER`, `OWNER_CANNOT_LEAVE`, `MEMBER_NOT_FOUND`, `ALREADY_MEMBER`, `ALREADY_INVITED`, `INVITATION_NOT_FOUND`, `INVITATION_EXPIRED` / `_REVOKED` / `_DECLINED` / `_ACCEPTED`, `LOGO_NOT_UPLOADED`, `STORAGE_NOT_CONFIGURED`.
- Emits `workspace.created`, `workspace.updated`, `workspace.deleted`, `workspace.ownership_transferred`, `member.invited`, `member.joined`, `member.role_changed`, `member.removed`, `invitation.revoked`, `invitation.declined`.
