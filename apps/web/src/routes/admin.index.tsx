import { createFileRoute } from '@tanstack/react-router';

import { AdminOverviewPage } from '../features/admin';

export const Route = createFileRoute('/admin/')({ component: AdminOverviewPage });
