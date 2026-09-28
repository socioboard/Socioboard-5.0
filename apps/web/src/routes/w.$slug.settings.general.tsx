import { createFileRoute, redirect } from '@tanstack/react-router';

import { GeneralSettings } from '../features/settings';
import { canInWorkspace } from '../lib/route-guards';

export const Route = createFileRoute('/w/$slug/settings/general')({
  // Hidden from roles that can't change it (the API refuses them too).
  beforeLoad: async ({ context, params }) => {
    if (!(await canInWorkspace(context.queryClient, params.slug, 'workspace:update'))) {
      throw redirect({ to: '/w/$slug/settings/members', params, replace: true });
    }
  },
  component: GeneralSettings,
});
