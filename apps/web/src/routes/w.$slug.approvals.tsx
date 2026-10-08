import { createFileRoute } from '@tanstack/react-router';

import { ApprovalsPage, type ApprovalsSearch } from '../features/approvals';
import { stringParam } from '../lib/route-guards';

export const Route = createFileRoute('/w/$slug/approvals')({
  // Every key is always returned (undefined when absent or invalid), as the router expects.
  validateSearch: (search): ApprovalsSearch => ({
    tab: search.tab === 'decided' ? 'decided' : undefined,
    post: stringParam(search.post, 64),
  }),
  component: function Approvals() {
    const navigate = Route.useNavigate();
    return (
      <ApprovalsPage
        search={Route.useSearch()}
        onSearchChange={(patch) => void navigate({ search: (prev) => ({ ...prev, ...patch }) })}
      />
    );
  },
});
