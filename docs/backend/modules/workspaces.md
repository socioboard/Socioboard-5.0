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
| `MemberAccountAccess` | workspaceId, memberId, socialAccountId | Empty = access to all accounts. Created in phase 4 (P4-B1), once social accounts exist |

## API
`:wid`, `:mid`, `:iid` stand for `:workspaceId`, `:memberId`, `:invitationId`. Schemas: `packages/contracts/src/workspaces.ts`.

| Method | Path | Permission | Description |
| --- | --- | --- | --- |
| POST | `/api/v1/workspaces` | signed in | Create a workspace (caller becomes owner) |
| GET | `/api/v1/workspaces` | signed in | Workspaces I belong to |
| GET | `/api/v1/workspaces/:wid` | member | Workspace details + my role |
| PATCH | `/api/v1/workspaces/:wid` | `workspace:update` | Name, slug, logo (`logoKey`), timezone, review setting |
| POST | `/api/v1/workspaces/:wid/logo-upload` | `workspace:update` | Presigned URL for the logo image; then PATCH `logoKey` |
| DELETE | `/api/v1/workspaces/:wid` | `workspace:delete` | Soft-delete (body `confirmName` must equal the name); hard-deleted after 30 days |
| GET | `/api/v1/workspaces/:wid/members` | member | List members |
| PATCH | `/api/v1/workspaces/:wid/members/:mid` | `members:manage` | Change role, set account access |
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
- `changeRole`, `removeMember`, `setAccountAccess`
- `getMembership(userId, workspaceId)`: used by the `workspace` middleware
- `canAccessAccount(member, socialAccountId)`: used by posts, scheduling, analytics

## Rules
- A workspace always has exactly one owner. The owner can't leave or be removed; they must transfer ownership first.
- Admins can't change the owner's role or promote anyone to owner.
- Member count respects `checkLimit('members')` when billing is on.
- Deleting a workspace cancels all scheduled jobs and revokes stored social tokens.
- Emits `member.invited`, `member.joined`, `member.role_changed`, `member.removed`, `workspace.deleted`.
