import { randomBytes } from 'node:crypto';

import type {
  AssignableRole,
  ImageUploadTicket,
  Invitation,
  InvitationPreview,
  Member,
  Role,
  UpdateWorkspaceBody,
  WorkspaceWithRole,
} from '@socioboard/contracts';
import type { Prisma } from '@socioboard/db';
import type { z } from 'zod';

import {
  AppError,
  conflict,
  createUrlSigner,
  forbidden,
  newId,
  notFound,
  typedEvents,
  unprocessable,
  type AuthContext,
  type Clock,
  type Db,
  type EventBus,
  type Logger,
  type Mailer,
  type MemberContext,
  type Storage,
} from '../../platform';
import { invitation as invitationEmail } from '@socioboard/emails';
import type { WorkspaceEvents } from './events';

/** The two Better Auth calls this module needs; passed in so modules don't import each other's internals. */
export interface WorkspaceAuthPort {
  /** Creates the workspace and its owner membership, and makes it the active workspace. */
  createWorkspace(input: {
    headers: Headers;
    name: string;
    slug: string;
    timezone: string;
  }): Promise<{ id: string; setCookies: string[] }>;
  /** Makes a workspace the session's active one. */
  setActiveWorkspace(headers: Headers, workspaceId: string): Promise<string[]>;
}

export interface WorkspaceServiceDeps {
  db: Db;
  authPort: WorkspaceAuthPort;
  storage: Storage | undefined;
  mailer: Mailer;
  /** The app-wide bus; this module emits WorkspaceEvents on it. */
  events: EventBus<Record<string, unknown>>;
  clock: Clock;
  logger: Logger;
  appUrl: string;
  /** Email verification is enforced only when the server can send the verification email. */
  requireVerifiedEmail: boolean;
}

const INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const LOGO_MAX_BYTES = 2 * 1024 * 1024;
const IMAGE_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};
const UPLOAD_TTL_SEC = 15 * 60;

/** Better Auth's invitation statuses → the API's. */
function invitationStatus(status: string, expiresAt: Date, now: Date): Invitation['status'] {
  if (status === 'pending') return expiresAt <= now ? 'expired' : 'pending';
  if (status === 'accepted') return 'accepted';
  if (status === 'rejected') return 'declined';
  return 'revoked';
}

/** "chethan@example.com" → "c•••n@example.com" for the public invite page. */
export function maskEmail(email: string): string {
  const [local = '', domain = ''] = email.split('@');
  const shown =
    local.length <= 2 ? `${local.slice(0, 1)}•••` : `${local.slice(0, 1)}•••${local.slice(-1)}`;
  return `${shown}@${domain}`;
}

/** URL-safe slug from a workspace name; the caller adds a suffix when it is taken. */
export function slugify(name: string): string {
  const base = name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
    .replace(/-+$/g, '');
  return base.length >= 3 ? base : `workspace${base ? `-${base}` : ''}`;
}

const isAssignable = (role: string): role is AssignableRole =>
  ['admin', 'editor', 'contributor', 'viewer'].includes(role);

export function createWorkspaceService(deps: WorkspaceServiceDeps) {
  const { db, authPort, storage, mailer, clock, logger, appUrl } = deps;
  const events = typedEvents<WorkspaceEvents>(deps.events);
  const signUrl = createUrlSigner(storage);
  const requireStorage = () => {
    if (!storage) {
      throw new AppError(
        503,
        'STORAGE_NOT_CONFIGURED',
        'File storage is not configured on this server',
      );
    }
    return storage;
  };
  const assertVerified = (caller: AuthContext) => {
    if (deps.requireVerifiedEmail && !caller.user.emailVerified) {
      throw forbidden('EMAIL_NOT_VERIFIED', 'Verify your email address first');
    }
  };

  async function toWorkspace(
    w: {
      id: string;
      name: string;
      slug: string;
      logo: string | null;
      timezone: string;
      requireReviewForAll: boolean;
      createdAt: Date;
    },
    myRole: Role,
  ): Promise<WorkspaceWithRole> {
    return {
      id: w.id,
      name: w.name,
      slug: w.slug,
      logoUrl: await signUrl(w.logo),
      timezone: w.timezone,
      requireReviewForAll: w.requireReviewForAll,
      createdAt: w.createdAt.toISOString(),
      myRole,
    };
  }

  const userSummary = async (u: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    avatarKey: string | null;
  }) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    avatarUrl: await signUrl(u.avatarKey ?? u.image),
  });

  async function liveWorkspace(workspaceId: string) {
    const w = await db.client.workspace.findFirst({ where: { id: workspaceId, deletedAt: null } });
    if (!w) throw notFound('WORKSPACE_NOT_FOUND', 'Workspace not found');
    return w;
  }

  async function slugAvailable(slug: string, exceptId?: string) {
    const taken = await db.client.workspace.findUnique({ where: { slug }, select: { id: true } });
    return !taken || taken.id === exceptId;
  }

  // ---------------------------------------------------------------- workspaces

  async function create(
    caller: AuthContext,
    headers: Headers,
    body: { name: string; slug?: string | undefined; timezone: string },
  ): Promise<{ value: WorkspaceWithRole; setCookies: string[] }> {
    assertVerified(caller);
    let slug = body.slug;
    if (slug) {
      if (!(await slugAvailable(slug)))
        throw conflict('SLUG_TAKEN', 'That address is already taken');
    } else {
      const base = slugify(body.name);
      slug = base;
      for (let i = 0; !(await slugAvailable(slug)); i++) {
        if (i >= 5) throw conflict('SLUG_TAKEN', 'Choose an address for the workspace');
        slug = `${base.slice(0, 40)}-${randomBytes(3).toString('hex')}`;
      }
    }
    const { id, setCookies } = await authPort.createWorkspace({
      headers,
      name: body.name,
      slug,
      timezone: body.timezone,
    });
    await events.emit('workspace.created', { workspaceId: id, userId: caller.user.id });
    return { value: await toWorkspace(await liveWorkspace(id), 'owner'), setCookies };
  }

  async function list(caller: AuthContext): Promise<WorkspaceWithRole[]> {
    const memberships = await db.client.member.findMany({
      where: { userId: caller.user.id, workspace: { deletedAt: null } },
      include: { workspace: true },
      orderBy: { createdAt: 'asc' },
    });
    return Promise.all(memberships.map((m) => toWorkspace(m.workspace, m.role as Role)));
  }

  async function get(member: MemberContext): Promise<WorkspaceWithRole> {
    return toWorkspace(await liveWorkspace(member.workspaceId), member.role);
  }

  async function assertLogoUploaded(workspaceId: string, key: string) {
    const info = key.startsWith(`workspaces/${workspaceId}/logo/`)
      ? await requireStorage().head(key)
      : undefined;
    if (
      !info ||
      info.size > LOGO_MAX_BYTES ||
      !(info.contentType && info.contentType in IMAGE_EXTENSIONS)
    ) {
      throw unprocessable('LOGO_NOT_UPLOADED', 'Upload the logo image first, then save it');
    }
  }

  async function update(
    caller: AuthContext,
    member: MemberContext,
    body: z.infer<typeof UpdateWorkspaceBody>,
  ): Promise<WorkspaceWithRole> {
    const current = await liveWorkspace(member.workspaceId);
    if (body.slug !== undefined && !(await slugAvailable(body.slug, current.id))) {
      throw conflict('SLUG_TAKEN', 'That address is already taken');
    }
    if (body.logoKey) await assertLogoUploaded(current.id, body.logoKey);
    const { logoKey, ...rest } = body;
    // Only the fields that were sent; undefined means "leave as is".
    const data: Prisma.WorkspaceUpdateInput = Object.fromEntries(
      Object.entries({ ...rest, logo: logoKey }).filter(([, v]) => v !== undefined),
    );
    const updated = await db.client.workspace.update({ where: { id: current.id }, data });
    if (storage && logoKey !== undefined && current.logo && current.logo !== logoKey) {
      storage.delete(current.logo).catch((err: unknown) => {
        logger.warn({ err, key: current.logo }, 'could not delete the old logo');
      });
    }
    await events.emit('workspace.updated', {
      workspaceId: current.id,
      userId: caller.user.id,
      fields: Object.keys(body),
    });
    return toWorkspace(updated, member.role);
  }

  async function createLogoUpload(
    member: MemberContext,
    body: { mime: string; sizeBytes: number },
  ): Promise<ImageUploadTicket> {
    const store = requireStorage();
    const key = `workspaces/${member.workspaceId}/logo/${newId()}.${IMAGE_EXTENSIONS[body.mime] ?? 'img'}`;
    return {
      uploadUrl: await store.presignPut(key, body.mime, {
        expiresInSec: UPLOAD_TTL_SEC,
        contentLength: body.sizeBytes,
      }),
      key,
      expiresAt: new Date(clock.now().getTime() + UPLOAD_TTL_SEC * 1000).toISOString(),
    };
  }

  async function remove(caller: AuthContext, member: MemberContext, confirmName: string) {
    const current = await liveWorkspace(member.workspaceId);
    if (confirmName.trim() !== current.name) {
      throw unprocessable('CONFIRMATION_MISMATCH', 'Type the workspace name exactly to delete it');
    }
    const now = clock.now();
    await db.client.$transaction([
      db.client.workspace.update({ where: { id: current.id }, data: { deletedAt: now } }),
      db.client.invitation.updateMany({
        where: { workspaceId: current.id, status: 'pending' },
        data: { status: 'canceled' },
      }),
    ]);
    // Later phases add: cancel scheduled publish jobs, revoke stored social tokens.
    await events.emit('workspace.deleted', { workspaceId: current.id, userId: caller.user.id });
  }

  async function transferOwnership(
    caller: AuthContext,
    member: MemberContext,
    targetMemberId: string,
  ) {
    if (member.role !== 'owner')
      throw forbidden('OWNER_ONLY', 'Only the owner can transfer ownership');
    const scoped = db.forWorkspace(member.workspaceId);
    const target = await scoped.member.findUnique({ where: { id: targetMemberId } });
    if (!target) throw notFound('MEMBER_NOT_FOUND', 'Member not found');
    if (target.role !== 'admin') {
      throw unprocessable(
        'TARGET_NOT_ADMIN',
        'Only an admin can become the owner; make them an admin first',
      );
    }
    // Both changes or neither, and only if the roles are still what we checked (no double transfer).
    await db.client.$transaction(async (tx) => {
      const demoted = await tx.member.updateMany({
        where: { id: member.memberId, workspaceId: member.workspaceId, role: 'owner' },
        data: { role: 'admin' },
      });
      const promoted = await tx.member.updateMany({
        where: { id: target.id, workspaceId: member.workspaceId, role: 'admin' },
        data: { role: 'owner' },
      });
      if (demoted.count !== 1 || promoted.count !== 1) {
        throw conflict('OWNERSHIP_CHANGED', 'Roles changed meanwhile; reload and try again');
      }
    });
    await events.emit('workspace.ownership_transferred', {
      workspaceId: member.workspaceId,
      fromUserId: caller.user.id,
      toUserId: target.userId,
    });
  }

  // ---------------------------------------------------------------- members

  async function listMembers(member: MemberContext): Promise<Member[]> {
    const members = await db.forWorkspace(member.workspaceId).member.findMany({
      include: { user: true },
      orderBy: { createdAt: 'asc' },
    });
    return Promise.all(
      members.map(async (m) => ({
        id: m.id,
        user: await userSummary(m.user),
        role: m.role as Role,
        joinedAt: m.createdAt.toISOString(),
      })),
    );
  }

  async function updateMember(
    caller: AuthContext,
    member: MemberContext,
    targetMemberId: string,
    role: AssignableRole,
  ): Promise<Member> {
    const scoped = db.forWorkspace(member.workspaceId);
    const target = await scoped.member.findUnique({
      where: { id: targetMemberId },
      include: { user: true },
    });
    if (!target) throw notFound('MEMBER_NOT_FOUND', 'Member not found');
    if (target.role === 'owner') {
      throw forbidden(
        'CANNOT_CHANGE_OWNER',
        "The owner's role changes only by transferring ownership",
      );
    }
    // Guarded by role in the WHERE too, so a concurrent ownership transfer can't be overwritten.
    const changed = await scoped.member.updateMany({
      where: { id: target.id, role: { not: 'owner' } },
      data: { role },
    });
    if (changed.count !== 1)
      throw conflict('MEMBER_CHANGED', 'Member changed meanwhile; reload and try again');
    await events.emit('member.role_changed', {
      workspaceId: member.workspaceId,
      memberId: target.id,
      from: target.role,
      to: role,
      userId: caller.user.id,
    });
    return {
      id: target.id,
      user: await userSummary(target.user),
      role,
      joinedAt: target.createdAt.toISOString(),
    };
  }

  async function removeMember(
    caller: AuthContext,
    member: MemberContext,
    targetMemberId: string,
    canManageMembers: boolean,
  ) {
    const self = targetMemberId === member.memberId;
    if (!self && !canManageMembers) throw forbidden('FORBIDDEN', 'Your role does not allow this');
    const scoped = db.forWorkspace(member.workspaceId);
    const target = await scoped.member.findUnique({ where: { id: targetMemberId } });
    if (!target) throw notFound('MEMBER_NOT_FOUND', 'Member not found');
    if (target.role === 'owner') {
      throw unprocessable('OWNER_CANNOT_LEAVE', 'The owner must transfer ownership before leaving');
    }
    const removed = await scoped.member.deleteMany({
      where: { id: target.id, role: { not: 'owner' } },
    });
    if (removed.count !== 1)
      throw conflict('MEMBER_CHANGED', 'Member changed meanwhile; reload and try again');
    await events.emit('member.removed', {
      workspaceId: member.workspaceId,
      memberId: target.id,
      removedUserId: target.userId,
      userId: caller.user.id,
    });
  }

  // ---------------------------------------------------------------- invitations

  const toInvitation = async (i: {
    id: string;
    email: string;
    role: string | null;
    status: string;
    expiresAt: Date;
    createdAt: Date;
    inviter: {
      id: string;
      name: string;
      email: string;
      image: string | null;
      avatarKey: string | null;
    };
  }): Promise<Invitation> => ({
    id: i.id,
    email: i.email,
    role: i.role && isAssignable(i.role) ? i.role : 'viewer',
    status: invitationStatus(i.status, i.expiresAt, clock.now()),
    invitedBy: await userSummary(i.inviter),
    expiresAt: i.expiresAt.toISOString(),
    createdAt: i.createdAt.toISOString(),
  });

  async function invite(
    caller: AuthContext,
    member: MemberContext,
    body: { email: string; role: AssignableRole },
  ): Promise<Invitation> {
    const workspace = await liveWorkspace(member.workspaceId);
    const scoped = db.forWorkspace(member.workspaceId);
    const existingMember = await scoped.member.findFirst({
      where: { user: { email: body.email } },
    });
    if (existingMember) throw conflict('ALREADY_MEMBER', 'That person is already a member');
    const now = clock.now();
    const pending = await scoped.invitation.findFirst({
      where: { email: body.email, status: 'pending', expiresAt: { gt: now } },
    });
    if (pending) throw conflict('ALREADY_INVITED', 'That person already has a pending invitation');

    const created = await scoped.invitation.create({
      data: {
        id: newId(),
        workspaceId: member.workspaceId,
        email: body.email,
        role: body.role,
        status: 'pending',
        expiresAt: new Date(now.getTime() + INVITATION_TTL_MS),
        inviterId: caller.user.id,
      },
      include: { inviter: true },
    });
    // In the background: the invite is saved either way, and the email can be re-sent.
    invitationEmail({
      inviter: caller.user.name,
      workspace: workspace.name,
      role: body.role,
      url: `${appUrl}/invite/${created.id}`,
    })
      .then((rendered) => mailer.send({ to: body.email, ...rendered }))
      .catch((err: unknown) => {
        logger.error({ err, invitationId: created.id }, 'invitation email failed');
      });
    await events.emit('member.invited', {
      workspaceId: member.workspaceId,
      invitationId: created.id,
      email: body.email,
      role: body.role,
      userId: caller.user.id,
    });
    return toInvitation(created);
  }

  async function listInvitations(member: MemberContext): Promise<Invitation[]> {
    const invitations = await db.forWorkspace(member.workspaceId).invitation.findMany({
      where: { status: 'pending', expiresAt: { gt: clock.now() } },
      include: { inviter: true },
      orderBy: { createdAt: 'desc' },
    });
    return Promise.all(invitations.map(toInvitation));
  }

  async function revokeInvitation(
    caller: AuthContext,
    member: MemberContext,
    invitationId: string,
  ) {
    const revoked = await db.forWorkspace(member.workspaceId).invitation.updateMany({
      where: { id: invitationId, status: 'pending' },
      data: { status: 'canceled' },
    });
    if (revoked.count !== 1) throw notFound('INVITATION_NOT_FOUND', 'Invitation not found');
    await events.emit('invitation.revoked', {
      workspaceId: member.workspaceId,
      invitationId,
      userId: caller.user.id,
    });
  }

  async function findInvitation(invitationId: string) {
    const invitation = await db.client.invitation.findFirst({
      where: { id: invitationId, workspace: { deletedAt: null } },
      include: { workspace: true, inviter: true },
    });
    if (!invitation) throw notFound('INVITATION_NOT_FOUND', 'Invitation not found');
    return invitation;
  }

  async function preview(invitationId: string): Promise<InvitationPreview> {
    const i = await findInvitation(invitationId);
    return {
      id: i.id,
      workspace: { name: i.workspace.name, logoUrl: await signUrl(i.workspace.logo) },
      role: i.role && isAssignable(i.role) ? i.role : 'viewer',
      invitedByName: i.inviter.name,
      emailHint: maskEmail(i.email),
      status: invitationStatus(i.status, i.expiresAt, clock.now()),
      expiresAt: i.expiresAt.toISOString(),
    };
  }

  /** Loads a pending invitation addressed to the caller; the same 404 for anything else. */
  async function invitationForCaller(caller: AuthContext, invitationId: string) {
    const i = await findInvitation(invitationId);
    if (i.email.toLowerCase() !== caller.user.email.toLowerCase()) {
      // Not "wrong email": that would confirm the invitation exists to someone it wasn't sent to.
      throw notFound('INVITATION_NOT_FOUND', 'Invitation not found');
    }
    const status = invitationStatus(i.status, i.expiresAt, clock.now());
    if (status !== 'pending') {
      throw unprocessable(`INVITATION_${status.toUpperCase()}`, `This invitation is ${status}`);
    }
    return i;
  }

  async function accept(
    caller: AuthContext,
    headers: Headers,
    invitationId: string,
  ): Promise<{ value: WorkspaceWithRole; setCookies: string[] }> {
    // Otherwise anyone could register the invitee's address without owning it and take the seat.
    assertVerified(caller);
    const i = await invitationForCaller(caller, invitationId);
    const role = i.role && isAssignable(i.role) ? i.role : 'viewer';
    const joined = await db.client.$transaction(async (tx) => {
      const claimed = await tx.invitation.updateMany({
        where: { id: i.id, status: 'pending' },
        data: { status: 'accepted' },
      });
      if (claimed.count !== 1) throw conflict('INVITATION_USED', 'This invitation was just used');
      const existing = await tx.member.findUnique({
        where: { workspaceId_userId: { workspaceId: i.workspaceId, userId: caller.user.id } },
      });
      if (existing) return { role: existing.role as Role, isNew: false };
      await tx.member.create({
        data: { id: newId(), workspaceId: i.workspaceId, userId: caller.user.id, role },
      });
      return { role: role as Role, isNew: true };
    });
    const setCookies = await authPort.setActiveWorkspace(headers, i.workspaceId);
    if (joined.isNew) {
      await events.emit('member.joined', {
        workspaceId: i.workspaceId,
        userId: caller.user.id,
        role: joined.role,
        invitationId: i.id,
      });
    }
    return { value: await toWorkspace(i.workspace, joined.role), setCookies };
  }

  async function decline(caller: AuthContext, invitationId: string) {
    const i = await invitationForCaller(caller, invitationId);
    await db.client.invitation.updateMany({
      where: { id: i.id, status: 'pending' },
      data: { status: 'rejected' },
    });
    await events.emit('invitation.declined', {
      workspaceId: i.workspaceId,
      invitationId: i.id,
      userId: caller.user.id,
    });
  }

  return {
    create,
    list,
    get,
    update,
    createLogoUpload,
    remove,
    transferOwnership,
    listMembers,
    updateMember,
    removeMember,
    invite,
    listInvitations,
    revokeInvitation,
    preview,
    accept,
    decline,
  };
}

export type WorkspaceService = ReturnType<typeof createWorkspaceService>;
