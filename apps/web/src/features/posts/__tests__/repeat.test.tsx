// Repeating posts and the workspace's clock on the posts screens (P2-F1).
import type { PostDetails, RecurrenceRuleInput } from '@socioboard/contracts';
import { renderHook, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import '../../../lib/i18n';
import {
  browserTimezone,
  formatLocalDate,
  formatTimeOfDay,
  formatZoned,
  zoneCity,
} from '../../../lib/time';
import { halden, meWith, mockServer, renderApp } from '../../../testing/render';
import { mondayFirst, useRepeatWording, weekdayName } from '../repeat';

const WID = halden.workspace.id;
const BASE = `/api/v1/workspaces/${WID}`;
const POST_ID = '01a0d816-827a-74d6-a46e-409c7db34001';
const AT = '2026-10-09T20:30:00.000Z';

const rule = (over: Partial<RecurrenceRuleInput>): RecurrenceRuleInput => ({
  frequency: 'daily',
  time: '09:00',
  timezone: 'UTC',
  startsOn: '2026-10-05',
  ...over,
});

const postWith = (over: Partial<PostDetails>): PostDetails => ({
  id: POST_ID,
  status: 'draft',
  text: 'Autumn menu is here',
  mediaIds: [],
  link: null,
  firstComment: null,
  labelIds: [],
  author: { id: '01a0d816-827a-74d6-a46e-409c7db36f92', name: 'Priya Raman', avatarUrl: null },
  targets: [],
  createdAt: '2026-09-28T10:00:00.000Z',
  updatedAt: '2026-09-28T10:00:00.000Z',
  recurring: null,
  recurrence: null,
  review: { needed: false, latest: null },
  ...over,
});

const scheduledTarget: PostDetails['targets'][number] = {
  id: '01a0d816-827a-74d6-a46e-409c7db35001',
  account: {
    id: '01a0d816-827a-74d6-a46e-409c7db31001',
    network: 'facebook_page',
    displayName: 'Halden Coffee',
    username: null,
    avatarUrl: null,
    status: 'active',
  },
  override: null,
  status: 'scheduled',
  scheduledAt: AT,
  externalPostId: null,
  permalink: null,
  attempts: 0,
  lastError: null,
  publishedAt: null,
  history: [],
};

const server = (timezone: string, posts: PostDetails[]) =>
  mockServer({
    'GET /api/v1/auth/options': [200, { socialProviders: [], emailVerificationRequired: true }],
    'GET /api/v1/me': [
      200,
      meWith({
        memberships: [{ workspace: { ...halden.workspace, timezone }, role: 'owner' }],
        activeWorkspaceId: WID,
      }),
    ],
    [`GET ${BASE}/labels`]: [200, { items: [] }],
    [`GET ${BASE}/posts`]: [200, { items: posts, nextCursor: null }],
    [`GET ${BASE}/posts/${POST_ID}`]: [200, posts[0]],
  });

afterEach(() => {
  vi.restoreAllMocks();
});

describe('how a post repeats, in words', () => {
  const describeRule = () => renderHook(() => useRepeatWording()).result.current;
  const nine = formatTimeOfDay('09:00', 'en');

  it('daily, weekly and monthly, with their interval', () => {
    const say = describeRule();
    expect(say(rule({}))).toBe(`Every day at ${nine}`);
    expect(say(rule({ interval: 3 }))).toBe(`Every 3 days at ${nine}`);
    expect(say(rule({ frequency: 'weekly', weekdays: [1] }))).toBe(
      `Every week on Monday at ${nine}`,
    );
    // Days are listed Monday first, Sunday last.
    expect(say(rule({ frequency: 'weekly', interval: 2, weekdays: [0, 4, 1] }))).toBe(
      `Every 2 weeks on Monday, Thursday, and Sunday at ${nine}`,
    );
    expect(say(rule({ frequency: 'monthly', monthDay: 6 }))).toBe(
      `Every month on day 6 at ${nine}`,
    );
    expect(say(rule({ frequency: 'monthly', interval: 3, monthDay: -1 }))).toBe(
      `Every 3 months on the last day at ${nine}`,
    );
  });

  it('with its end: a last date, or a number of times', () => {
    const say = describeRule();
    expect(say(rule({ ends: { type: 'on', date: '2026-12-31' } }))).toBe(
      `Every day at ${nine}, until ${formatLocalDate('2026-12-31', 'en')}`,
    );
    expect(say(rule({ ends: { type: 'after', count: 5 } }))).toBe(`Every day at ${nine}, 5 times`);
    expect(say(rule({ ends: { type: 'after', count: 1 } }))).toBe(`Every day at ${nine}, once`);
    expect(say(rule({ ends: { type: 'never' } }))).toBe(`Every day at ${nine}`);
  });

  it('weekday names and order', () => {
    expect(weekdayName(0, 'long', 'en')).toBe('Sunday');
    expect(weekdayName(6, 'short', 'en')).toBe('Sat');
    expect(mondayFirst([0, 6, 1, 3])).toEqual([1, 3, 6, 0]);
  });
});

describe('times', () => {
  it('a timezone is named by its city, with today’s spelling', () => {
    expect(zoneCity('Europe/Lisbon')).toBe('Lisbon');
    expect(zoneCity('Asia/Calcutta')).toBe('Kolkata');
    expect(zoneCity('America/Argentina/Buenos_Aires')).toBe('Buenos Aires');
    expect(zoneCity('UTC')).toBe('UTC');
  });

  it('an instant reads differently in each timezone', () => {
    // 20:30 UTC on the 9th is 02:00 on the 10th in Kolkata.
    expect(formatZoned(AT, 'Asia/Kolkata', 'date', 'en-GB')).toBe('10 Oct 2026');
    expect(formatZoned(AT, 'UTC', 'date', 'en-GB')).toBe('9 Oct 2026');
    expect(formatZoned(AT, 'Asia/Kolkata', 'time', 'en-GB')).toBe('02:00');
    expect(formatZoned(AT, 'UTC', 'long', 'en-GB')).toMatch(/^Fri,? 9 Oct 2026,? (at )?20:30$/);
  });

  it('the posts list and the post’s page show times on the workspace’s clock', async () => {
    const post = postWith({ status: 'scheduled', targets: [scheduledTarget] });
    // Tokyo: not the timezone of any machine these run on.
    server('Asia/Tokyo', [post]);
    const { unmount } = renderApp('/w/halden/posts');
    const tokyo = formatZoned(AT, 'Asia/Tokyo');
    expect(tokyo).not.toBe(formatZoned(AT, browserTimezone()));
    expect((await screen.findAllByText(`Scheduled for ${tokyo}`)).length).toBeGreaterThan(0);
    unmount();
    renderApp(`/w/halden/posts/${POST_ID}`);
    expect(await screen.findByText(`Scheduled for ${tokyo}`)).toBeInTheDocument();
  });
});

describe('repeating posts on the posts screens', () => {
  const template = postWith({
    recurring: 'template',
    recurrence: {
      active: true,
      nextRunAt: AT,
      rule: {
        frequency: 'weekly',
        interval: 1,
        weekdays: [5],
        time: '20:30',
        timezone: 'UTC',
        startsOn: '2026-10-05',
        ends: { type: 'never' },
      },
    },
  });
  const copy = postWith({
    id: '01a0d816-827a-74d6-a46e-409c7db34002',
    status: 'scheduled',
    recurring: 'occurrence',
    targets: [scheduledTarget],
  });

  it('the list marks the post that repeats and the copies it made', async () => {
    server('UTC', [template, copy, postWith({ id: '01a0d816-827a-74d6-a46e-409c7db34003' })]);
    renderApp('/w/halden/posts');
    expect(await screen.findAllByText('Repeats')).toHaveLength(1);
    expect(screen.getAllByText('From a repeating post')).toHaveLength(1);
  });

  it('the page of a post that repeats says how, when next, and that its copies go out', async () => {
    server('UTC', [template]);
    renderApp(`/w/halden/posts/${POST_ID}`);
    expect(await screen.findByText(/^Every week on Friday at .*, UTC\./)).toBeInTheDocument();
    expect(screen.getByText(`Next: ${formatZoned(AT, 'UTC', 'long')}.`)).toBeInTheDocument();
    expect(screen.getByText(/This post is the template/)).toBeInTheDocument();
  });

  it('a copy’s page says it is one; an ordinary post says neither', async () => {
    server('UTC', [{ ...copy, id: POST_ID }]);
    const { unmount } = renderApp(`/w/halden/posts/${POST_ID}`);
    expect(await screen.findByText(/A copy of a repeating post/)).toBeInTheDocument();
    expect(screen.queryByText(/This post is the template/)).not.toBeInTheDocument();
    unmount();
    vi.restoreAllMocks();
    server('UTC', [postWith({})]);
    renderApp(`/w/halden/posts/${POST_ID}`);
    expect(await screen.findByText('Autumn menu is here')).toBeInTheDocument();
    expect(screen.queryByText(/A copy of a repeating post/)).not.toBeInTheDocument();
    expect(screen.queryByText(/This post is the template/)).not.toBeInTheDocument();
  });
});
