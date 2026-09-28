import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useCallback } from 'react';

import { authClient } from '../../lib/auth-client';
import { routeAfterSignIn, safeRedirect } from '../../lib/redirect';
import { authOptionsQuery, meQuery, notifySignedOut } from '../../lib/session';

/** After any successful sign-in: refresh who we are, then go to `redirect` or the right place. */
export function useFinishSignIn() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useCallback(
    async (redirect?: string) => {
      await queryClient.invalidateQueries({ queryKey: meQuery.queryKey });
      const [me, options] = await Promise.all([
        queryClient.query(meQuery),
        queryClient.query({ ...authOptionsQuery, staleTime: 'static' }),
      ]);
      const target = safeRedirect(redirect) ?? (me ? routeAfterSignIn(me, options) : '/login');
      await navigate({ href: target, replace: true });
    },
    [queryClient, navigate],
  );
}

/** Signs out and forgets every cached answer, so the next person on this browser sees nothing. */
export function useSignOut() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useCallback(
    async (to = '/login') => {
      await authClient.signOut();
      queryClient.clear();
      notifySignedOut();
      await navigate({ href: to, replace: true });
    },
    [queryClient, navigate],
  );
}
