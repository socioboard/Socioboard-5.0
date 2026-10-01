// P1-Q2 failure drills (docs/stages/phase-1.md): the real Facebook Page adapter and Graph client,
// the real publish job, Postgres and the API, with only Meta itself played by a fake `fetch` that
// answers the way Graph does when a token has expired, a post is refused, or Meta can't be
// reached. Each drill checks what's recorded and what the post's page is given to explain it
// (the words are the web app's: features/posts, target.errors.*).
import { PostDetails } from '@socioboard/contracts';
import { createMetaAdapters, createRegistry } from '@socioboard/providers';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { createPublishingServices } from '../../../domain';
import { createTestApp } from '../../../testing';
import { appRateKey, PublishDeferred, publishTarget, type PublishDeps } from '../index';

/** How the played Meta answers the next publish call. */
type Scenario = 'expired' | 'refused' | 'timeout' | 'down' | 'rate' | 'ok';
let scenario: Scenario = 'ok';
const graphCalls: string[] = [];

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

/** Graph's real error bodies (codes and wording as Meta sends them). */
const playedMeta: typeof fetch = (input, init) => {
  const url = new URL(input instanceof Request ? input.url : String(input));
  graphCalls.push(url.pathname);
  switch (scenario) {
    case 'expired':
      return Promise.resolve(
        json(400, {
          error: {
            message:
              'Error validating access token: Session has expired on Tuesday, 29-Sep-26 10:00:00 PDT. The current time is Wednesday, 30-Sep-26 03:00:00 PDT.',
            type: 'OAuthException',
            code: 190,
            error_subcode: 463,
            fbtrace_id: 'drill',
          },
        }),
      );
    case 'refused':
      return Promise.resolve(
        json(400, {
          error: {
            message:
              '(#368) The action attempted has been deemed abusive or is otherwise disallowed',
            type: 'OAuthException',
            code: 368,
            error_user_title: 'Post blocked',
            error_user_msg: 'This post goes against our Community Standards.',
            fbtrace_id: 'drill',
          },
        }),
      );
    case 'timeout':
      // What fetch throws when AbortSignal.timeout fires.
      return Promise.reject(
        new DOMException('The operation was aborted due to timeout', 'TimeoutError'),
      );
    case 'down':
      return Promise.resolve(new Response('<html>Service Unavailable</html>', { status: 503 }));
    case 'rate':
      return Promise.resolve(
        json(400, {
          error: {
            message: '(#4) Application request limit reached',
            type: 'OAuthException',
            code: 4,
            is_transient: true,
            fbtrace_id: 'drill',
          },
        }),
      );
    case 'ok':
      // The post, then its link (the adapter asks for permalink_url after publishing).
      return Promise.resolve(
        (init?.method ?? 'GET') === 'GET'
          ? json(200, { id: '101_2002', permalink_url: 'https://www.facebook.com/101/posts/2002' })
          : json(200, { id: '101_2002' }),
      );
  }
};

const t = createTestApp();
const meta = createMetaAdapters({
  facebook: { appId: 'drill-app', appSecret: 'drill-secret' },
  fetch: playedMeta,
});
const registry = createRegistry({ logins: meta.logins, networks: meta.networks });
const services = createPublishingServices(t.platform, { registry });
const deps: PublishDeps = {
  ...t.platform,
  registry,
  mediaUrls: services.mediaUrls,
  getCredentials: services.socialAccounts.getCredentials,
  markReauthRequired: services.socialAccounts.markReauthRequired,
  recomputeStatus: services.posts.recomputeStatus,
};
type Browser = Awaited<ReturnType<typeof t.signUp>>;

let owner: Browser;
let ws = '';
let connectionId = '';
let pageAccount = '';
const base = () => `/api/v1/workspaces/${ws}`;

beforeAll(async () => {
  owner = await t.signUp('drill-owner');
  ws = (
    (await owner.post('/api/v1/workspaces', { name: t.workspaceName('Drills'), timezone: 'UTC' }))
      .body as { id: string }
  ).id;
  const login = await t.db.client.socialConnection.create({
    data: {
      workspaceId: ws,
      provider: 'facebook',
      externalUserId: `fb-drill-${ws}`,
      displayName: 'Priya',
      accessTokenEnc: t.platform.crypto.encrypt('user-token'),
    },
  });
  connectionId = login.id;
  pageAccount = (
    await t.db.client.socialAccount.create({
      data: {
        workspaceId: ws,
        connectionId,
        network: 'facebook_page',
        externalId: '101',
        displayName: 'Halden Coffee',
        assetTokenEnc: t.platform.crypto.encrypt('page-token'),
        meta: {},
      },
    })
  ).id;
});

beforeEach(async () => {
  scenario = 'ok';
  graphCalls.length = 0;
  await t.db.client.socialAccount.updateMany({
    where: { workspaceId: ws },
    data: { status: 'active', statusReason: null },
  });
  await t.db.client.socialConnection.update({
    where: { id: connectionId },
    data: { status: 'active', statusReason: null },
  });
});

afterAll(async () => {
  await t.db.client.socialConnection.deleteMany({ where: { workspaceId: ws } }).catch(() => null);
  await t.cleanup();
});

/** A text post to the Page, queued the way publish-now leaves it (the job is run by hand). */
async function queued(text: string) {
  const res = await owner.post(`${base()}/posts`, { text, targets: [{ accountId: pageAccount }] });
  expect(res.status, JSON.stringify(res.body)).toBe(201);
  const post = res.body as { id: string; targets: { id: string }[] };
  const targetId = post.targets[0]?.id ?? '';
  await t.db.client.postTarget.update({ where: { id: targetId }, data: { status: 'publishing' } });
  return { postId: post.id, targetId };
}
const run = (targetId: string, isLast = false) =>
  publishTarget(deps, { workspaceId: ws, targetId }, { isLast });
/** What the post's page is given: the delivery as the API returns it. */
async function delivery(postId: string) {
  const details = PostDetails.parse((await owner.get(`${base()}/posts/${postId}`)).body);
  const target = details.targets[0];
  if (!target) throw new Error('no target');
  return { post: details, target };
}

describe('failure drills against the Facebook Page adapter', () => {
  it('an expired token: fails at once, asks to reconnect, and sends nothing more until then', async () => {
    const { postId, targetId } = await queued('Drill: expired token');
    scenario = 'expired';
    await expect(run(targetId)).resolves.toBeUndefined();

    const { post, target } = await delivery(postId);
    expect(post.status).toBe('failed');
    expect(target).toMatchObject({
      status: 'failed',
      attempts: 1,
      lastError: { kind: 'auth', networkCode: '190/463' },
    });
    // The network's own words, shown under ours ("… no longer accepts this account's sign-in").
    expect(target.lastError?.message).toMatch(
      /^Error validating access token: Session has expired/,
    );
    // The account and its login now say "Reconnect".
    expect(target.account.status).toBe('reauth_required');
    const login = await t.db.client.socialConnection.findUniqueOrThrow({
      where: { id: connectionId },
    });
    expect(login.status).toBe('reauth_required');

    // The next post to that account fails straight away, without calling Meta again.
    const next = await queued('Drill: after expiry');
    graphCalls.length = 0;
    await run(next.targetId);
    expect((await delivery(next.postId)).target).toMatchObject({
      status: 'failed',
      lastError: { kind: 'auth' },
    });
    expect(graphCalls).toEqual([]);
  });

  it('content Facebook refuses: fails at once (no retries) with Facebook’s message for people', async () => {
    const { postId, targetId } = await queued('Drill: refused content');
    scenario = 'refused';
    await expect(run(targetId)).resolves.toBeUndefined();
    const { target } = await delivery(postId);
    expect(target).toMatchObject({
      status: 'failed',
      attempts: 1,
      lastError: {
        kind: 'content',
        networkCode: '368',
        // error_user_msg (written for people), not the developer message.
        message: 'This post goes against our Community Standards.',
      },
    });
    // Refused content doesn't mean the account is broken.
    expect(target.account.status).toBe('active');
    expect(target.history.map((h) => [h.attemptNo, h.outcome, h.error?.kind])).toEqual([
      [1, 'failed', 'content'],
    ]);
  });

  it('a timeout: retried, then failed after the last try as "couldn’t be reached"', async () => {
    const { postId, targetId } = await queued('Drill: timeout');
    scenario = 'timeout';
    // Not the last try: the job throws so the queue tries again later.
    await expect(run(targetId)).rejects.toMatchObject({ kind: 'retryable' });
    expect((await delivery(postId)).target).toMatchObject({ status: 'publishing', attempts: 1 });
    // The last try: it gives up and records why.
    await expect(run(targetId, true)).resolves.toBeUndefined();
    const { target } = await delivery(postId);
    expect(target).toMatchObject({
      status: 'failed',
      attempts: 2,
      lastError: { kind: 'retryable' },
    });
    expect(target.lastError?.message).toBe('Meta did not answer in time');
    expect(target.history.map((h) => [h.attemptNo, h.outcome, h.error?.kind])).toEqual([
      [2, 'failed', 'retryable'],
      [1, 'will_retry', 'retryable'],
    ]);
    expect(target.account.status).toBe('active');
  });

  it('Meta briefly down (503), then back: the retry publishes and the failure is cleared', async () => {
    const { postId, targetId } = await queued('Drill: Meta down, then back');
    scenario = 'down';
    await expect(run(targetId)).rejects.toMatchObject({ kind: 'retryable' });
    scenario = 'ok';
    await expect(run(targetId)).resolves.toBeUndefined();
    const { post, target } = await delivery(postId);
    expect(post.status).toBe('published');
    expect(target).toMatchObject({
      status: 'published',
      externalPostId: '101_2002',
      lastError: null,
    });
    expect(target.permalink).toMatch(/^https:\/\/www\.facebook\.com\//);
  });

  it('a rate limit: recorded as "asked us to slow down" once the tries run out', async () => {
    const { postId, targetId } = await queued('Drill: rate limit');
    scenario = 'rate';
    await expect(run(targetId, true)).resolves.toBeUndefined();
    expect((await delivery(postId)).target).toMatchObject({
      status: 'failed',
      lastError: { kind: 'rate_limited', networkCode: '4' },
    });
    // Code 4 is the app's own limit: the next post on any Meta account waits, Meta not called.
    const next = await queued('Drill: after the app limit');
    const calls = graphCalls.length;
    scenario = 'ok';
    await expect(run(next.targetId)).rejects.toBeInstanceOf(PublishDeferred);
    expect(graphCalls).toHaveLength(calls);
    await t.platform.rateLimiter.resume(appRateKey('facebook'));
  });

  it('after reconnecting, retrying the failed delivery publishes it', async () => {
    const { postId, targetId } = await queued('Drill: retry after reconnect');
    scenario = 'expired';
    await run(targetId);
    // Reconnecting (a fresh sign-in) makes the account and login active again.
    await t.db.client.socialConnection.update({
      where: { id: connectionId },
      data: { status: 'active', statusReason: null },
    });
    await t.db.client.socialAccount.update({
      where: { id: pageAccount },
      data: { status: 'active', statusReason: null },
    });
    scenario = 'ok';
    const res = await owner.post(`${base()}/posts/${postId}/targets/${targetId}/retry`);
    expect(res.status, JSON.stringify(res.body)).toBe(202);
    await expect(run(targetId, true)).resolves.toBeUndefined();
    expect((await delivery(postId)).target).toMatchObject({
      status: 'published',
      lastError: null,
    });
  });
});
