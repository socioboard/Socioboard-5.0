import {
  CALENDAR_MAX_ENTRIES,
  PublishError,
  TargetOverride,
  type CalendarEntry,
  type CalendarQuery,
  type CalendarResponse,
  type TargetStatus,
} from '@socioboard/contracts';
import type { Prisma } from '@socioboard/db';

import { createUrlSigner, type Db, type MemberContext, type Storage } from '../../platform';

const TEXT_MAX = 280;

/** The start of a text, ≤ 280 UTF-16 units, never cutting an emoji in half. */
function excerpt(text: string): string {
  const cut = text.slice(0, TEXT_MAX);
  return /[\uD800-\uDBFF]$/.test(cut) ? cut.slice(0, -1) : cut;
}

function httpUrl(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null;
  } catch {
    return null;
  }
}

/**
 * Targets as calendar entries (contracts: CalendarEntry): what the calendar and the queue view
 * show, in time order. `at` is when it went out, else when it's due, else when it was last tried;
 * targets with none of these (drafts) are left out.
 */
export function createCalendarEntries(db: Db, storage: Storage | undefined) {
  const signUrl = createUrlSigner(storage);

  return async function entries(
    workspaceId: string,
    where: Prisma.PostTargetWhereInput,
    take?: number,
  ): Promise<CalendarEntry[]> {
    const ws = db.forWorkspace(workspaceId);
    const rows = await ws.postTarget.findMany({
      where,
      include: {
        post: { select: { text: true, mediaIds: true, labelIds: true, recurringRuleId: true } },
        account: {
          select: {
            id: true,
            network: true,
            displayName: true,
            username: true,
            avatarUrl: true,
            status: true,
          },
        },
        history: { select: { startedAt: true }, orderBy: { attemptNo: 'desc' }, take: 1 },
      },
      orderBy: [{ scheduledAt: 'asc' }, { id: 'asc' }],
      ...(take ? { take } : {}),
    });
    const shaped = rows.map((t) => {
      const override = TargetOverride.nullable().catch(null).parse(t.override);
      const mediaIds = override?.mediaIds ?? t.post.mediaIds;
      return {
        row: t,
        at: t.publishedAt ?? t.scheduledAt ?? t.history[0]?.startedAt ?? null,
        text: excerpt(override?.text ?? t.post.text),
        mediaIds,
      };
    });
    const firstMedia = [...new Set(shaped.map((s) => s.mediaIds[0]).filter(Boolean))] as string[];
    const media = firstMedia.length
      ? await ws.mediaAsset.findMany({
          where: { id: { in: firstMedia } },
          select: { id: true, thumbnailKey: true },
        })
      : [];
    const thumbs = new Map(
      await Promise.all(media.map(async (m) => [m.id, await signUrl(m.thumbnailKey)] as const)),
    );

    const items = shaped.flatMap(({ row: t, at, text, mediaIds }) =>
      at
        ? [
            {
              targetId: t.id,
              postId: t.postId,
              account: { ...t.account, avatarUrl: httpUrl(t.account.avatarUrl) },
              status: t.status,
              at: at.toISOString(),
              text,
              thumbnailUrl: (mediaIds[0] && thumbs.get(mediaIds[0])) ?? null,
              mediaCount: mediaIds.length,
              labelIds: t.post.labelIds,
              recurring: t.post.recurringRuleId !== null,
              permalink: httpUrl(t.permalink),
              lastError:
                t.lastError === null ? null : (PublishError.safeParse(t.lastError).data ?? null),
            },
          ]
        : [],
    );
    // Stable: same-time entries keep the database's order (scheduled time, then id).
    return items.sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
  };
}

/** What the calendar shows unless `status` says otherwise: everything with a time. */
const CALENDAR_STATUSES: TargetStatus[] = ['scheduled', 'publishing', 'published', 'failed'];

/**
 * `GET /calendar` (scheduling.md): targets whose `at` falls in [from, to), oldest first, at most
 * CALENDAR_MAX_ENTRIES (`truncated` when there were more).
 */
export function createCalendarService(deps: { entries: CalendarEntries }) {
  async function get(member: MemberContext, query: CalendarQuery): Promise<CalendarResponse> {
    const from = new Date(query.from);
    const to = new Date(query.to);
    const inRange = { gte: from, lt: to };
    // `at` is a fallback chain the database can't index, so this narrows by each link and the
    // exact `at` is checked below (a failed publish-now tried in range but tried again later).
    const where: Prisma.PostTargetWhereInput = {
      status: { in: query.status ?? CALENDAR_STATUSES },
      ...(query.accountId ? { socialAccountId: { in: query.accountId } } : {}),
      ...(query.labelId ? { post: { labelIds: { has: query.labelId } } } : {}),
      OR: [
        { publishedAt: inRange },
        { publishedAt: null, scheduledAt: inRange },
        {
          publishedAt: null,
          scheduledAt: null,
          history: { some: { startedAt: inRange } },
        },
      ],
    };
    const rows = await deps.entries(member.workspaceId, where, CALENDAR_MAX_ENTRIES + 1);
    const items = rows.filter((e) => {
      const at = Date.parse(e.at);
      return at >= from.getTime() && at < to.getTime();
    });
    return {
      items: items.slice(0, CALENDAR_MAX_ENTRIES),
      truncated: rows.length > CALENDAR_MAX_ENTRIES,
    };
  }
  return { get };
}

export type CalendarService = ReturnType<typeof createCalendarService>;

export type CalendarEntries = ReturnType<typeof createCalendarEntries>;
