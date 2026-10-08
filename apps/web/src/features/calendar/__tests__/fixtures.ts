import type { CalendarEntry, PostDetails, SocialAccount } from '@socioboard/contracts';

export const WID = '01a0d816-827a-74d6-a46e-409c7db36f93';
export const BASE = `/api/v1/workspaces/${WID}`;
export const NOW = new Date('2026-10-05T10:00:00Z');
export const FB: SocialAccount = {
  id: '01a0d816-827a-74d6-a46e-409c7db31001',
  network: 'facebook_page',
  displayName: 'Halden Coffee',
  username: null,
  avatarUrl: null,
  status: 'active',
  connection: null,
  connectedBy: null,
  createdAt: '2026-09-28T10:00:00.000Z',
};
export const IG: SocialAccount = {
  ...FB,
  id: '01a0d816-827a-74d6-a46e-409c7db31002',
  network: 'instagram',
  displayName: 'halden.coffee',
};
export const ENTRY: CalendarEntry = {
  targetId: '01a0d816-827a-74d6-a46e-409c7db35001',
  postId: '01a0d816-827a-74d6-a46e-409c7db34001',
  account: FB,
  status: 'scheduled',
  at: '2026-10-06T08:30:00.000Z',
  text: 'Autumn menu is here',
  thumbnailUrl: null,
  mediaCount: 0,
  labelIds: [],
  recurring: false,
  permalink: null,
  lastError: null,
};
export const SECOND: CalendarEntry = {
  ...ENTRY,
  targetId: '01a0d816-827a-74d6-a46e-409c7db35002',
  account: IG,
  text: 'A little autumn in your cup',
};
export const POST: PostDetails = {
  id: ENTRY.postId,
  status: 'scheduled',
  text: ENTRY.text,
  mediaIds: [],
  link: null,
  firstComment: null,
  labelIds: [],
  author: { id: '01a0d816-827a-74d6-a46e-409c7db36f92', name: 'Priya Raman', avatarUrl: null },
  createdAt: '2026-09-28T10:00:00.000Z',
  updatedAt: '2026-09-28T10:00:00.000Z',
  recurring: null,
  recurrence: null,
  review: { needed: false, latest: null },
  targets: [ENTRY, SECOND].map((entry) => ({
    id: entry.targetId,
    account: entry.account,
    override: entry === SECOND ? { text: SECOND.text } : null,
    status: 'scheduled',
    scheduledAt: entry.at,
    externalPostId: null,
    permalink: null,
    attempts: 0,
    lastError: null,
    publishedAt: null,
    history: [],
  })),
};
