import { createFileRoute } from '@tanstack/react-router';

import { AdminQueuesPage } from '../features/admin';

export const Route = createFileRoute('/admin/queues')({ component: AdminQueuesPage });
