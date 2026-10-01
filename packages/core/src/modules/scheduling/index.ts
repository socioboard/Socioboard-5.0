// Public surface of the scheduling module (docs/backend/modules/scheduling.md).
export type { SchedulingEvents } from './events';
export { registerSchedulingRoutes } from './routes';
export { createSchedulingService, type SchedulingDeps, type SchedulingService } from './service';
