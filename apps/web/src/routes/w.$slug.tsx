import { createFileRoute } from '@tanstack/react-router';

import { AppShell } from '../features/shell';
import { requireSignedIn } from '../lib/route-guards';
import { meQuery } from '../lib/session';
import { membershipFor } from '../lib/workspace';

export const Route = createFileRoute('/w/$slug')({
  beforeLoad: async ({ context, params, location }) => {
    const me = await requireSignedIn(context.queryClient, location.href);
    // Not a member per the cached session: ask the server once more (just invited, or joined in
    // another tab) before the shell shows "workspace not found".
    if (!membershipFor(me, params.slug)) {
      await context.queryClient.refetchQueries({ queryKey: meQuery.queryKey, exact: true });
    }
  },
  component: AppShell,
});
