import type { ImageUploadTicket, Me, SessionInfo, UpdateMeBody } from '@socioboard/contracts';
import type { z } from 'zod';

import {
  AppError,
  createUrlSigner,
  newId,
  notFound,
  unprocessable,
  type AuthContext,
  type Clock,
  type Db,
  type Logger,
  type MembershipLookup,
  type Storage,
} from '../../platform';
import type { Auth } from './auth';

export interface MeServiceDeps {
  auth: Auth;
  db: Db;
  storage: Storage | undefined;
  lookupMembership: MembershipLookup;
  clock: Clock;
  logger: Logger;
}

const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
const AVATAR_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};
const UPLOAD_TTL_SEC = 15 * 60;

/** Response headers from a Better Auth call (e.g. a refreshed cookie) the route must forward. */
export interface WithCookies<T> {
  value: T;
  setCookies: string[];
}

export function createMeService({
  auth,
  db,
  storage,
  lookupMembership,
  clock,
  logger,
}: MeServiceDeps) {
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

  async function getMe(caller: AuthContext): Promise<Me> {
    const user = await db.client.user.findUniqueOrThrow({ where: { id: caller.user.id } });
    const memberships = await db.client.member.findMany({
      where: { userId: user.id, workspace: { deletedAt: null } },
      include: {
        workspace: { select: { id: true, name: true, slug: true, logo: true, timezone: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
    const activeId = caller.session.activeWorkspaceId;
    const stillMember = activeId !== null && memberships.some((m) => m.workspaceId === activeId);
    return {
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
        name: user.name,
        avatarUrl: await signUrl(user.avatarKey ?? user.image),
        timezone: user.timezone,
        locale: user.locale,
        twoFactorEnabled: user.twoFactorEnabled,
        isPlatformAdmin: user.isPlatformAdmin,
        createdAt: user.createdAt.toISOString(),
      },
      memberships: await Promise.all(
        memberships.map(async (m) => ({
          workspace: {
            id: m.workspace.id,
            name: m.workspace.name,
            slug: m.workspace.slug,
            logoUrl: await signUrl(m.workspace.logo),
            timezone: m.workspace.timezone,
          },
          // Roles are validated when written; the contract rejects anything else.
          role: m.role as Me['memberships'][number]['role'],
        })),
      ),
      activeWorkspaceId: stillMember ? activeId : null,
    };
  }

  /** Checks an uploaded avatar before it is attached: the caller's own key, present, small, an image. */
  async function assertAvatarUploaded(userId: string, key: string) {
    const info = key.startsWith(`avatars/${userId}/`)
      ? await requireStorage().head(key)
      : undefined;
    if (
      !info ||
      info.size > AVATAR_MAX_BYTES ||
      !(info.contentType && info.contentType in AVATAR_EXTENSIONS)
    ) {
      throw unprocessable('AVATAR_NOT_UPLOADED', 'Upload the avatar image first, then save it');
    }
  }

  async function updateMe(
    caller: AuthContext,
    headers: Headers,
    body: z.infer<typeof UpdateMeBody>,
  ): Promise<WithCookies<Me>> {
    let setCookies: string[] = [];
    const { avatarKey, ...profile } = body;
    if (Object.keys(profile).length > 0) {
      // Through Better Auth, so its cached copy of the user (in the session) stays current.
      const result = await auth.api.updateUser({ body: profile, headers, returnHeaders: true });
      setCookies = result.headers.getSetCookie();
    }
    if (avatarKey !== undefined) {
      if (avatarKey !== null) await assertAvatarUploaded(caller.user.id, avatarKey);
      const before = await db.client.user.findUniqueOrThrow({
        where: { id: caller.user.id },
        select: { avatarKey: true },
      });
      await db.client.user.update({ where: { id: caller.user.id }, data: { avatarKey } });
      if (storage && before.avatarKey && before.avatarKey !== avatarKey) {
        storage.delete(before.avatarKey).catch((err: unknown) => {
          logger.warn({ err, key: before.avatarKey }, 'could not delete the old avatar');
        });
      }
    }
    return { value: await getMe(caller), setCookies };
  }

  async function createAvatarUpload(
    caller: AuthContext,
    body: { mime: string; sizeBytes: number },
  ): Promise<ImageUploadTicket> {
    const store = requireStorage();
    const key = `avatars/${caller.user.id}/${newId()}.${AVATAR_EXTENSIONS[body.mime] ?? 'img'}`;
    const uploadUrl = await store.presignPut(key, body.mime, {
      expiresInSec: UPLOAD_TTL_SEC,
      contentLength: body.sizeBytes,
    });
    return {
      uploadUrl,
      key,
      expiresAt: new Date(clock.now().getTime() + UPLOAD_TTL_SEC * 1000).toISOString(),
    };
  }

  async function setActiveWorkspace(
    caller: AuthContext,
    headers: Headers,
    workspaceId: string,
  ): Promise<string[]> {
    // Same answer for "no such workspace" and "not a member", like every workspace route.
    if (!(await lookupMembership(caller.user.id, workspaceId))) {
      throw notFound('WORKSPACE_NOT_FOUND', 'Workspace not found');
    }
    const result = await auth.api.setActiveOrganization({
      body: { organizationId: workspaceId },
      headers,
      returnHeaders: true,
    });
    return result.headers.getSetCookie();
  }

  async function listSessions(caller: AuthContext, headers: Headers): Promise<SessionInfo[]> {
    const sessions = await auth.api.listSessions({ headers });
    return sessions
      .map((s) => ({
        id: s.id,
        createdAt: new Date(s.createdAt).toISOString(),
        expiresAt: new Date(s.expiresAt).toISOString(),
        ipAddress: s.ipAddress ?? null,
        userAgent: s.userAgent ?? null,
        current: s.id === caller.session.id,
      }))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async function revokeSession(caller: AuthContext, headers: Headers, sessionId: string) {
    // Look it up among the caller's own sessions only: another user's id is simply not found.
    const target = await db.client.session.findFirst({
      where: { id: sessionId, userId: caller.user.id },
      select: { token: true },
    });
    if (!target) throw notFound('SESSION_NOT_FOUND', 'Session not found');
    await auth.api.revokeSession({ body: { token: target.token }, headers });
  }

  return { getMe, updateMe, createAvatarUpload, setActiveWorkspace, listSessions, revokeSession };
}

export type MeService = ReturnType<typeof createMeService>;
