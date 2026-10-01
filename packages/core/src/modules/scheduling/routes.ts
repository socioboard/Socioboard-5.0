import { schedulingRoutes as r } from '@socioboard/contracts';

import type { ApiRouter } from '../../platform';
import type { CalendarService } from './calendar';
import type { QueueSlotService } from './queue-slots';
import type { RecurrenceService } from './recurrence';
import type { SchedulingService } from './service';

/** Mounts the scheduling routes (contracts: schedulingRoutes). */
export function registerSchedulingRoutes(
  api: ApiRouter,
  scheduling: SchedulingService,
  queueSlots: QueueSlotService,
  recurrence: RecurrenceService,
  calendar: CalendarService,
) {
  api.route(r.getCalendar, ({ member, query }) => calendar.get(member, query));
  api.route(r.setRecurrence, ({ auth, member, params, body }) =>
    recurrence.set(auth, member, params.postId, body),
  );
  api.route(r.deleteRecurrence, ({ auth, member, params }) =>
    recurrence.stop(auth, member, params.postId),
  );
  api.route(r.queuePost, ({ auth, member, params }) =>
    scheduling.queue(auth, member, params.postId),
  );
  api.route(r.getQueueSlots, ({ member, params }) => queueSlots.get(member, params.accountId));
  api.route(r.putQueueSlots, ({ auth, member, params, body }) =>
    queueSlots.put(auth, member, params.accountId, body),
  );
  api.route(r.schedulePost, ({ auth, member, params, body }) =>
    scheduling.schedule(auth, member, params.postId, body),
  );
  api.route(r.unschedulePost, ({ auth, member, params }) =>
    scheduling.unschedule(auth, member, params.postId),
  );
  api.route(r.rescheduleTarget, ({ auth, member, params, body }) =>
    scheduling.reschedule(auth, member, params.targetId, body),
  );
}
