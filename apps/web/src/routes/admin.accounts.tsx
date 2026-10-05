import { NetworkId } from '@socioboard/contracts';
import { createFileRoute } from '@tanstack/react-router';

import { AdminAccountsPage, type AdminAccountsSearch } from '../features/admin';

export const Route = createFileRoute('/admin/accounts')({
  // Every key is always returned (undefined when absent or invalid), as the router expects.
  validateSearch: (search): AdminAccountsSearch => {
    const network = NetworkId.safeParse(search.network);
    const within = Number(search.within);
    return {
      state:
        search.state === 'expiring' || search.state === 'reauth_required'
          ? search.state
          : undefined,
      within: within === 14 || within === 30 ? within : undefined,
      network: network.success ? network.data : undefined,
    };
  },
  component: function Accounts() {
    const navigate = Route.useNavigate();
    return (
      <AdminAccountsPage
        search={Route.useSearch()}
        onSearchChange={(patch) =>
          void navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true })
        }
      />
    );
  },
});
