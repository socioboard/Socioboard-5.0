import { createFileRoute, redirect } from '@tanstack/react-router';

import { canInWorkspace } from '../lib/route-guards';

// Settings opens on General for those who can change it, else on Members (everyone can see it).
export const Route = createFileRoute('/w/$slug/settings/')({
  beforeLoad: async ({ context, params }) => {
    const general = await canInWorkspace(context.queryClient, params.slug, 'workspace:update');
    throw redirect({
      to: general ? '/w/$slug/settings/general' : '/w/$slug/settings/members',
      params,
      replace: true,
    });
  },
});
