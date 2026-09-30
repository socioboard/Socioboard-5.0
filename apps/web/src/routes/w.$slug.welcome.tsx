import { createFileRoute } from '@tanstack/react-router';

import { WelcomePage, type WelcomeStep } from '../features/onboarding';

// Onboarding steps 2–3, right after creating the workspace (step 1 is `/onboarding`).
export const Route = createFileRoute('/w/$slug/welcome')({
  // Every key is always returned (undefined when absent or invalid), as the router expects.
  validateSearch: (search): { step?: WelcomeStep | undefined } => ({
    step: search.step === 'connect' || search.step === 'post' ? search.step : undefined,
  }),
  component: function Welcome() {
    const { step } = Route.useSearch();
    return <WelcomePage step={step ?? 'connect'} />;
  },
});
