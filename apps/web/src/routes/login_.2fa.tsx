import { createFileRoute } from '@tanstack/react-router';

import { TwoFactorScreen } from '../features/auth';
import { redirectSearch } from '../lib/route-guards';

export const Route = createFileRoute('/login_/2fa')({
  validateSearch: redirectSearch,
  component: function TwoFactor() {
    const { redirect } = Route.useSearch();
    return <TwoFactorScreen {...(redirect ? { redirect } : {})} />;
  },
});
