import {
  apiRoutes,
  parseLocalDate,
  parseTime,
  TASK_DESCRIPTION_MAX,
  TASK_TITLE_MAX,
  toLocalDate,
  toTimeOfDay,
  wallClock,
  zonedTime,
  type Task,
  type TaskStatus,
} from '@socioboard/contracts';
import {
  Button,
  ConfirmDialog,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  FormField,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  toast,
} from '@socioboard/ui';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { api } from '../../../lib/api';
import { relativeTime } from '../../../lib/format';
import { errorMessage } from '../../../lib/i18n';
import { membersQuery } from '../../../lib/members';
import { useCan } from '../../../lib/permissions';
import { useNow } from '../../../lib/use-now';
import { useWorkspaceTime } from '../../../lib/use-workspace-time';
import { useWorkspace } from '../../../lib/workspace';
import { mentionableQuery } from '../../comments';
import { taskKeys } from '../api';

/** No one assigned (Radix Select items can't have an empty value). */
const NOBODY = '__nobody';
/** A due date without a time is due at the end of the working day. */
const DEFAULT_DUE_TIME = '17:00';

export type TaskDialogState =
  | { mode: 'new'; post?: { id: string; excerpt: string } | undefined }
  | { mode: 'edit'; task: Task }
  | null;

/**
 * Creating or opening a task (P4-F4): title, details, who has it and when it's due, in the
 * workspace's timezone. People who manage tasks change everything; its assignee only the
 * status; its creator (or an admin) deletes it.
 */
export function TaskDialog({ state, onClose }: { state: TaskDialogState; onClose: () => void }) {
  const { t } = useTranslation('tasks');
  return (
    <Dialog
      open={state !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-lg" closeLabel={t('dialog.close')}>
        {/* Mounted while open: each opening starts from the task as saved. */}
        {state && <TaskForm state={state} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  );
}

function TaskForm({
  state,
  onClose,
}: {
  state: NonNullable<TaskDialogState>;
  onClose: () => void;
}) {
  const { t, i18n } = useTranslation('tasks');
  const { workspace, me } = useWorkspace();
  const can = useCan();
  const time = useWorkspaceTime();
  const queryClient = useQueryClient();
  const now = useNow();
  const task = state.mode === 'edit' ? state.task : null;
  const post = task?.post ?? (state.mode === 'new' ? state.post : undefined) ?? null;

  const manage = can('tasks:manage');
  const mineToMove = task !== null && task.assignee?.id === me.user.id;
  const mayDelete = task !== null && (task.createdBy?.id === me.user.id || can('members:manage'));

  // Who it can be given to: anyone in the workspace, or for a post, those who can see it.
  const forPost = useQuery({
    ...mentionableQuery(workspace.id, post?.id ?? ''),
    enabled: manage && post !== null,
  });
  const members = useQuery({ ...membersQuery(workspace.id), enabled: manage && post === null });
  const people =
    post !== null
      ? (forPost.data ?? [])
      : (members.data ?? []).map((m) => ({
          id: m.user.id,
          name: m.user.name,
          avatarUrl: m.user.avatarUrl,
        }));

  const due = task?.dueAt ? wallClock(Date.parse(task.dueAt), time.timeZone) : null;
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [assigneeId, setAssigneeId] = useState(task?.assignee?.id ?? NOBODY);
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? 'open');
  const [dueDate, setDueDate] = useState(due ? toLocalDate(due) : '');
  const [dueTime, setDueTime] = useState(due ? toTimeOfDay(due) : DEFAULT_DUE_TIME);
  const [tried, setTried] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const dueAt = dueDate
    ? zonedTime(
        parseLocalDate(dueDate),
        parseTime(dueTime || DEFAULT_DUE_TIME),
        time.timeZone,
      ).toISOString()
    : null;
  const titleMissing = title.trim() === '';

  const refresh = () => queryClient.invalidateQueries({ queryKey: taskKeys.all(workspace.id) });

  const save = async () => {
    setTried(true);
    if (manage && titleMissing) return;
    setSaving(true);
    try {
      const assignee = assigneeId === NOBODY ? null : assigneeId;
      if (!task) {
        await api(apiRoutes.tasks.createTask, {
          params: { workspaceId: workspace.id },
          body: {
            title: title.trim(),
            description: description.trim(),
            ...(post ? { postId: post.id } : {}),
            ...(assignee ? { assigneeId: assignee } : {}),
            ...(dueAt ? { dueAt } : {}),
          },
        });
        toast.success(t('dialog.created'));
      } else {
        await api(apiRoutes.tasks.updateTask, {
          params: { workspaceId: workspace.id, taskId: task.id },
          body: manage
            ? {
                title: title.trim(),
                description: description.trim(),
                status,
                assigneeId: assignee,
                dueAt,
              }
            : { status },
        });
        toast.success(t('dialog.saved'));
      }
      await refresh();
      onClose();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const readOnly = !manage;
  const canSave = manage || mineToMove;
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void save();
      }}
      className="flex flex-col gap-4"
      noValidate
    >
      <DialogHeader>
        <DialogTitle>{task ? t('dialog.editTitle') : t('dialog.newTitle')}</DialogTitle>
        <DialogDescription>
          {post
            ? post.excerpt
              ? t('dialog.aboutPost', { excerpt: post.excerpt })
              : t('dialog.aboutPostNoText')
            : t('dialog.description')}
        </DialogDescription>
      </DialogHeader>
      {readOnly && mineToMove && <p className="text-ink-2 text-sm">{t('dialog.readOnly')}</p>}
      <FormField
        label={t('dialog.title')}
        required
        error={tried && manage && titleMissing ? t('dialog.titleRequired') : undefined}
      >
        {(p) => (
          <Input
            {...p}
            value={title}
            maxLength={TASK_TITLE_MAX}
            placeholder={t('dialog.titlePlaceholder')}
            disabled={readOnly}
            autoFocus={!task}
            onChange={(e) => {
              setTitle(e.target.value);
            }}
          />
        )}
      </FormField>
      <FormField label={t('dialog.details')}>
        {(p) => (
          <Textarea
            {...p}
            value={description}
            rows={3}
            maxLength={TASK_DESCRIPTION_MAX}
            placeholder={t('dialog.detailsPlaceholder')}
            disabled={readOnly}
            onChange={(e) => {
              setDescription(e.target.value);
            }}
          />
        )}
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label={t('dialog.assignee')}
          hint={post && manage ? t('dialog.assigneeHint') : undefined}
        >
          {(p) => (
            <Select value={assigneeId} onValueChange={setAssigneeId} disabled={readOnly}>
              <SelectTrigger {...p}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NOBODY}>{t('dialog.nobody')}</SelectItem>
                {/* The current assignee stays listed while the people load. */}
                {[
                  ...people,
                  ...(task?.assignee && !people.some((x) => x.id === task.assignee?.id)
                    ? [task.assignee]
                    : []),
                ].map((person) => (
                  <SelectItem key={person.id} value={person.id}>
                    {person.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </FormField>
        {task && (
          <FormField label={t('dialog.status')}>
            {(p) => (
              <Select
                value={status}
                onValueChange={(v) => {
                  setStatus(v as TaskStatus);
                }}
                disabled={!canSave}
              >
                <SelectTrigger {...p}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(['open', 'in_progress', 'done'] as const).map((s) => (
                    <SelectItem key={s} value={s}>
                      {t(`status.${s}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </FormField>
        )}
      </div>
      <fieldset className="flex flex-col gap-1.5" disabled={readOnly}>
        <div className="grid grid-cols-[minmax(0,1fr)_7.5rem] gap-2">
          <FormField label={t('dialog.due')}>
            {(p) => (
              <Input
                {...p}
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                }}
              />
            )}
          </FormField>
          <FormField label={t('dialog.dueTime')}>
            {(p) => (
              <Input
                {...p}
                type="time"
                value={dueTime}
                disabled={readOnly || !dueDate}
                onChange={(e) => {
                  setDueTime(e.target.value);
                }}
              />
            )}
          </FormField>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-ink-3 text-xs">{t('dialog.dueHint', { zone: time.zone })}</p>
          {dueDate && !readOnly && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setDueDate('');
              }}
            >
              {t('dialog.clearDue')}
            </Button>
          )}
        </div>
      </fieldset>
      {task?.createdBy && (
        <p className="text-ink-3 text-xs">
          {t('dialog.createdBy', {
            name: task.createdBy.name,
            when: relativeTime(task.createdAt, now, i18n.language),
          })}
        </p>
      )}
      <DialogFooter className="sm:justify-between">
        {mayDelete ? (
          <Button
            type="button"
            variant="ghost"
            className="text-danger"
            onClick={() => {
              setDeleting(true);
            }}
          >
            {t('dialog.delete')}
          </Button>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            {canSave ? t('dialog.cancel') : t('dialog.close')}
          </Button>
          {canSave && (
            <Button type="submit" variant="primary" loading={saving}>
              {task ? t('dialog.save') : t('dialog.create')}
            </Button>
          )}
        </div>
      </DialogFooter>
      {task && (
        <ConfirmDialog
          open={deleting}
          onOpenChange={setDeleting}
          title={t('dialog.deleteTitle')}
          description={t('dialog.deleteBody', { title: task.title })}
          confirmLabel={t('dialog.delete')}
          cancelLabel={t('dialog.cancel')}
          tone="danger"
          errorMessage={errorMessage}
          onConfirm={async () => {
            await api(apiRoutes.tasks.deleteTask, {
              params: { workspaceId: workspace.id, taskId: task.id },
            });
            toast.success(t('dialog.deleted'));
            await refresh();
            onClose();
          }}
        />
      )}
    </form>
  );
}
