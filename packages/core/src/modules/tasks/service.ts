import {
  can,
  realtimeRooms,
  type CreateTaskBody,
  type Task,
  type TaskStatus,
  type UpdateTaskBody,
} from '@socioboard/contracts';
import type { Prisma } from '@socioboard/db';

import {
  badRequest,
  createUrlSigner,
  forbidden,
  newId,
  notFound,
  typedEvents,
  unprocessable,
  type AuthContext,
  type Clock,
  type Db,
  type EventBus,
  type MemberContext,
  type Realtime,
  type Storage,
} from '../../platform';
import type { PostService } from '../posts';
import { membersWhoSeePost } from '../workspaces';
import type { TaskEvents } from './events';

export interface TaskServiceDeps {
  db: Db;
  clock: Clock;
  storage: Storage | undefined;
  realtime: Realtime;
  events: EventBus<Record<string, unknown>>;
  posts: Pick<PostService, 'assertVisible'>;
}

/** How much of a post's text a task shows. */
const EXCERPT_CHARS = 80;
/** Reminders go out this long before a task is due. */
export const TASK_REMINDER_BEFORE_MS = 24 * 3_600_000;

const person = { select: { id: true, name: true, image: true, avatarKey: true } } as const;
const withPeople = { assignee: person, createdBy: person } as const;
type Row = Prisma.TaskGetPayload<{ include: typeof withPeople }>;

/** The start of a post's text, cut between graphemes (an emoji or accented letter stays whole). */
const graphemes = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
function excerpt(text: string): string {
  let out = '';
  let count = 0;
  for (const { segment } of graphemes.segment(text.trim())) {
    if (count === EXCERPT_CHARS) break;
    out += segment;
    count += 1;
  }
  return out;
}

/** Pages are counted, not keyed: the order (done last, by due date) has no single sort key. */
const encodeOffset = (offset: number) => Buffer.from(`o:${String(offset)}`).toString('base64url');
function decodeOffset(cursor: string): number {
  const match = /^o:(\d{1,9})$/.exec(Buffer.from(cursor, 'base64url').toString('utf8'));
  if (!match) throw badRequest('INVALID_CURSOR', 'The page cursor is not valid');
  return Number(match[1]);
}

/**
 * Tasks (P4-B5, docs/backend/modules/tasks.md): work assignments in a workspace, often about a
 * post. Anyone who can read posts sees them, except tasks about a post they can't see (P4-B4);
 * `tasks:manage` creates and edits them, an assignee can move their own task between statuses,
 * and its creator or someone who manages members deletes it.
 */
export function createTaskService(deps: TaskServiceDeps) {
  const { db, clock, posts, realtime } = deps;
  const events = typedEvents<TaskEvents>(deps.events);
  const signUrl = createUrlSigner(deps.storage);
  const scoped = (workspaceId: string) => db.forWorkspace(workspaceId);

  const changed = (workspaceId: string, taskId: string) => {
    realtime.emit(realtimeRooms.workspace(workspaceId), 'task.changed', { workspaceId, taskId });
  };

  async function toPerson(u: Row['assignee']) {
    return u ? { id: u.id, name: u.name, avatarUrl: await signUrl(u.avatarKey ?? u.image) } : null;
  }

  async function toTasks(workspaceId: string, rows: Row[]): Promise<Task[]> {
    const postIds = [...new Set(rows.flatMap((r) => (r.postId ? [r.postId] : [])))];
    const found = new Map(
      (
        await scoped(workspaceId).post.findMany({
          where: { id: { in: postIds } },
          select: { id: true, text: true },
        })
      ).map((p) => [p.id, p.text]),
    );
    return Promise.all(
      rows.map(async (r) => {
        const text = r.postId ? found.get(r.postId) : undefined;
        return {
          id: r.id,
          title: r.title,
          description: r.description,
          status: r.status,
          post: r.postId
            ? {
                id: r.postId,
                excerpt: excerpt(text ?? ''),
                gone: text === undefined,
              }
            : null,
          assignee: await toPerson(r.assignee),
          createdBy: await toPerson(r.createdBy),
          dueAt: r.dueAt?.toISOString() ?? null,
          completedAt: r.completedAt?.toISOString() ?? null,
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
        };
      }),
    );
  }

  const toTask = async (workspaceId: string, row: Row) => {
    const [task] = await toTasks(workspaceId, [row]);
    if (!task) throw new Error('A task row always makes a task');
    return task;
  };

  /**
   * Posts a member limited to some accounts can't see (any account of theirs is outside), whose
   * tasks they don't see either. Empty for everyone else.
   */
  async function hiddenPostIds(member: MemberContext): Promise<string[]> {
    if (member.accountIds === null) return [];
    const rows = await scoped(member.workspaceId).post.findMany({
      where: { targets: { some: { socialAccountId: { notIn: [...member.accountIds] } } } },
      select: { id: true },
    });
    return rows.map((r) => r.id);
  }

  /** The task, if this member may see it (404 otherwise). */
  async function findTask(member: MemberContext, taskId: string) {
    const row = await scoped(member.workspaceId).task.findUnique({
      where: { id: taskId },
      include: withPeople,
    });
    if (!row || (row.postId && (await hiddenPostIds(member)).includes(row.postId))) {
      throw notFound('TASK_NOT_FOUND', 'Task not found');
    }
    return row;
  }

  /** The post must be one the caller can see; the assignee a member who can see it too. */
  async function checkRefs(
    member: MemberContext,
    refs: { postId: string | null; assigneeId: string | null },
  ) {
    if (refs.postId) await posts.assertVisible(member, refs.postId);
    if (!refs.assigneeId) return;
    const isMember = await db.client.member.findFirst({
      where: { workspaceId: member.workspaceId, userId: refs.assigneeId },
      select: { id: true },
    });
    if (!isMember) {
      throw unprocessable('ASSIGNEE_NOT_MEMBER', 'Tasks can only be given to workspace members');
    }
    if (refs.postId) {
      const seers = await membersWhoSeePost(db, member.workspaceId, refs.postId);
      if (!seers.some((m) => m.userId === refs.assigneeId)) {
        throw unprocessable(
          'ASSIGNEE_CANNOT_SEE_POST',
          'This person can’t see the post, so the task can’t be given to them',
        );
      }
    }
  }

  async function list(
    member: MemberContext,
    userId: string,
    query: {
      limit: number;
      cursor?: string | undefined;
      assignee?: string | undefined;
      status?: TaskStatus[] | undefined;
      postId?: string | undefined;
    },
  ) {
    const offset = query.cursor ? decodeOffset(query.cursor) : 0;
    const hidden = await hiddenPostIds(member);
    const rows = await scoped(member.workspaceId).task.findMany({
      where: {
        ...(query.assignee
          ? { assigneeId: query.assignee === 'me' ? userId : query.assignee }
          : {}),
        ...(query.status ? { status: { in: query.status } } : {}),
        ...(query.postId ? { postId: query.postId } : {}),
        ...(hidden.length > 0 ? { OR: [{ postId: null }, { postId: { notIn: hidden } }] } : {}),
      },
      include: withPeople,
      // Not done first (no completion time), by due date with undated ones last; then done ones,
      // the latest first.
      orderBy: [
        { completedAt: { sort: 'desc', nulls: 'first' } },
        { dueAt: { sort: 'asc', nulls: 'last' } },
        { createdAt: 'desc' },
        { id: 'desc' },
      ],
      skip: offset,
      take: query.limit + 1,
    });
    const page = rows.slice(0, query.limit);
    return {
      items: await toTasks(member.workspaceId, page),
      nextCursor: rows.length > query.limit ? encodeOffset(offset + query.limit) : null,
    };
  }

  async function create(caller: AuthContext, member: MemberContext, body: CreateTaskBody) {
    const postId = body.postId ?? null;
    const assigneeId = body.assigneeId ?? null;
    await checkRefs(member, { postId, assigneeId });
    const row = await scoped(member.workspaceId).task.create({
      data: {
        id: newId(),
        workspaceId: member.workspaceId,
        title: body.title,
        description: body.description,
        postId,
        assigneeId,
        createdById: caller.user.id,
        dueAt: body.dueAt ? new Date(body.dueAt) : null,
      },
      include: withPeople,
    });
    const base = { workspaceId: member.workspaceId, taskId: row.id, userId: caller.user.id };
    await events.emit('task.created', { ...base, title: row.title });
    if (assigneeId) await events.emit('task.assigned', { ...base, assigneeId });
    changed(member.workspaceId, row.id);
    return toTask(member.workspaceId, row);
  }

  /**
   * With `tasks:manage`, anything; its assignee, only the status. Done stamps `completedAt`
   * (cleared when reopened); a new due date sends its reminder again.
   */
  async function update(
    caller: AuthContext,
    member: MemberContext,
    taskId: string,
    body: UpdateTaskBody,
  ) {
    const task = await findTask(member, taskId);
    const fields = Object.keys(body);
    if (!can(member.role, 'tasks:manage')) {
      const mine = task.assigneeId === caller.user.id;
      if (!mine || fields.some((f) => f !== 'status')) {
        throw forbidden(
          'TASK_STATUS_ONLY',
          mine
            ? 'You can only change the status of a task given to you'
            : 'Only its assignee or someone who manages tasks can change this task',
        );
      }
    }
    const postId = body.postId === undefined ? task.postId : body.postId;
    const assigneeId = body.assigneeId === undefined ? task.assigneeId : body.assigneeId;
    if (body.postId !== undefined || body.assigneeId !== undefined) {
      await checkRefs(member, { postId, assigneeId });
    }
    const completing = body.status === 'done' && task.status !== 'done';
    const reopening = body.status !== undefined && body.status !== 'done';
    const dueAt = body.dueAt === undefined ? undefined : body.dueAt ? new Date(body.dueAt) : null;
    const row = await scoped(member.workspaceId).task.update({
      where: { id: task.id },
      data: {
        ...(body.title === undefined ? {} : { title: body.title }),
        ...(body.description === undefined ? {} : { description: body.description }),
        ...(body.status === undefined ? {} : { status: body.status }),
        ...(body.postId === undefined ? {} : { postId }),
        ...(body.assigneeId === undefined ? {} : { assigneeId }),
        ...(dueAt === undefined ? {} : { dueAt, reminderSentAt: null }),
        ...(completing ? { completedAt: clock.now() } : reopening ? { completedAt: null } : {}),
      },
      include: withPeople,
    });
    const base = { workspaceId: member.workspaceId, taskId: task.id, userId: caller.user.id };
    await events.emit('task.updated', { ...base, fields });
    if (assigneeId && assigneeId !== task.assigneeId) {
      await events.emit('task.assigned', { ...base, assigneeId });
    }
    if (completing) {
      await events.emit('task.completed', { ...base, createdById: task.createdById });
    }
    changed(member.workspaceId, task.id);
    return toTask(member.workspaceId, row);
  }

  async function remove(caller: AuthContext, member: MemberContext, taskId: string) {
    const task = await findTask(member, taskId);
    if (task.createdById !== caller.user.id && !can(member.role, 'members:manage')) {
      throw forbidden('NOT_TASK_CREATOR', 'Only whoever made this task can delete it');
    }
    await scoped(member.workspaceId).task.delete({ where: { id: task.id } });
    await events.emit('task.deleted', {
      workspaceId: member.workspaceId,
      taskId: task.id,
      userId: caller.user.id,
      title: task.title,
    });
    changed(member.workspaceId, task.id);
  }

  /**
   * The `task-reminders` job: tasks due within a day, not done, with an assignee and no reminder
   * yet. Each is claimed (reminderSentAt) before its event, so two runs never send one twice.
   * A task created already less than a day from due gets its reminder on the next run.
   */
  async function remindDue(): Promise<number> {
    const now = clock.now();
    const due = await db.client.task.findMany({
      where: {
        status: { not: 'done' },
        assigneeId: { not: null },
        reminderSentAt: null,
        dueAt: { gt: now, lte: new Date(now.getTime() + TASK_REMINDER_BEFORE_MS) },
      },
      select: { id: true, workspaceId: true, assigneeId: true, dueAt: true },
      take: 500,
    });
    let sent = 0;
    for (const task of due) {
      const { count } = await db.client.task.updateMany({
        where: { id: task.id, reminderSentAt: null },
        data: { reminderSentAt: now },
      });
      if (count === 0 || !task.assigneeId || !task.dueAt) continue;
      await events.emit('task.due', {
        workspaceId: task.workspaceId,
        taskId: task.id,
        assigneeId: task.assigneeId,
        dueAt: task.dueAt.toISOString(),
      });
      sent += 1;
    }
    return sent;
  }

  return { list, create, update, remove, remindDue };
}

export type TaskService = ReturnType<typeof createTaskService>;
