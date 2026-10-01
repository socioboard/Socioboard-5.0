// Public surface of the scheduling module (docs/backend/modules/scheduling.md).
export type { SchedulingEvents } from './events';
export { createCalendarEntries, type CalendarEntries } from './calendar';
export { createQueueSlotService, type QueueSlotService } from './queue-slots';
export { registerSchedulingRoutes } from './routes';
export { slotTimes, wallClock, zonedTime } from './time';
export { createSchedulingService, type SchedulingDeps, type SchedulingService } from './service';
