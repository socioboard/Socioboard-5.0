/** Events the scheduling module emits (audit now; realtime and notifications later in phase 2). */
export interface SchedulingEvents extends Record<string, unknown> {
  'post.scheduled': {
    workspaceId: string;
    postId: string;
    userId: string;
    targets: { targetId: string; at: string }[];
  };
  'post.rescheduled': {
    workspaceId: string;
    postId: string;
    targetId: string;
    userId: string;
    from: string;
    to: string;
  };
  'post.unscheduled': { workspaceId: string; postId: string; userId: string; targetIds: string[] };
  'post.recurrence_set': {
    workspaceId: string;
    postId: string;
    userId: string;
    rrule: string;
    timezone: string;
  };
  'post.recurrence_stopped': {
    workspaceId: string;
    postId: string;
    userId: string;
    removedOccurrences: number;
  };
  'queue_slots.updated': {
    workspaceId: string;
    accountId: string;
    userId: string;
    slots: number;
    timezone: string;
  };
}
