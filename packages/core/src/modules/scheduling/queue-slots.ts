import {
  QUEUE_UPCOMING,
  SCHEDULE_MIN_LEAD_MINUTES,
  type PutQueueSlotsBody,
  type QueueSlots,
} from '@socioboard/contracts';

import {
  canUseAccount,
  newId,
  notFound,
  typedEvents,
  unprocessable,
  type AuthContext,
  type Clock,
  type Db,
  type EventBus,
  type MemberContext,
} from '../../platform';
import type { CalendarEntries } from './calendar';
import type { SchedulingEvents } from './events';
import { slotTimes } from './time';

export interface QueueSlotDeps {
  db: Db;
  clock: Clock;
  events: EventBus<Record<string, unknown>>;
  entries: CalendarEntries;
}

/** An account's posting times (docs/backend/modules/scheduling.md): read, and replace all. */
export function createQueueSlotService(deps: QueueSlotDeps) {
  const { db, clock, entries } = deps;
  const events = typedEvents<SchedulingEvents>(deps.events);

  async function findAccount(member: MemberContext, accountId: string) {
    // An account the member may not use is the same 404 as a foreign one (P4-B4).
    if (!canUseAccount(member, accountId)) throw notFound('ACCOUNT_NOT_FOUND', 'Account not found');
    const account = await db.forWorkspace(member.workspaceId).socialAccount.findUnique({
      where: { id: accountId },
      select: { id: true, status: true },
    });
    if (!account) throw notFound('ACCOUNT_NOT_FOUND', 'Account not found');
    return account;
  }

  /** The slots (by weekday, then time), and the next 14 slot times with what's in each. */
  async function get(member: MemberContext, accountId: string): Promise<QueueSlots> {
    const { workspaceId } = member;
    await findAccount(member, accountId);
    const ws = db.forWorkspace(workspaceId);
    const slots = await ws.queueSlot.findMany({
      where: { socialAccountId: accountId },
      orderBy: [{ weekday: 'asc' }, { time: 'asc' }],
    });
    const timezone =
      slots[0]?.timezone ??
      (
        await db.client.workspace.findUniqueOrThrow({
          where: { id: workspaceId },
          select: { timezone: true },
        })
      ).timezone;

    // From the same earliest time "Add to queue" uses, so the view never shows a slot it can't fill.
    const earliest = new Date(clock.now().getTime() + SCHEDULE_MIN_LEAD_MINUTES * 60_000);
    const upcoming: Date[] = [];
    for (const at of slotTimes(slots, timezone, earliest)) {
      upcoming.push(at);
      if (upcoming.length === QUEUE_UPCOMING) break;
    }
    const booked = upcoming.length
      ? await entries(workspaceId, {
          socialAccountId: accountId,
          status: { not: 'cancelled' },
          scheduledAt: { in: upcoming },
          // Shared with other accounts the member may not use: not theirs to see (P4-B4).
          ...(member.accountIds === null
            ? {}
            : {
                post: {
                  NOT: {
                    targets: { some: { socialAccountId: { notIn: [...member.accountIds] } } },
                  },
                },
              }),
        })
      : [];
    return {
      timezone,
      slots: slots.map((s) => ({ weekday: s.weekday, time: s.time })),
      upcoming: upcoming.map((at) => ({
        at: at.toISOString(),
        entries: booked.filter((e) => e.at === at.toISOString()),
      })),
    };
  }

  /** Replaces all of an account's slots; an empty list turns "Add to queue" off for it. */
  async function put(
    caller: AuthContext,
    member: MemberContext,
    accountId: string,
    body: PutQueueSlotsBody,
  ): Promise<QueueSlots> {
    const { workspaceId } = member;
    const account = await findAccount(member, accountId);
    if (account.status === 'disconnected') {
      throw unprocessable(
        'ACCOUNT_NOT_AVAILABLE',
        'This account is disconnected; reconnect it to give it posting times',
      );
    }
    await db.client.$transaction(async (tx) => {
      await tx.queueSlot.deleteMany({ where: { workspaceId, socialAccountId: accountId } });
      if (body.slots.length) {
        await tx.queueSlot.createMany({
          data: body.slots.map((s) => ({
            id: newId(),
            workspaceId,
            socialAccountId: accountId,
            weekday: s.weekday,
            time: s.time,
            timezone: body.timezone,
          })),
        });
      }
    });
    await events.emit('queue_slots.updated', {
      workspaceId,
      accountId,
      userId: caller.user.id,
      slots: body.slots.length,
      timezone: body.timezone,
    });
    return get(member, accountId);
  }

  return { get, put };
}

export type QueueSlotService = ReturnType<typeof createQueueSlotService>;
