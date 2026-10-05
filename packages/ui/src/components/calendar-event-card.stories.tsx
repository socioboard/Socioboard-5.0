import type { CalendarEntry } from '@socioboard/contracts';
import { CalendarEventCard } from './calendar-event-card';

const entry: CalendarEntry = {
  targetId: 'target',
  postId: 'post',
  account: {
    id: 'account',
    network: 'facebook_page',
    displayName: 'Halden Coffee',
    username: null,
    avatarUrl: null,
    status: 'active',
  },
  status: 'scheduled',
  at: '2026-10-06T09:00:00Z',
  text: 'Good mornings begin with good coffee.',
  thumbnailUrl: null,
  mediaCount: 0,
  labelIds: [],
  recurring: true,
  permalink: null,
  lastError: null,
};
const labels = {
  scheduled: 'Scheduled',
  published: 'Published',
  publishing: 'Publishing',
  failed: 'Failed',
  pending: 'Waiting',
  cancelled: 'Cancelled',
};

export function Deliveries() {
  return (
    <div className="grid max-w-lg grid-cols-2 gap-4">
      {(['scheduled', 'published', 'failed', 'publishing'] as const).map((status) => (
        <button key={status} className="glass-chip hover-lift rounded-control border-hair border">
          <CalendarEventCard
            entries={[{ ...entry, status }]}
            time="09:00"
            noText="No text"
            statusLabels={labels}
          />
        </button>
      ))}
    </div>
  );
}
