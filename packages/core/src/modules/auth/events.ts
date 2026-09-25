/** Events the auth module emits (docs/backend/modules/auth.md); audit listens to all of them. */
export interface AuthEvents extends Record<string, unknown> {
  'user.signed_up': { userId: string; email: string };
  'user.signed_in': { userId: string; sessionId: string; ipAddress: string | null };
  'user.password_changed': { userId: string };
}
