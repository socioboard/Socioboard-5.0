import { createFileRoute } from '@tanstack/react-router';

import { SecurityPage } from '../features/profile';

export const Route = createFileRoute('/me/security')({ component: SecurityPage });
