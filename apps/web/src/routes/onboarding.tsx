import { createFileRoute, redirect } from '@tanstack/react-router';

import { CreateWorkspaceScreen } from '../features/onboarding';
import { requireSignedIn } from '../lib/route-guards';
import { authOptionsQuery } from '../lib/session';

export const Route = createFileRoute('/onboarding')({
  beforeLoad: async ({ context }) => {
    const me = await requireSignedIn(context.queryClient, '/onboarding');
    // The server refuses to create a workspace before the email is verified (when it can send
    // email), so send them there first rather than to a form that can't succeed.
    const options = await context.queryClient.query({ ...authOptionsQuery, staleTime: 'static' });
    if (options.emailVerificationRequired && !me.user.emailVerified) {
      throw redirect({ to: '/verify-email', search: { redirect: '/onboarding' }, replace: true });
    }
    return { me };
  },
  component: function Onboarding() {
    const { me } = Route.useRouteContext();
    return <CreateWorkspaceScreen me={me} />;
  },
});
