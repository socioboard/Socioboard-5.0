import { createFileRoute, redirect } from '@tanstack/react-router';

import { ComposerPage } from '../features/composer';
import { canInWorkspace } from '../lib/route-guards';

export const Route = createFileRoute('/w/$slug/compose/')({
  // Viewers can't write posts (the API refuses them too).
  beforeLoad: async ({ context, params }) => {
    if (!(await canInWorkspace(context.queryClient, params.slug, 'posts:create'))) {
      throw redirect({ to: '/w/$slug/calendar', params, replace: true });
    }
  },
  component: function Compose() {
    return <ComposerPage />;
  },
});
