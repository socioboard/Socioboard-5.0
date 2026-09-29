import { createFileRoute, redirect } from '@tanstack/react-router';

import { routeAfterSignIn } from '../lib/redirect';
import { stringParam } from '../lib/route-guards';
import { authOptionsQuery, meQuery } from '../lib/session';

// The app has no start page: signed-in people go to their workspace (or setup), others sign in.
export const Route = createFileRoute('/')({
  // A connect whose sign-in link was unknown or used comes back here, with no workspace to
  // return to (docs/backend/modules/social-accounts.md, "Callback rules").
  validateSearch: (search): { connectError?: string | undefined } => ({
    connectError: stringParam(search.connectError, 64),
  }),
  beforeLoad: async ({ context: { queryClient }, search }) => {
    const me = await queryClient.query({ ...meQuery, staleTime: 'static' });
    if (!me) throw redirect({ to: '/login', replace: true });
    const options = await queryClient.query({ ...authOptionsQuery, staleTime: 'static' });
    const target = routeAfterSignIn(me, options);
    // The accounts page of the workspace they'd land in says what went wrong.
    const slug = /^\/w\/([^/?#]+)/.exec(target)?.[1];
    if (search.connectError && slug) {
      throw redirect({
        to: '/w/$slug/accounts',
        params: { slug: decodeURIComponent(slug) },
        search: { connectError: search.connectError },
        replace: true,
      });
    }
    throw redirect({ href: target, replace: true });
  },
});
