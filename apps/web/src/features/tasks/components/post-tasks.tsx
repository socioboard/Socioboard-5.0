import { Button, Skeleton } from '@socioboard/ui';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useCan } from '../../../lib/permissions';
import { useWorkspace } from '../../../lib/workspace';
import { tasksQuery } from '../api';
import { TaskDialog, type TaskDialogState } from './task-dialog';
import { TaskList } from './task-list';

/** A post's tasks on its page (P4-F4), to do first, with Add task. */
export function PostTasks({ post }: { post: { id: string; excerpt: string } }) {
  const { t } = useTranslation('tasks');
  const { workspace } = useWorkspace();
  const can = useCan();
  const headingId = useId();
  const result = useInfiniteQuery(tasksQuery(workspace.id, { postId: post.id }));
  const [dialog, setDialog] = useState<TaskDialogState>(null);
  const tasks = result.data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <h3 id={headingId} className="text-ink text-sm font-semibold">
          {t('post.title')}
          {tasks.length > 0 && (
            <span className="text-ink-3 ml-1.5 font-normal tabular-nums">{tasks.length}</span>
          )}
        </h3>
        {can('tasks:manage') && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setDialog({ mode: 'new', post });
            }}
          >
            <Plus aria-hidden="true" />
            {t('post.add')}
          </Button>
        )}
      </div>
      {result.isPending ? (
        <Skeleton className="h-14 rounded-xl" aria-hidden="true" />
      ) : tasks.length === 0 ? (
        <p className="text-ink-3 text-sm">{t('post.empty')}</p>
      ) : (
        <TaskList
          tasks={tasks}
          showPost={false}
          onOpen={(task) => {
            setDialog({ mode: 'edit', task });
          }}
        />
      )}
      <TaskDialog
        state={dialog}
        onClose={() => {
          setDialog(null);
        }}
      />
    </section>
  );
}
