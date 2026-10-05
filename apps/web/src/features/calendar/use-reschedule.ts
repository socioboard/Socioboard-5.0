import {
  apiRoutes,
  IsoDateTime,
  type CalendarEntry,
  type CalendarQuery,
  type CalendarResponse,
} from '@socioboard/contracts';
import { toast } from '@socioboard/ui';
import { useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { api, ApiError } from '../../lib/api';
import { errorMessage } from '../../lib/i18n';
import { useWorkspaceTime } from '../../lib/use-workspace-time';
import { useWorkspace } from '../../lib/workspace';
import { rememberPost } from '../posts';
import { calendarKeys } from './api';
import { belongsToRange, scheduleProblem } from './model';

/** One write per target; optimistic moves survive range changes and concurrent other moves. */
export function useReschedule() {
  const { t } = useTranslation('calendar');
  const { workspace } = useWorkspace();
  const time = useWorkspaceTime();
  const client = useQueryClient();
  const pending = useRef(new Map<string, string>());
  const [moves, setMoves] = useState(new Map<string, string>());
  const patch = (targetId: string, at: string) => {
    for (const [key, data] of client.getQueriesData<CalendarResponse>({
      queryKey: calendarKeys.all(workspace.id),
    })) {
      if (!data) continue;
      const range = key[3] as CalendarQuery;
      client.setQueryData(key, {
        ...data,
        items: data.items.flatMap((e) =>
          e.targetId !== targetId
            ? [e]
            : belongsToRange(at, range.from, range.to)
              ? [{ ...e, at }]
              : [],
        ),
      });
    }
  };
  const move = async (entry: CalendarEntry, at: Date): Promise<boolean> => {
    if (pending.current.has(entry.targetId) || entry.status !== 'scheduled') return false;
    const problem = scheduleProblem(at);
    if (problem) {
      toast.error(t(`errors.${problem}`));
      return false;
    }
    pending.current.set(entry.targetId, at.toISOString());
    setMoves(new Map(pending.current));
    await client.cancelQueries({ queryKey: calendarKeys.all(workspace.id) });
    try {
      const saved = await api(apiRoutes.scheduling.rescheduleTarget, {
        params: { workspaceId: workspace.id, targetId: entry.targetId },
        body: { at: at.toISOString(), previousAt: entry.at },
      });
      rememberPost(client, workspace.id, saved);
      const confirmed = saved.targets.find((x) => x.id === entry.targetId)?.scheduledAt;
      if (confirmed) patch(entry.targetId, confirmed);
      toast.success(
        t('rescheduled', {
          account: entry.account.displayName,
          time: time.format(confirmed ?? at, 'long'),
        }),
      );
      return true;
    } catch (err) {
      if (err instanceof ApiError && err.code === 'SCHEDULE_CHANGED') {
        const details = err.details as { at?: unknown } | undefined;
        const current = IsoDateTime.safeParse(details?.at);
        if (current.success) patch(entry.targetId, current.data);
        toast.error(t('errors.changed'));
      } else {
        const code = err instanceof ApiError ? err.code : '';
        const known: Record<string, string> = {
          SCHEDULE_TOO_SOON: t('errors.tooSoon'),
          SCHEDULE_TOO_FAR: t('errors.tooFar'),
          TARGET_NOT_SCHEDULED: t('errors.notScheduled'),
          REVIEW_REQUIRED: t('errors.review'),
          POST_HAS_ERRORS: t('errors.validation'),
          TARGET_NOT_FOUND: t('errors.gone'),
        };
        toast.error(known[code] ?? errorMessage(err));
      }
      return false;
    } finally {
      pending.current.delete(entry.targetId);
      setMoves(new Map(pending.current));
      void client.invalidateQueries({ queryKey: calendarKeys.all(workspace.id) });
      void client.invalidateQueries({
        queryKey: ['workspaces', workspace.id, 'posts', 'detail', entry.postId],
      });
      void client.invalidateQueries({
        queryKey: ['workspaces', workspace.id, 'accounts'],
        predicate: (q) => q.queryKey.at(-1) === 'queue-slots',
      });
    }
  };
  return { moves, move };
}
