import { createFileRoute, redirect } from '@tanstack/react-router';

import { AccountShell } from '../features/shell';
import { requireSignedIn } from '../lib/route-guards';

// Account pages sit in the app shell, on the active workspace; without one, set one up first.
export const Route = createFileRoute('/me')({
  beforeLoad: async ({ context, location }) => {
    const me = await requireSignedIn(context.queryClient, location.href);
    if (me.memberships.length === 0) throw redirect({ to: '/onboarding', replace: true });
  },
  component: AccountShell,
});
