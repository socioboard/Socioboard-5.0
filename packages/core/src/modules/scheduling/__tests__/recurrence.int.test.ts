// Repeating posts (P2-B4) against Postgres and Valkey: a template post and its rule; each
// occurrence a week ahead becomes an ordinary scheduled post with its own job. Changing the rule
// or the template replaces the copies still waiting; copies changed by hand, or sent, stay.
import { ErrorEnvelope, Post, PostDetails, Recurrence } from '@socioboard/contracts';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createPublishingServices } from '../../../domain';
import { createTestApp } from '../../../testing';
import { scheduledJobId } from '../../publishing';

const t = createTestApp();
const services = createPublishingServices(t.platform, { registry: t.networks.registry });
const queue = t.platform.queues.get(services.publishQueue);
type Browser = Awaited<ReturnType<typeof t.signUp>>;

let owner: Browser;
let contributor: Browser;
let ws = '';
let account = '';
const base = () => `/api/v1/workspaces/${ws}`;
const code = (res: { body: unknown }) => ErrorEnvelope.safeParse(res.body).data?.error.code;

/** Tomorrow (UTC) as YYYY-MM-DD, and its weekday. */
const tomorrow = new Date(Date.now() + 86_400_000);
const tomorrowDate = tomorrow.toISOString().slice(0, 10);
/** Weekly on tomorrow's weekday at 12:00 UTC: exactly one occurrence in the next 7 days. */
const weekly = (time = '12:00') => ({
  frequency: 'weekly',
  weekdays: [tomorrow.getUTCDay()],
  time,
  timezone: 'UTC',
  startsOn: tomorrowDate,
});

beforeAll(async () => {
  owner = await t.signUp('rec-owner');
  contributor = await t.signUp('rec-contrib');
  ws = (
    (await owner.post('/api/v1/workspaces', { name: t.workspaceName('Rec'), timezone: 'UTC' }))
      .body as { id: string }
  ).id;
  const inv = await owner.post(`${base()}/invitations`, {
    email: t.email('rec-contrib'),
    role: 'contributor',
  });
  await contributor.post(`/api/v1/invitations/${(inv.body as { id: string }).id}/accept`);
  const login = await t.db.client.socialConnection.create({
    data: {
      workspaceId: ws,
      provider: 'facebook',
      externalUserId: `fb-rec-${ws}`,
      displayName: 'Priya',
      accessTokenEnc: t.platform.crypto.encrypt('user-token'),
    },
  });
  account = (
    await t.db.client.socialAccount.create({
      data: {
        workspaceId: ws,
        connectionId: login.id,
        network: 'facebook_page',
        externalId: '301',
        displayName: 'Halden Coffee',
        assetTokenEnc: t.platform.crypto.encrypt('page-token-301'),
      },
    })
  ).id;
});

afterAll(async () => {
  await t.db.client.socialConnection.deleteMany({ where: { workspaceId: ws } }).catch(() => null);
  await t.cleanup();
});

async function template(text = 'Weekly tasting, see you there') {
  const res = await owner.post(`${base()}/posts`, { text, targets: [{ accountId: account }] });
  expect(res.status, JSON.stringify(res.body)).toBe(201);
  return Post.parse(res.body);
}

const copiesOf = (templateId: string) =>
  t.db.client.recurringRule.findFirst({ where: { postId: templateId } }).then((rule) =>
    rule
      ? t.db.client.post.findMany({
          where: { recurringRuleId: rule.id },
          include: { targets: true },
          orderBy: { occurrenceAt: 'asc' },
        })
      : [],
  );

const repeat = (postId: string, body: object = weekly()) =>
  owner.send('PUT', `${base()}/posts/${postId}/recurrence`, body);

describe('making a post repeat', () => {
  it('creates the copies of the next week: scheduled posts with their own jobs', async () => {
    const post = await template();
    const res = await repeat(post.id);
    expect(res.status, JSON.stringify(res.body)).toBe(200);
    const recurrence = Recurrence.parse(res.body);
    expect(recurrence.active).toBe(true);
    expect(recurrence.nextRunAt).toBe(`${tomorrowDate}T12:00:00.000Z`);

    const copies = await copiesOf(post.id);
    expect(copies).toHaveLength(1);
    const [copy] = copies;
    expect(copy).toMatchObject({ status: 'scheduled', text: post.text, customizedAt: null });
    expect(copy?.occurrenceAt?.toISOString()).toBe(`${tomorrowDate}T12:00:00.000Z`);
    expect(copy?.targets.map((x) => [x.socialAccountId, x.status, x.scheduleVersion])).toEqual([
      [account, 'scheduled', 1],
    ]);
    const job = await queue.getJob(scheduledJobId(copy?.targets[0]?.id ?? '', 1));
    expect(job?.data.scheduleVersion).toBe(1);

    // The template shows how it repeats, and stays a draft.
    const details = PostDetails.parse((await owner.get(`${base()}/posts/${post.id}`)).body);
    expect(details.status).toBe('draft');
    expect(details.recurrence?.rule.weekdays).toEqual([tomorrow.getUTCDay()]);
    // Posts say which they are (the list marks them): the template, its copy, or neither.
    expect(details.recurring).toBe('template');
    const listed = (await owner.get(`${base()}/posts?limit=100`)).body as {
      items: { id: string; recurring: string | null }[];
    };
    expect(listed.items.find((p) => p.id === post.id)?.recurring).toBe('template');
    expect(listed.items.find((p) => p.id === copy?.id)?.recurring).toBe('occurrence');
    const plain = await template();
    expect(
      PostDetails.parse((await owner.get(`${base()}/posts/${plain.id}`)).body).recurring,
    ).toBeNull();
    const audit = await t.db.client.auditLog.findFirst({
      where: { workspaceId: ws, action: 'post.recurrence_set', entityId: post.id },
    });
    expect(audit?.actorUserId).toBe(owner.userId);
  });

  it('running the expansion again creates nothing twice', async () => {
    const post = await template();
    await repeat(post.id);
    await services.recurrence.expandDue();
    await services.recurrence.expandDue();
    expect(await copiesOf(post.id)).toHaveLength(1);
  });

  it('the template itself never goes out', async () => {
    const post = await template();
    await repeat(post.id);
    for (const [path, body] of [
      ['publish-now', undefined],
      ['schedule', { at: new Date(Date.now() + 3_600_000).toISOString() }],
      ['queue', undefined],
    ] as const) {
      const res = await owner.post(`${base()}/posts/${post.id}/${path}`, body);
      expect([path, res.status, code(res)]).toEqual([path, 409, 'POST_IS_RECURRING']);
    }
  });

  it('refuses copies, scheduled posts, rules with no dates left, and roles without posts:publish', async () => {
    const post = await template();
    await repeat(post.id);
    const [copy] = await copiesOf(post.id);
    const onCopy = await repeat(copy?.id ?? '');
    expect([onCopy.status, code(onCopy)]).toEqual([409, 'POST_IS_OCCURRENCE']);

    const scheduled = await template();
    await owner.post(`${base()}/posts/${scheduled.id}/schedule`, {
      at: new Date(Date.now() + 3_600_000).toISOString(),
    });
    const onScheduled = await repeat(scheduled.id);
    expect([onScheduled.status, code(onScheduled)]).toEqual([409, 'POST_IS_SCHEDULED']);

    const other = await template();
    const ended = await repeat(other.id, {
      ...weekly(),
      startsOn: '2020-01-01',
      ends: { type: 'on', date: '2020-02-01' },
    });
    expect([ended.status, code(ended)]).toEqual([422, 'RECURRENCE_ENDED']);
    const contrib = await contributor.send(
      'PUT',
      `${base()}/posts/${other.id}/recurrence`,
      weekly(),
    );
    expect(contrib.status).toBe(403);
  });
});

describe('changing a repeating post', () => {
  it('editing the template replaces the waiting copies', async () => {
    const post = await template('Old text');
    await repeat(post.id);
    const [before] = await copiesOf(post.id);
    const res = await owner.send('PATCH', `${base()}/posts/${post.id}`, { text: 'New text' });
    expect(res.status).toBe(200);
    const after = await copiesOf(post.id);
    expect(after.map((p) => p.text)).toEqual(['New text']);
    expect(after[0]?.id).not.toBe(before?.id);
    // The old copy's job is gone.
    expect(await queue.getJob(scheduledJobId(before?.targets[0]?.id ?? '', 1))).toBeUndefined();
  });

  it('a copy edited by hand stays when the rule changes; the others are replaced', async () => {
    const post = await template();
    await repeat(post.id);
    const [mine] = await copiesOf(post.id);
    const edit = await owner.send('PATCH', `${base()}/posts/${mine?.id ?? ''}`, {
      text: 'Special edition',
    });
    expect(edit.status).toBe(200);
    // A different time: the waiting, untouched copies are replaced.
    await repeat(post.id, weekly('15:00'));
    const copies = await copiesOf(post.id);
    expect(copies.map((p) => [p.text, p.occurrenceAt?.toISOString().slice(11, 16)])).toEqual([
      ['Special edition', '12:00'],
      [post.text, '15:00'],
    ]);
  });
});

describe('stopping', () => {
  it('removes the waiting copies, keeps sent ones; the template is a plain draft again', async () => {
    const post = await template();
    await repeat(post.id);
    const [copy] = await copiesOf(post.id);
    const res = await owner.send('DELETE', `${base()}/posts/${post.id}/recurrence`);
    expect(res.status).toBe(204);
    expect(await copiesOf(post.id)).toHaveLength(0);
    expect(await queue.getJob(scheduledJobId(copy?.targets[0]?.id ?? '', 1))).toBeUndefined();
    const details = PostDetails.parse((await owner.get(`${base()}/posts/${post.id}`)).body);
    expect(details.recurrence).toBeNull();
    expect(details.recurring).toBeNull();
    const again = await owner.send('DELETE', `${base()}/posts/${post.id}/recurrence`);
    expect([again.status, code(again)]).toEqual([404, 'RECURRENCE_NOT_FOUND']);

    // Sent copies are history.
    const sent = await template();
    await repeat(sent.id);
    const [out] = await copiesOf(sent.id);
    await t.db.client.postTarget.updateMany({
      where: { postId: out?.id ?? '' },
      data: { status: 'published', publishedAt: new Date() },
    });
    await owner.send('DELETE', `${base()}/posts/${sent.id}/recurrence`);
    expect((await copiesOf(sent.id)).map((p) => p.id)).toEqual([out?.id]);
  });

  it('deleting the template removes its waiting copies', async () => {
    const post = await template();
    await repeat(post.id);
    const rule = await t.db.client.recurringRule.findFirstOrThrow({ where: { postId: post.id } });
    const res = await owner.send('DELETE', `${base()}/posts/${post.id}`);
    expect(res.status).toBe(204);
    expect(await t.db.client.post.count({ where: { recurringRuleId: rule.id } })).toBe(0);
  });
});
