import { createFileRoute, notFound } from '@tanstack/react-router';

import { AdminShell } from '../features/admin';
import { requireSignedIn } from '../lib/route-guards';

// Platform admins only. Anyone else gets "page not found", as if it weren't there; the API checks
// every request too (and wants 2FA verified in the session, which the shell explains).
export const Route = createFileRoute('/admin')({
  beforeLoad: async ({ context, location }) => {
    const me = await requireSignedIn(context.queryClient, location.href);
    if (!me.user.isPlatformAdmin) throw notFound();
  },
  component: AdminShell,
});
