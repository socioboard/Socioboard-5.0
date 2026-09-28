import { createFileRoute } from '@tanstack/react-router';

import { MembersSettings } from '../features/settings';

export const Route = createFileRoute('/w/$slug/settings/members')({
  component: MembersSettings,
});
