// Routes of the auth module that we own. Sign-up, sign-in, magic link, reset and 2FA are served
// by Better Auth at /api/auth/* and are not declared here (docs/backend/modules/auth.md).
import { z } from 'zod';

import { Id, IsoDateTime } from './common';
import { ImageUploadRequest, ImageUploadTicket, Locale, PersonName, Timezone } from './fields';
import { ROLES } from './permissions';
import { defineRoute } from './route';

export const Me = z.object({
  user: z.object({
    id: Id,
    email: z.string(),
    emailVerified: z.boolean(),
    name: z.string(),
    avatarUrl: z.url().nullable(),
    timezone: z.string().nullable(),
    locale: z.string(),
    twoFactorEnabled: z.boolean(),
    isPlatformAdmin: z.boolean(),
    createdAt: IsoDateTime,
  }),
  /** Every workspace the user belongs to, for the switcher and post-sign-in routing. */
  memberships: z.array(
    z.object({
      workspace: z.object({
        id: Id,
        name: z.string(),
        slug: z.string(),
        logoUrl: z.url().nullable(),
      }),
      role: z.enum(ROLES),
    }),
  ),
  activeWorkspaceId: Id.nullable(),
});
export type Me = z.infer<typeof Me>;

export const UpdateMeBody = z
  .object({
    name: PersonName,
    /** Key from `POST /me/avatar-upload`, or null to remove the avatar. */
    avatarKey: z.string().nullable(),
    timezone: Timezone,
    locale: Locale,
  })
  .partial()
  .refine((b) => Object.keys(b).length > 0, 'Nothing to update');

export const SetActiveWorkspaceBody = z.object({ workspaceId: Id });

export const SessionInfo = z.object({
  id: Id,
  createdAt: IsoDateTime,
  expiresAt: IsoDateTime,
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  /** The session making this request. */
  current: z.boolean(),
});
export type SessionInfo = z.infer<typeof SessionInfo>;

/** What the sign-in screens should offer on this server (public; no secrets). */
export const AuthOptions = z.object({
  /** Social sign-in providers with credentials configured. */
  socialProviders: z.array(z.enum(['google', 'microsoft'])),
  /** New accounts must verify their email before creating or joining a workspace. */
  emailVerificationRequired: z.boolean(),
});
export type AuthOptions = z.infer<typeof AuthOptions>;

export const authRoutes = {
  getAuthOptions: defineRoute({
    method: 'GET',
    path: '/api/v1/auth/options',
    access: 'public',
    summary: 'Sign-in methods this server offers',
    responses: { 200: AuthOptions },
  }),
  getMe: defineRoute({
    method: 'GET',
    path: '/api/v1/me',
    access: 'user',
    summary: 'Current user, memberships and active workspace',
    responses: { 200: Me },
  }),
  updateMe: defineRoute({
    method: 'PATCH',
    path: '/api/v1/me',
    access: 'user',
    summary: 'Update name, avatar, timezone or locale',
    body: UpdateMeBody,
    responses: { 200: Me },
  }),
  createAvatarUpload: defineRoute({
    method: 'POST',
    path: '/api/v1/me/avatar-upload',
    access: 'user',
    summary: 'Presigned URL for uploading an avatar image',
    body: ImageUploadRequest,
    responses: { 201: ImageUploadTicket },
  }),
  setActiveWorkspace: defineRoute({
    method: 'POST',
    path: '/api/v1/me/active-workspace',
    access: 'user',
    summary: 'Switch the active workspace (must be a member)',
    body: SetActiveWorkspaceBody,
    responses: { 204: null },
  }),
  listSessions: defineRoute({
    method: 'GET',
    path: '/api/v1/me/sessions',
    access: 'user',
    summary: 'Active sessions of the current user',
    responses: { 200: z.object({ items: z.array(SessionInfo) }) },
  }),
  revokeSession: defineRoute({
    method: 'DELETE',
    path: '/api/v1/me/sessions/:sessionId',
    access: 'user',
    summary: 'Sign out one of my sessions',
    params: z.object({ sessionId: Id }),
    responses: { 204: null },
  }),
};
