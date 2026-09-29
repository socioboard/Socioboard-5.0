import { createFileRoute } from '@tanstack/react-router';

import { AccountsPage, type AccountsSearch } from '../features/accounts';
import { stringParam } from '../lib/route-guards';

export const Route = createFileRoute('/w/$slug/accounts/')({
  // Every key is always returned (undefined when absent or invalid), as the router expects.
  validateSearch: (search): AccountsSearch => ({
    account: stringParam(search.account, 64),
    login: stringParam(search.login, 64),
    connectError: stringParam(search.connectError, 64),
  }),
  component: function Accounts() {
    const search = Route.useSearch();
    const navigate = Route.useNavigate();
    return (
      <AccountsPage
        search={search}
        // Opening and closing details or the notice doesn't need a history entry each time.
        onSearchChange={(patch) =>
          void navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true })
        }
      />
    );
  },
});
