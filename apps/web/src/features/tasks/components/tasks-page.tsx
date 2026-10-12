import type { Task } from '@socioboard/contracts';
import { Button, EmptyState, motion, PageHeader, Skeleton, springs } from '@socioboard/ui';
import { useInfiniteQuery } from '@tanstack/react-query';
import { ListChecks, Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useCan } from '../../../lib/permissions';
import { useWorkspace } from '../../../lib/workspace';
import { DONE, tasksQuery, TODO } from '../api';
import { TaskDialog, type TaskDialogState } from './task-dialog';
import { TaskList } from './task-list';

export interface TasksSearch {
  /** Everyone's instead of the reader's own; undefined for their own. */
  view?: 'all' | undefined;
  /** Done instead of to do; undefined for to do. */
  show?: 'done' | undefined;
  /** A task to open (a notification's link). */
  task?: string | undefined;
}

/**
 * `/w/:slug/tasks` (P4-F4, docs/frontend/areas/posts.md): the reader's tasks or everyone's, to do
 * (the soonest due first) or done; ticking one done, opening one to change it, and New task.
 */
export function TasksPage({
  search,
  onSearchChange,
}: {
  search: TasksSearch;
  onSearchChange: (patch: Partial<TasksSearch>) => void;
}) {
  const { t } = useTranslation('tasks');
  const { workspace } = useWorkspace();
  const can = useCan();
  const view = search.view ?? 'mine';
  const show = search.show ?? 'todo';
  const result = useInfiniteQuery(
    tasksQuery(workspace.id, {
      ...(view === 'mine' ? { assignee: 'me' as const } : {}),
      status: show === 'done' ? DONE : TODO,
    }),
  );
  const [dialog, setDialog] = useState<TaskDialogState>(null);
  const tasks = result.data?.pages.flatMap((p) => p.items) ?? [];
  // A notification's task opens once it's in the list.
  const linked = search.task ? tasks.find((x) => x.id === search.task) : undefined;
  const open: TaskDialogState = dialog ?? (linked ? { mode: 'edit', task: linked } : null);

  const close = () => {
    setDialog(null);
    if (search.task) onSearchChange({ task: undefined });
  };

  let body;
  if (result.isPending) {
    body = (
      <div className="flex flex-col gap-1.5" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-14 rounded-xl" />
        ))}
      </div>
    );
  } else if (result.isError) {
    body = (
      <EmptyState
        title={t('loadError')}
        action={<Button onClick={() => void result.refetch()}>{t('retry')}</Button>}
      />
    );
  } else if (tasks.length === 0) {
    const key = show === 'done' ? 'done' : view === 'mine' ? 'mineTodo' : 'allTodo';
    body = (
      <EmptyState
        icon={<ListChecks />}
        title={t(`empty.${key}`)}
        description={t(`empty.${key}Body`)}
        action={
          show === 'todo' && can('tasks:manage') ? (
            <Button
              variant="primary"
              onClick={() => {
                setDialog({ mode: 'new' });
              }}
            >
              <Plus aria-hidden="true" />
              {t('new')}
            </Button>
          ) : undefined
        }
      />
    );
  } else {
    body = (
      <>
        <TaskList
          tasks={tasks}
          onOpen={(task: Task) => {
            setDialog({ mode: 'edit', task });
          }}
        />
        {result.hasNextPage && (
          <Button
            variant="ghost"
            className="self-center"
            loading={result.isFetchingNextPage}
            onClick={() => void result.fetchNextPage()}
          >
            {t('loadMore')}
          </Button>
        )}
      </>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t('title')}
        actions={
          can('tasks:manage') && (
            <Button
              variant="primary"
              onClick={() => {
                setDialog({ mode: 'new' });
              }}
            >
              <Plus aria-hidden="true" />
              {t('new')}
            </Button>
          )
        }
      />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 py-5 sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <Toggle
              id={`tasks-view-${workspace.id}`}
              label={t('view.label')}
              value={view}
              options={[
                { value: 'mine', label: t('view.mine') },
                { value: 'all', label: t('view.all') },
              ]}
              onChange={(v) => {
                onSearchChange({ view: v === 'all' ? 'all' : undefined });
              }}
            />
            <Toggle
              id={`tasks-show-${workspace.id}`}
              label={t('show.label')}
              value={show}
              options={[
                { value: 'todo', label: t('show.todo') },
                { value: 'done', label: t('show.done') },
              ]}
              onChange={(v) => {
                onSearchChange({ show: v === 'done' ? 'done' : undefined });
              }}
            />
          </div>
          {body}
        </div>
      </div>
      <TaskDialog state={open} onClose={close} />
    </div>
  );
}

/** Two choices as pressed buttons, the chosen one marked by a sliding chip. */
function Toggle({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="glass-chip rounded-control relative flex p-1" role="group" aria-label={label}>
      {options.map((o) => (
        <Button
          key={o.value}
          variant="ghost"
          size="sm"
          aria-pressed={value === o.value}
          className="relative isolate"
          onClick={() => {
            onChange(o.value);
          }}
        >
          {value === o.value && (
            <motion.span
              layoutId={id}
              className="bg-chip border-hair absolute inset-0 -z-10 rounded-[7px] border shadow-sm"
              transition={springs.snappy}
            />
          )}
          {o.label}
        </Button>
      ))}
    </div>
  );
}
