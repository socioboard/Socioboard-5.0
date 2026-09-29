import { ConnectResult, LoginProvider } from '@socioboard/contracts';
import { createFileRoute, redirect } from '@tanstack/react-router';

import { AssetPickerPage, type ConnectSearch } from '../features/accounts';
import { canInWorkspace, stringParam } from '../lib/route-guards';

export const Route = createFileRoute('/w/$slug/accounts/connect/$provider')({
  validateSearch: (search): ConnectSearch => {
    const result = ConnectResult.safeParse(search.result);
    return {
      connection: stringParam(search.connection, 64),
      result: result.success ? result.data : undefined,
      error: stringParam(search.error, 64),
    };
  },
  // Only people who can connect accounts get here (the API refuses the rest too); an unknown
  // provider in the URL goes back to the accounts page.
  beforeLoad: async ({ context, params }) => {
    const known = LoginProvider.safeParse(params.provider).success;
    if (!known || !(await canInWorkspace(context.queryClient, params.slug, 'accounts:connect'))) {
      throw redirect({ to: '/w/$slug/accounts', params: { slug: params.slug }, replace: true });
    }
  },
  component: function Connect() {
    const { provider } = Route.useParams();
    const search = Route.useSearch();
    return <AssetPickerPage provider={LoginProvider.parse(provider)} search={search} />;
  },
});
