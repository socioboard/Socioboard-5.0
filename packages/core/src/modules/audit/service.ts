import type { Prisma } from '@socioboard/db';

import { getRequestContext, newId, redactSecrets, type Clock, type Db } from '../../platform';

/** One audit entry. Actions are `entity.verb` (`member.role_changed`, `workspace.deleted`). */
export interface AuditEntry {
  /** Null for platform-level actions outside any workspace (sign-up, admin actions). */
  workspaceId: string | null;
  actor: { userId: string | null; type: 'user' | 'admin' | 'system' };
  action: string;
  entity: { type: string; id: string | null };
  /** What changed or extra facts; secrets are stripped before storing. */
  diff?: Record<string, unknown>;
  /** Defaults to the current request's client IP and user agent. */
  ip?: string | null;
  userAgent?: string | null;
}

export interface AuditLog {
  /** Appends one entry. There is no update or delete: the log is append-only. */
  record(entry: AuditEntry): Promise<void>;
  /** Deletes entries older than the retention period; returns how many. */
  purgeExpired(retentionDays: number): Promise<number>;
}

export function createAuditLog({ db, clock }: { db: Db; clock: Clock }): AuditLog {
  return {
    async record(entry) {
      const request = getRequestContext();
      await db.client.auditLog.create({
        data: {
          id: newId(),
          workspaceId: entry.workspaceId,
          actorUserId: entry.actor.userId,
          actorType: entry.actor.type,
          action: entry.action,
          entityType: entry.entity.type,
          entityId: entry.entity.id,
          ...(entry.diff ? { diff: redactSecrets(entry.diff) as Prisma.InputJsonValue } : {}),
          ip: entry.ip !== undefined ? entry.ip : (request?.ip ?? null),
          userAgent: entry.userAgent !== undefined ? entry.userAgent : (request?.userAgent ?? null),
        },
      });
    },

    async purgeExpired(retentionDays) {
      const cutoff = new Date(clock.now().getTime() - retentionDays * 24 * 60 * 60 * 1000);
      const { count } = await db.client.auditLog.deleteMany({
        where: { createdAt: { lt: cutoff } },
      });
      return count;
    },
  };
}
