// Where to come back to after a trip through a network's sign-in page (connecting an account),
// when it isn't the Accounts page: onboarding step 2 continues with step 3. Kept in
// sessionStorage, so it lives in this tab only and survives the redirect; if it's lost, the
// user simply lands on the Accounts page. Only the app's own paths are followed (safeRedirect).
import { safeRedirect } from './redirect';

const KEY = 'sb-connect-return';

/** Remember `path` as where connecting an account in this workspace should end. */
export function rememberConnectReturn(workspaceId: string, path: string) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ workspaceId, path }));
  } catch {
    // Storage blocked: the Accounts page is where they land instead.
  }
}

export function forgetConnectReturn() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // nothing stored
  }
}

/** The path to return to for this workspace, if one was remembered; it's forgotten once read. */
export function takeConnectReturn(workspaceId: string): string | undefined {
  try {
    const raw = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
    const stored: unknown = raw ? JSON.parse(raw) : null;
    if (typeof stored !== 'object' || stored === null) return undefined;
    const { workspaceId: id, path } = stored as Record<string, unknown>;
    return id === workspaceId ? safeRedirect(path) : undefined;
  } catch {
    return undefined;
  }
}
