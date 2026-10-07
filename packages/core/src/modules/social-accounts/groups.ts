import type { AccountGroup, AccountGroupBody } from '@socioboard/contracts';
import type { Prisma } from '@socioboard/db';

import {
  AppError,
  conflict,
  newId,
  notFound,
  typedEvents,
  type AuthContext,
  type Db,
  type EventBus,
  type MemberContext,
} from '../../platform';
import type { SocialAccountEvents } from './events';

export interface AccountGroupDeps {
  db: Db;
  events: EventBus<Record<string, unknown>>;
}

interface GroupRow {
  id: string;
  name: string;
  createdAt: Date;
  items: { socialAccountId: string }[];
}

/** Items are uuid v7, so ordering by id keeps the accounts in the order they were picked. */
const withItems = { items: { select: { socialAccountId: true }, orderBy: { id: 'asc' } } } as const;

const toGroup = (g: GroupRow): AccountGroup => ({
  id: g.id,
  name: g.name,
  accountIds: g.items.map((i) => i.socialAccountId),
  createdAt: g.createdAt.toISOString(),
});

/**
 * Account groups (P3-F3, docs/backend/modules/social-accounts.md): saved sets of accounts the
 * composer can pick at once. A group keeps a disconnected account (it may be connected again);
 * removing an account for good takes it out of every group (the database cascades).
 */
export function createAccountGroupService(deps: AccountGroupDeps) {
  const { db } = deps;
  const events = typedEvents<SocialAccountEvents>(deps.events);

  async function findGroup(workspaceId: string, groupId: string) {
    const group = await db.forWorkspace(workspaceId).socialAccountGroup.findUnique({
      where: { id: groupId },
      select: { id: true, name: true },
    });
    if (!group) throw notFound('GROUP_NOT_FOUND', 'Group not found');
    return group;
  }

  /** Names are unique in a workspace, whatever their case ("Brand A" and "brand a" clash). */
  async function assertNameFree(workspaceId: string, name: string, except?: string) {
    const clash = await db.forWorkspace(workspaceId).socialAccountGroup.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        ...(except ? { id: { not: except } } : {}),
      },
      select: { name: true },
    });
    if (clash) throw conflict('GROUP_EXISTS', `There is already a group called "${clash.name}"`);
  }

  /** Every account must be this workspace's (in any state); names the ones that aren't. */
  async function assertAccounts(workspaceId: string, accountIds: string[]) {
    const found = await db.forWorkspace(workspaceId).socialAccount.findMany({
      where: { id: { in: accountIds } },
      select: { id: true },
    });
    const missing = accountIds.filter((id) => !found.some((a) => a.id === id));
    if (missing.length > 0) {
      throw new AppError(404, 'ACCOUNT_NOT_FOUND', 'Some accounts aren’t in this workspace', {
        accountIds: missing,
      });
    }
  }

  /** Writes the group's accounts (after any old ones are gone) and reads the group back. */
  async function fill(
    tx: Prisma.TransactionClient,
    workspaceId: string,
    groupId: string,
    accountIds: string[],
  ) {
    await tx.socialAccountGroupItem.createMany({
      data: accountIds.map((socialAccountId) => ({
        id: newId(),
        workspaceId,
        groupId,
        socialAccountId,
      })),
    });
    return tx.socialAccountGroup.findUniqueOrThrow({
      where: { id: groupId, workspaceId },
      select: { id: true, name: true, createdAt: true, ...withItems },
    });
  }

  async function list(member: MemberContext): Promise<AccountGroup[]> {
    const groups = await db.forWorkspace(member.workspaceId).socialAccountGroup.findMany({
      orderBy: { id: 'asc' },
      select: { id: true, name: true, createdAt: true, ...withItems },
    });
    // Alphabetical as people read it ("all pages" before "Brand B"), not by character code.
    const byName = new Intl.Collator(undefined, { sensitivity: 'base', numeric: true });
    return groups.sort((a, b) => byName.compare(a.name, b.name)).map(toGroup);
  }

  async function create(caller: AuthContext, member: MemberContext, body: AccountGroupBody) {
    const { workspaceId } = member;
    await assertNameFree(workspaceId, body.name);
    await assertAccounts(workspaceId, body.accountIds);
    const group = await db.client.$transaction(async (tx) => {
      const { id } = await tx.socialAccountGroup.create({
        data: { id: newId(), workspaceId, name: body.name },
        select: { id: true },
      });
      return fill(tx, workspaceId, id, body.accountIds);
    });
    await events.emit('account_group.created', {
      workspaceId,
      groupId: group.id,
      userId: caller.user.id,
      name: group.name,
      accounts: body.accountIds.length,
    });
    return toGroup(group);
  }

  /** Renames the group and replaces its accounts, in one transaction. */
  async function update(
    caller: AuthContext,
    member: MemberContext,
    groupId: string,
    body: AccountGroupBody,
  ) {
    const { workspaceId } = member;
    const group = await findGroup(workspaceId, groupId);
    await assertNameFree(workspaceId, body.name, group.id);
    await assertAccounts(workspaceId, body.accountIds);
    const updated = await db.client.$transaction(async (tx) => {
      await tx.socialAccountGroupItem.deleteMany({ where: { workspaceId, groupId: group.id } });
      await tx.socialAccountGroup.update({
        where: { id: group.id, workspaceId },
        data: { name: body.name },
      });
      return fill(tx, workspaceId, group.id, body.accountIds);
    });
    await events.emit('account_group.updated', {
      workspaceId,
      groupId: group.id,
      userId: caller.user.id,
      name: updated.name,
      accounts: body.accountIds.length,
    });
    return toGroup(updated);
  }

  async function remove(caller: AuthContext, member: MemberContext, groupId: string) {
    const group = await findGroup(member.workspaceId, groupId);
    await db.forWorkspace(member.workspaceId).socialAccountGroup.delete({
      where: { id: group.id },
    });
    await events.emit('account_group.deleted', {
      workspaceId: member.workspaceId,
      groupId: group.id,
      userId: caller.user.id,
      name: group.name,
    });
  }

  return { list, create, update, remove };
}

export type AccountGroupService = ReturnType<typeof createAccountGroupService>;
