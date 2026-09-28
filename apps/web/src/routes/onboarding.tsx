// Placeholder landing after sign-in for people with no workspace; P0-F4 replaces it with the
// onboarding wizard.
import { Button } from '@socioboard/ui';
import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { AuthLayout, useSignOut } from '../features/auth';
import { requireSignedIn } from '../lib/route-guards';

export const Route = createFileRoute('/onboarding')({
  beforeLoad: ({ context }) => requireSignedIn(context.queryClient, '/onboarding'),
  component: function Onboarding() {
    const { t } = useTranslation('auth');
    const signOut = useSignOut();
    return (
      <AuthLayout
        title={t('placeholder.onboardingTitle')}
        subtitle={t('placeholder.onboardingBody')}
      >
        <Button
          onClick={() => {
            void signOut();
          }}
        >
          {t('invite.signOut')}
        </Button>
      </AuthLayout>
    );
  },
});
