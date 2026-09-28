import { createFileRoute, redirect } from '@tanstack/react-router';

// A workspace opens on its calendar (docs/frontend/README.md#routes).
export const Route = createFileRoute('/w/$slug/')({
  beforeLoad: ({ params }) => {
    throw redirect({ to: '/w/$slug/calendar', params, replace: true });
  },
});
