import { createFileRoute } from '@tanstack/react-router';

import { WorkspaceSettingsLayout } from '../features/settings';

export const Route = createFileRoute('/w/$slug/settings')({
  component: WorkspaceSettingsLayout,
});
