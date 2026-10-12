import { apiRoutes, type Task } from '@socioboard/contracts';
import { Avatar, Checkbox, cn, listItem, motion, AnimatePresence, toast } from '@socioboard/ui';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { CalendarClock, FileText } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { api } from '../../../lib/api';
import { errorMessage } from '../../../lib/i18n';
import { useCan } from '../../../lib/permissions';
import { useNow } from '../../../lib/use-now';
import { useWorkspaceTime } from '../../../lib/use-workspace-time';
import { useWorkspace } from '../../../lib/workspace';
import { taskKeys } from '../api';

/**
 * Tasks as rows: a box to tick it done (for whoever may change its status), its title (opens
 * it), the post it's about, who has it and when it's due (overdue in red).
 */
export function TaskList({
  tasks,
  onOpen,
  showPost = true,
}: {
  tasks: Task[];
  onOpen: (task: Task) => void;
  /** Off on a post's own page, where every task is about that post. */
  showPost?: boolean;
}) {
  return (
    <ul className="flex flex-col gap-1.5">
      <AnimatePresence initial={false}>
        {tasks.map((task, i) => (
          <motion.li key={task.id} {...listItem(i)}>
            <TaskRow task={task} onOpen={onOpen} showPost={showPost} />
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}

function TaskRow({
  task,
  onOpen,
  showPost,
}: {
  task: Task;
  onOpen: (task: Task) => void;
  showPost: boolean;
}) {
  const { t } = useTranslation('tasks');
  const { workspace, me } = useWorkspace();
  const can = useCan();
  const time = useWorkspaceTime();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const now = useNow();
  const done = task.status === 'done';
  const mayTick = can('tasks:manage') || task.assignee?.id === me.user.id;
  const overdue = !done && task.dueAt !== null && Date.parse(task.dueAt) < now;

  const toggle = async () => {
    setBusy(true);
    try {
      await api(apiRoutes.tasks.updateTask, {
        params: { workspaceId: workspace.id, taskId: task.id },
        body: { status: done ? 'open' : 'done' },
      });
      await queryClient.invalidateQueries({ queryKey: taskKeys.all(workspace.id) });
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      data-task-status={task.status}
      className="glass-chip hover:bg-glass-solid flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors"
    >
      <Checkbox
        checked={done}
        disabled={!mayTick || busy}
        onCheckedChange={() => void toggle()}
        className="mt-0.5"
        label={
          <span className="sr-only">
            {done
              ? t('row.markOpen', { title: task.title })
              : t('row.markDone', { title: task.title })}
          </span>
        }
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <button
          type="button"
          onClick={() => {
            onOpen(task);
          }}
          className={cn(
            'text-ink cursor-pointer truncate text-left text-sm font-medium hover:underline',
            done && 'text-ink-3 line-through',
          )}
        >
          {task.title}
        </button>
        <div className="text-ink-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          {task.status === 'in_progress' && (
            <span className="text-ring font-medium">{t('row.inProgress')}</span>
          )}
          {showPost && task.post && (
            <span className="inline-flex min-w-0 items-center gap-1">
              <FileText className="size-3.5 shrink-0" aria-hidden="true" />
              {task.post.gone ? (
                <span className="italic">{t('row.postGone')}</span>
              ) : (
                <Link
                  to="/w/$slug/posts/$postId"
                  params={{ slug: workspace.slug, postId: task.post.id }}
                  className="hover:text-ink max-w-64 truncate underline-offset-2 hover:underline"
                >
                  {task.post.excerpt
                    ? t('row.post', { excerpt: task.post.excerpt })
                    : t('row.postNoText')}
                </Link>
              )}
            </span>
          )}
          {done && task.completedAt ? (
            <span>{t('row.done', { when: time.format(task.completedAt, 'date') })}</span>
          ) : (
            task.dueAt && (
              <span
                className={cn(
                  'inline-flex items-center gap-1',
                  overdue && 'text-danger font-medium',
                )}
              >
                <CalendarClock className="size-3.5" aria-hidden="true" />
                {overdue
                  ? t('row.overdue', { when: time.format(task.dueAt) })
                  : t('row.due', { when: time.format(task.dueAt) })}
              </span>
            )
          )}
        </div>
      </div>
      <span className="text-ink-2 flex shrink-0 items-center gap-1.5 text-xs">
        {task.assignee ? (
          <>
            <Avatar name={task.assignee.name} src={task.assignee.avatarUrl} size="xs" decorative />
            <span className="hidden max-w-32 truncate sm:inline">{task.assignee.name}</span>
            <span className="sr-only sm:hidden">{task.assignee.name}</span>
          </>
        ) : (
          <span className="text-ink-3">{t('row.unassigned')}</span>
        )}
      </span>
    </div>
  );
}
