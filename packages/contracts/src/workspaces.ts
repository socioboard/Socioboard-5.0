import { z } from 'zod';

import { Id, IsoDateTime } from './common';
import { Email, ImageUploadRequest, ImageUploadTicket, Timezone, UserSummary } from './fields';
import { ROLES } from './permissions';
import { defineRoute } from './route';

/** Roles that can be given by invite or role change; ownership moves only by transfer. */
export const AssignableRole = z.enum(ROLES).exclude(['owner']);
export type AssignableRole = z.infer<typeof AssignableRole>;

export const WorkspaceName = z.string().trim().min(1).max(80);
/** Used in web URLs (`/w/:slug`): lowercase letters, digits and single hyphens. */
export const Slug = z
  .string()
  .min(3)
  .max(48)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and hyphens');

export const Workspace = z.object({
  id: Id,
  name: z.string(),
  slug: z.string(),
  logoUrl: z.url().nullable(),
  timezone: z.string(),
  requireReviewForAll: z.boolean(),
  createdAt: IsoDateTime,
});
export type Workspace = z.infer<typeof Workspace>;

/** A workspace as seen by one member. */
export const WorkspaceWithRole = Workspace.extend({ myRole: z.enum(ROLES) });
export type WorkspaceWithRole = z.infer<typeof WorkspaceWithRole>;

export const CreateWorkspaceBody = z.object({
  name: WorkspaceName,
  /** Generated from the name when omitted. */
  slug: Slug.optional(),
  timezone: Timezone,
});

export const UpdateWorkspaceBody = z
  .object({
    name: WorkspaceName,
    slug: Slug,
    /** Key from `POST …/logo-upload`, or null to remove the logo. */
    logoKey: z.string().nullable(),
    timezone: Timezone,
    requireReviewForAll: z.boolean(),
  })
  .partial()
  .refine((b) => Object.keys(b).length > 0, 'Nothing to update');

export const DeleteWorkspaceBody = z.object({
  /** Must equal the workspace name, as typed in the confirmation dialog. */
  confirmName: z.string(),
});

export const Member = z.object({
  id: Id,
  user: UserSummary,
  role: z.enum(ROLES),
  joinedAt: IsoDateTime,
});
export type Member = z.infer<typeof Member>;

export const UpdateMemberBody = z.object({ role: AssignableRole });

export const TransferOwnershipBody = z.object({
  /** Must be an admin; the current owner becomes an admin. */
  memberId: Id,
});

export const InvitationStatus = z.enum(['pending', 'accepted', 'declined', 'revoked', 'expired']);

export const Invitation = z.object({
  id: Id,
  email: z.string(),
  role: AssignableRole,
  status: InvitationStatus,
  invitedBy: UserSummary,
  expiresAt: IsoDateTime,
  createdAt: IsoDateTime,
});
export type Invitation = z.infer<typeof Invitation>;

export const CreateInvitationBody = z.object({ email: Email, role: AssignableRole });

/** What the invite page shows before the person signs in: nothing beyond the invite itself. */
export const InvitationPreview = z.object({
  id: Id,
  workspace: z.object({ name: z.string(), logoUrl: z.url().nullable() }),
  role: AssignableRole,
  invitedByName: z.string(),
  /** Masked, e.g. "c•••@example.com", so the link doesn't reveal the full address. */
  emailHint: z.string(),
  status: InvitationStatus,
  expiresAt: IsoDateTime,
});
export type InvitationPreview = z.infer<typeof InvitationPreview>;

const workspaceParams = z.object({ workspaceId: Id });
const memberParams = workspaceParams.extend({ memberId: Id });
const invitationParams = workspaceParams.extend({ invitationId: Id });

export const workspaceRoutes = {
  createWorkspace: defineRoute({
    method: 'POST',
    path: '/api/v1/workspaces',
    access: 'user',
    summary: 'Create a workspace; the caller becomes its owner',
    body: CreateWorkspaceBody,
    responses: { 201: WorkspaceWithRole },
  }),
  listWorkspaces: defineRoute({
    method: 'GET',
    path: '/api/v1/workspaces',
    access: 'user',
    summary: 'Workspaces I belong to',
    responses: { 200: z.object({ items: z.array(WorkspaceWithRole) }) },
  }),
  getWorkspace: defineRoute({
    method: 'GET',
    path: '/api/v1/workspaces/:workspaceId',
    access: 'member',
    summary: 'Workspace details and my role',
    params: workspaceParams,
    responses: { 200: WorkspaceWithRole },
  }),
  updateWorkspace: defineRoute({
    method: 'PATCH',
    path: '/api/v1/workspaces/:workspaceId',
    access: 'workspace:update',
    summary: 'Update name, slug, logo, timezone or review setting',
    params: workspaceParams,
    body: UpdateWorkspaceBody,
    responses: { 200: WorkspaceWithRole },
  }),
  createLogoUpload: defineRoute({
    method: 'POST',
    path: '/api/v1/workspaces/:workspaceId/logo-upload',
    access: 'workspace:update',
    summary: 'Presigned URL for uploading the workspace logo',
    params: workspaceParams,
    body: ImageUploadRequest,
    responses: { 201: ImageUploadTicket },
  }),
  deleteWorkspace: defineRoute({
    method: 'DELETE',
    path: '/api/v1/workspaces/:workspaceId',
    access: 'workspace:delete',
    summary: 'Soft-delete; permanently deleted after 30 days',
    params: workspaceParams,
    body: DeleteWorkspaceBody,
    responses: { 204: null },
  }),
  transferOwnership: defineRoute({
    method: 'POST',
    path: '/api/v1/workspaces/:workspaceId/transfer-ownership',
    // Owner only: checked in the service (no permission key is owner-exclusive for this).
    access: 'member',
    summary: 'Make an admin the owner; the current owner becomes an admin',
    params: workspaceParams,
    body: TransferOwnershipBody,
    responses: { 204: null },
  }),

  listMembers: defineRoute({
    method: 'GET',
    path: '/api/v1/workspaces/:workspaceId/members',
    access: 'member',
    summary: 'Members of the workspace',
    params: workspaceParams,
    responses: { 200: z.object({ items: z.array(Member) }) },
  }),
  updateMember: defineRoute({
    method: 'PATCH',
    path: '/api/v1/workspaces/:workspaceId/members/:memberId',
    access: 'members:manage',
    summary: "Change a member's role (account access arrives in phase 4)",
    params: memberParams,
    body: UpdateMemberBody,
    responses: { 200: Member },
  }),
  removeMember: defineRoute({
    method: 'DELETE',
    path: '/api/v1/workspaces/:workspaceId/members/:memberId',
    // `members:manage`, or any member removing themselves (leave): checked in the service.
    access: 'member',
    summary: 'Remove a member, or leave the workspace',
    params: memberParams,
    responses: { 204: null },
  }),

  createInvitation: defineRoute({
    method: 'POST',
    path: '/api/v1/workspaces/:workspaceId/invitations',
    access: 'members:manage',
    summary: 'Invite someone by email with a role (expires in 7 days)',
    params: workspaceParams,
    body: CreateInvitationBody,
    responses: { 201: Invitation },
  }),
  listInvitations: defineRoute({
    method: 'GET',
    path: '/api/v1/workspaces/:workspaceId/invitations',
    access: 'members:manage',
    summary: 'Pending invitations',
    params: workspaceParams,
    responses: { 200: z.object({ items: z.array(Invitation) }) },
  }),
  revokeInvitation: defineRoute({
    method: 'DELETE',
    path: '/api/v1/workspaces/:workspaceId/invitations/:invitationId',
    access: 'members:manage',
    summary: 'Revoke a pending invitation',
    params: invitationParams,
    responses: { 204: null },
  }),
  getInvitation: defineRoute({
    method: 'GET',
    path: '/api/v1/invitations/:invitationId',
    // Public so the invite page works before sign-in; returns only the preview fields.
    access: 'public',
    summary: 'Invitation preview for the invite page',
    params: z.object({ invitationId: Id }),
    responses: { 200: InvitationPreview },
  }),
  acceptInvitation: defineRoute({
    method: 'POST',
    path: '/api/v1/invitations/:invitationId/accept',
    // The signed-in user's verified email must match the invitation: checked in the service.
    access: 'user',
    summary: 'Accept an invitation and join the workspace',
    params: z.object({ invitationId: Id }),
    responses: { 200: WorkspaceWithRole },
  }),
  declineInvitation: defineRoute({
    method: 'POST',
    path: '/api/v1/invitations/:invitationId/decline',
    access: 'user',
    summary: 'Decline an invitation',
    params: z.object({ invitationId: Id }),
    responses: { 204: null },
  }),
};
