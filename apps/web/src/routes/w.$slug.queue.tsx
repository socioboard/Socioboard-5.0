import { createFileRoute, redirect } from '@tanstack/react-router';

import { QueuePage, type QueueSearch } from '../features/calendar';
import { canInWorkspace, stringParam } from '../lib/route-guards';

export const Route = createFileRoute('/w/$slug/queue')({
  // Every key is always returned (undefined when absent or invalid), as the router expects.
  validateSearch: (search): QueueSearch => ({ account: stringParam(search.account, 64) }),
  beforeLoad: async ({ context, params }) => {
    if (!(await canInWorkspace(context.queryClient, params.slug, 'calendar:read'))) {
      throw redirect({ to: '/w/$slug/settings', params: { slug: params.slug }, replace: true });
    }
  },
  component: function Queue() {
    const navigate = Route.useNavigate();
    return (
      <QueuePage
        search={Route.useSearch()}
        // Switching accounts doesn't need a history entry each time.
        onSearchChange={(patch) =>
          void navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true })
        }
      />
    );
  },
});
