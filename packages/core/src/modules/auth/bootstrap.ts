import type { Db, Logger } from '../../platform';

/** Arbitrary constant key for the Postgres advisory lock that serializes the check below. */
const BOOTSTRAP_LOCK = 6_000_001;

/**
 * First-user bootstrap (docs/backend/modules/auth.md): on a fresh install, the first account
 * becomes platform admin. Runs after every user is created and promotes the new user only if no
 * platform admin exists yet AND they are the oldest user, so:
 * - two sign-ups racing on an empty install produce exactly one admin (the lock serializes them);
 * - an install that has users but lost its admin does not hand admin to whoever signs up next.
 * Returns true when this user was promoted.
 */
export async function promoteFirstUser(db: Db, userId: string, logger: Logger): Promise<boolean> {
  const promoted = await db.client.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(${BOOTSTRAP_LOCK})`;
    const admin = await tx.user.findFirst({
      where: { isPlatformAdmin: true },
      select: { id: true },
    });
    if (admin) return false;
    const oldest = await tx.user.findFirst({
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      select: { id: true },
    });
    if (oldest?.id !== userId) return false;
    await tx.user.update({ where: { id: userId }, data: { isPlatformAdmin: true } });
    return true;
  });
  if (promoted) logger.info({ userId }, 'first user promoted to platform admin');
  return promoted;
}
