import { apiRoutes } from '@socioboard/contracts';
import { toast } from '@socioboard/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { api, ApiError } from '../../lib/api';
import { meQuery, useMe } from '../../lib/session';

/**
 * A session can end while the app is open (expired, signed out in another tab, revoked from the
 * security page). Any 401 from a query or mutation, or `me` coming back empty on a refetch, drops
 * every cached answer and sends the person to sign in, returning here afterwards.
 */
export function useSessionWatcher() {
  const { t } = useTranslation('shell');
  const queryClient = useQueryClient();
  const router = useRouter();
  const me = useMe();

  useEffect(() => {
    const onError = (error: unknown) => {
      if (!(error instanceof ApiError) || error.status !== 401) return;
      // Our API's UNAUTHENTICATED means no session. Better Auth also answers 401 for a wrong 2FA
      // or backup code, or a bad token, while the session is fine; for those, ask the server who
      // is signed in, and let that answer decide. Either way the effect below does the cleanup.
      if (error.code === 'UNAUTHENTICATED') queryClient.setQueryData(meQuery.queryKey, null);
      else void queryClient.invalidateQueries({ queryKey: meQuery.queryKey });
    };
    const unsubscribeQueries = queryClient.getQueryCache().subscribe((event) => {
      if (event.type === 'updated' && event.action.type === 'error') onError(event.action.error);
    });
    const unsubscribeMutations = queryClient.getMutationCache().subscribe((event) => {
      if (event.type === 'updated' && event.action.type === 'error') onError(event.action.error);
    });
    return () => {
      unsubscribeQueries();
      unsubscribeMutations();
    };
  }, [queryClient]);

  const signedOut = me.data === null;
  useEffect(() => {
    if (!signedOut) return;
    // Nothing from this session may show to whoever signs in next on this browser.
    queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== meQuery.queryKey[0] });
    queryClient.getMutationCache().clear();
    // Long enough to read on the sign-in page it explains.
    toast(t('session.ended'), { id: 'session-ended', duration: 10_000 });
    const here = router.state.location.href;
    void router.navigate({ to: '/login', search: { redirect: here }, replace: true });
  }, [signedOut, queryClient, router, t]);
}

/**
 * Opening a workspace makes it the active one on the server, so the next sign-in (on any device)
 * returns to it. Fire and forget: a failure only means the next sign-in opens another workspace.
 */
export function useActiveWorkspaceSync(workspaceId: string, activeWorkspaceId: string | null) {
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: (id: string) =>
      api(apiRoutes.auth.setActiveWorkspace, { body: { workspaceId: id } }),
    onSuccess: (_data, id) => {
      queryClient.setQueryData(meQuery.queryKey, (me) =>
        me ? { ...me, activeWorkspaceId: id } : me,
      );
    },
  });
  useEffect(() => {
    if (workspaceId !== activeWorkspaceId) mutate(workspaceId);
  }, [workspaceId, activeWorkspaceId, mutate]);
}

const SIDEBAR_KEY = 'sb-sidebar';

/** Collapsed (icons only) or expanded, remembered per browser (a UI preference, not data). */
export function useSidebarCollapsed(): [boolean, (collapsed: boolean) => void] {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_KEY) === 'collapsed';
    } catch {
      return false;
    }
  });
  const update = useCallback((next: boolean) => {
    setCollapsed(next);
    try {
      localStorage.setItem(SIDEBAR_KEY, next ? 'collapsed' : 'expanded');
    } catch {
      // Private mode or blocked storage: the choice lasts for this page only.
    }
  }, []);
  return [collapsed, update];
}

/** ⌘K on Mac, Ctrl+K elsewhere; works from any field (including the palette's own search box). */
export function useCommandShortcut(onTrigger: () => void) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey) && !event.altKey) {
        event.preventDefault();
        onTrigger();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onTrigger]);
}

/** "⌘K" on Apple devices, "Ctrl K" elsewhere. */
export function commandShortcutLabel(): string {
  const platform =
    (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ??
    navigator.platform;
  return /mac|iphone|ipad/i.test(platform) ? '⌘K' : 'Ctrl K';
}
