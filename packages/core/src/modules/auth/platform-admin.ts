import { forbidden, type AuthContext, type Db, type Kv } from '../../platform';

/**
 * Marks that a session passed a two-factor check (docs/backend/modules/admin.md, Access). Kept
 * for longer than any session lives; a session id is never reused, so the mark ends with it.
 */
export const twoFactorVerifiedKey = (sessionId: string) => `2fa-verified:${sessionId}`;
export const TWO_FACTOR_MARK_TTL_SEC = 60 * 24 * 3600;

/** Better Auth endpoints that pass a two-factor check when they succeed. */
export const TWO_FACTOR_VERIFY_PATHS = [
  '/two-factor/verify-totp',
  '/two-factor/verify-otp',
  '/two-factor/verify-backup-code',
];

/**
 * The guard on every /api/admin route and Bull Board: a platform admin, with 2FA on, who passed
 * a 2FA check in this session (at sign-in, when turning it on, or again later). A session made
 * by Google, a magic link or a trusted device never did, so it must verify before using the
 * console.
 */
export function createPlatformAdminGuard({ db, kv }: { db: Db; kv: Kv }) {
  return async (auth: AuthContext) => {
    // Read fresh, not from the session (Better Auth caches the user in it): taking admin away,
    // or turning 2FA off, applies at once.
    const [user, verified] = await Promise.all([
      db.client.user.findUnique({
        where: { id: auth.user.id },
        select: { isPlatformAdmin: true, twoFactorEnabled: true },
      }),
      kv.get(twoFactorVerifiedKey(auth.session.id)),
    ]);
    if (!user?.isPlatformAdmin) {
      throw forbidden('NOT_PLATFORM_ADMIN', 'Only Socioboard platform admins can use this');
    }
    if (!user.twoFactorEnabled || !verified) {
      throw forbidden(
        'ADMIN_2FA_REQUIRED',
        'Turn on two-factor authentication and verify a code in this session to use the admin console',
      );
    }
  };
}
