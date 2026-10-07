// Account groups (P3-F3) against Postgres: saved sets of accounts, by name, in the order picked;
// only account managers change them, and accounts must be the workspace's own.
import { AccountGroup, ErrorEnvelope } from '@socioboard/contracts';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createTestApp } from '../../../testing';

const t = createTestApp();
type Browser = Awaited<ReturnType<typeof t.signUp>>;

let owner: Browser;
let contributor: Browser;
let outsider: Browser;
let ws = '';
let otherWs = '';
const acc = { a: '', b: '', c: '', foreign: '' };
const base = () => `/api/v1/workspaces/${ws}/account-groups`;
const code = (res: { body: unknown }) => ErrorEnvelope.safeParse(res.body).data?.error.code;

async function workspaceWithAccounts(who: Browser, name: string, ids: string[]) {
  const id = (
    (await who.post('/api/v1/workspaces', { name: t.workspaceName(name), timezone: 'UTC' }))
      .body as { id: string }
  ).id;
  const login = await t.db.client.socialConnection.create({
    data: {
      workspaceId: id,
      provider: 'facebook',
      externalUserId: `fb-g-${id}`,
      displayName: 'Priya',
      accessTokenEnc: t.platform.crypto.encrypt('user-token'),
    },
  });
  const made: string[] = [];
  for (const externalId of ids) {
    const account = await t.db.client.socialAccount.create({
      data: {
        workspaceId: id,
        connectionId: login.id,
        network: 'facebook_page',
        externalId,
        displayName: `Page ${externalId}`,
        status: 'active',
        assetTokenEnc: t.platform.crypto.encrypt(`page-token-${externalId}`),
      },
    });
    made.push(account.id);
  }
  return { id, accounts: made };
}

beforeAll(async () => {
  owner = await t.signUp('g-owner');
  contributor = await t.signUp('g-contrib');
  outsider = await t.signUp('g-outsider');
  const mine = await workspaceWithAccounts(owner, 'G', ['301', '302', '303']);
  ws = mine.id;
  [acc.a = '', acc.b = '', acc.c = ''] = mine.accounts;
  const theirs = await workspaceWithAccounts(outsider, 'G2', ['401']);
  otherWs = theirs.id;
  acc.foreign = theirs.accounts[0] ?? '';
  const inv = await owner.post(`/api/v1/workspaces/${ws}/invitations`, {
    email: t.email('g-contrib'),
    role: 'contributor',
  });
  await contributor.post(`/api/v1/invitations/${(inv.body as { id: string }).id}/accept`);
});

afterAll(async () => {
  for (const id of [ws, otherWs]) {
    await t.db.client.socialConnection.deleteMany({ where: { workspaceId: id } }).catch(() => null);
  }
  await t.cleanup();
});

describe('account groups', () => {
  it('saves a group with its accounts in the order picked, and lists groups by name', async () => {
    const made = await owner.post(base(), { name: 'Brand B', accountIds: [acc.c, acc.a] });
    expect(made.status, JSON.stringify(made.body)).toBe(201);
    const group = AccountGroup.parse(made.body);
    expect(group).toMatchObject({ name: 'Brand B', accountIds: [acc.c, acc.a] });
    await owner.post(base(), { name: 'all pages', accountIds: [acc.a, acc.b, acc.c] });

    // Anyone who can read posts sees them (the composer offers them to contributors too).
    const res = await contributor.get(base());
    expect(res.status).toBe(200);
    const { items } = res.body as { items: AccountGroup[] };
    expect(items.map((g) => g.name)).toEqual(['all pages', 'Brand B']);

    const audit = await t.db.client.auditLog.findFirst({
      where: { workspaceId: ws, action: 'account_group.created', entityId: group.id },
    });
    expect(audit?.actorUserId).toBe(owner.userId);
  });

  it('replaces the name and accounts together; names clash whatever their case', async () => {
    const group = AccountGroup.parse(
      (await owner.post(base(), { name: 'Launch', accountIds: [acc.a] })).body,
    );
    const updated = await owner.send('PUT', `${base()}/${group.id}`, {
      name: 'Launch week',
      accountIds: [acc.b, acc.a],
    });
    expect(updated.status, JSON.stringify(updated.body)).toBe(200);
    expect(AccountGroup.parse(updated.body)).toMatchObject({
      id: group.id,
      name: 'Launch week',
      accountIds: [acc.b, acc.a],
    });
    // Keeping its own name is fine; taking another group's isn't.
    const same = await owner.send('PUT', `${base()}/${group.id}`, {
      name: 'LAUNCH WEEK',
      accountIds: [acc.a],
    });
    expect(same.status).toBe(200);
    const clash = await owner.post(base(), { name: 'launch week', accountIds: [acc.a] });
    expect([clash.status, code(clash)]).toEqual([409, 'GROUP_EXISTS']);
  });

  it('refuses accounts from another workspace, naming them', async () => {
    const res = await owner.post(base(), { name: 'Mixed', accountIds: [acc.a, acc.foreign] });
    expect([res.status, code(res)]).toEqual([404, 'ACCOUNT_NOT_FOUND']);
    expect(ErrorEnvelope.parse(res.body).error.details).toEqual({ accountIds: [acc.foreign] });
    // Nothing was saved.
    const list = (await owner.get(base())).body as { items: AccountGroup[] };
    expect(list.items.some((g) => g.name === 'Mixed')).toBe(false);
  });

  it('only account managers change groups; other workspaces can’t see them', async () => {
    const group = AccountGroup.parse(
      (await owner.post(base(), { name: 'Private', accountIds: [acc.a] })).body,
    );
    expect((await contributor.post(base(), { name: 'Mine', accountIds: [acc.a] })).status).toBe(
      403,
    );
    expect(
      (await contributor.send('PUT', `${base()}/${group.id}`, { name: 'x', accountIds: [acc.a] }))
        .status,
    ).toBe(403);
    expect((await contributor.send('DELETE', `${base()}/${group.id}`)).status).toBe(403);
    // Another workspace's group id is simply not found here.
    const theirs = AccountGroup.parse(
      (
        await outsider.post(`/api/v1/workspaces/${otherWs}/account-groups`, {
          name: 'Theirs',
          accountIds: [acc.foreign],
        })
      ).body,
    );
    const res = await owner.send('DELETE', `${base()}/${theirs.id}`);
    expect([res.status, code(res)]).toEqual([404, 'GROUP_NOT_FOUND']);
  });

  it('deleting a group leaves its accounts; removing an account takes it out of its groups', async () => {
    const group = AccountGroup.parse(
      (await owner.post(base(), { name: 'Short-lived', accountIds: [acc.a, acc.c] })).body,
    );
    expect((await owner.send('DELETE', `${base()}/${group.id}`)).status).toBe(204);
    expect(await t.db.client.socialAccount.count({ where: { id: { in: [acc.a, acc.c] } } })).toBe(
      2,
    );

    const keep = AccountGroup.parse(
      (await owner.post(base(), { name: 'Keeps going', accountIds: [acc.a, acc.c] })).body,
    );
    await t.db.client.socialAccount.delete({ where: { id: acc.c } });
    const list = (await owner.get(base())).body as { items: AccountGroup[] };
    expect(list.items.find((g) => g.id === keep.id)?.accountIds).toEqual([acc.a]);
  });
});
