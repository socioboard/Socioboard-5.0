import { createFileRoute, redirect } from '@tanstack/react-router';

import { routeAfterSignIn } from '../lib/redirect';
import { authOptionsQuery, meQuery } from '../lib/session';

// The app has no start page: signed-in people go to their workspace (or setup), others sign in.
export const Route = createFileRoute('/')({
  beforeLoad: async ({ context: { queryClient } }) => {
    const me = await queryClient.query({ ...meQuery, staleTime: 'static' });
    if (!me) throw redirect({ to: '/login', replace: true });
    const options = await queryClient.query({ ...authOptionsQuery, staleTime: 'static' });
    throw redirect({ href: routeAfterSignIn(me, options), replace: true });
  },
});
