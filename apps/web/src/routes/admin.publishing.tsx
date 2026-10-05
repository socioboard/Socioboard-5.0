import { HealthRange, NetworkId, PublishErrorKind } from '@socioboard/contracts';
import { createFileRoute } from '@tanstack/react-router';

import { AdminPublishingPage, type PublishingSearch } from '../features/admin';

const pick = <T,>(
  schema: { safeParse: (v: unknown) => { success: boolean; data?: T } },
  value: unknown,
) => {
  const parsed = schema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
};

export const Route = createFileRoute('/admin/publishing')({
  // Every key is always returned (undefined when absent or invalid), as the router expects.
  validateSearch: (search): PublishingSearch => ({
    range: pick(HealthRange, search.range),
    state: search.state === 'failed' || search.state === 'stuck' ? search.state : undefined,
    network: pick(NetworkId, search.network),
    errorKind: pick(PublishErrorKind, search.errorKind),
  }),
  component: function Publishing() {
    const navigate = Route.useNavigate();
    return (
      <AdminPublishingPage
        search={Route.useSearch()}
        onSearchChange={(patch) =>
          void navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true })
        }
      />
    );
  },
});
