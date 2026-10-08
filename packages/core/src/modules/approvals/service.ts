import {
  can,
  type ApprovePostBody,
  type Post,
  type ReviewItem,
  type ReviewStep,
} from '@socioboard/contracts';
import type { Prisma } from '@socioboard/db';

import {
  afterCursor,
  conflict,
  createUrlSigner,
  decodeCursor,
  encodeCursor,
  forbidden,
  newId,
  notFound,
  toPage,
  typedEvents,
  unprocessable,
  type AuthContext,
  type Db,
  type EventBus,
  type MemberContext,
  type Storage,
} from '../../platform';
import type { PostEvents, PostService } from '../posts';
import type { SchedulingService } from '../scheduling';

export interface ApprovalServiceDeps {
  db: Db;
  storage: Storage | undefined;
  /** The app-wide bus; review steps are post events (PostEvents). */
  events: EventBus<Record<string, unknown>>;
  posts: PostService;
  scheduling: SchedulingService;
}

/** How many posts waiting for review the queue sorts at most (they are few: people act on them). */
const PENDING_MAX = 1000;

/** A note as stored: an empty one is no note. */
const noteOf = (note: string | undefined) => (note?.length ? note : null);

const withActor = {
  actor: { select: { id: true, name: true, image: true, avatarKey: true } },
} as const;

/**
 * The review workflow (P4-B2, docs/backend/modules/approvals.md): draft → in review → approved,
 * or back to draft with changes requested. Every step is kept (PostApproval); the post's status
 * says where it is now. Steps happen under the post's row lock, so two reviewers can't both act
 * on one submission. Whether a post may go out without approval is the posts module's
 * `assertReviewed`, which publishing and scheduling call.
 */
export function createApprovalService(deps: ApprovalServiceDeps) {
  const { db, posts, scheduling } = deps;
  const events = typedEvents<PostEvents>(deps.events);
  const signUrl = createUrlSigner(deps.storage);
  const scoped = (workspaceId: string) => db.forWorkspace(workspaceId);

  async function person(
    u: { id: string; name: string; image: string | null; avatarKey: string | null } | null,
  ) {
    return u ? { id: u.id, name: u.name, avatarUrl: await signUrl(u.avatarKey ?? u.image) } : null;
  }

  async function toStep(row: {
    id: string;
    action: ReviewStep['action'];
    note: string | null;
    createdAt: Date;
    actor: { id: string; name: string; image: string | null; avatarKey: string | null } | null;
  }): Promise<ReviewStep> {
    return {
      id: row.id,
      action: row.action,
      actor: await person(row.actor),
      note: row.note,
      createdAt: row.createdAt.toISOString(),
    };
  }

  /** The post as this member may see it (404 otherwise), with what the steps check. */
  async function loadPost(member: MemberContext, postId: string) {
    await posts.assertVisible(member, postId);
    const post = await scoped(member.workspaceId).post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        status: true,
        authorId: true,
        targets: { select: { id: true, status: true } },
      },
    });
    if (!post) throw notFound('POST_NOT_FOUND', 'Post not found');
    return post;
  }

  /**
   * Under the post's row lock: refuses unless the post is still `from`, then moves it to `to`
   * and records the step.
   */
  async function step(
    member: MemberContext,
    caller: AuthContext,
    postId: string,
    from: Post['status'],
    to: Post['status'],
    action: ReviewStep['action'],
    note: string | null,
    refused: () => Error,
  ) {
    await db.client.$transaction(async (tx) => {
      const [row] = await tx.$queryRaw<{ status: string }[]>`
        SELECT status::text AS status FROM "Post"
        WHERE id = ${postId}::uuid AND "workspaceId" = ${member.workspaceId}::uuid
        FOR UPDATE`;
      if (row?.status !== from) throw refused();
      await tx.post.update({
        where: { id: postId, workspaceId: member.workspaceId },
        data: { status: to },
      });
      await tx.postApproval.create({
        data: {
          id: newId(),
          workspaceId: member.workspaceId,
          postId,
          actorId: caller.user.id,
          action,
          note,
        },
      });
    });
    // Open pages (posts, calendar, the review queue) hear of it, as of any status change.
    await posts.recomputeStatus(member.workspaceId, postId);
  }

  const notInReview = () =>
    conflict('POST_NOT_IN_REVIEW', 'This post isn’t waiting for review any more');

  /** The author sends a draft for review; it must be ready to publish (no errors). */
  async function submit(
    caller: AuthContext,
    member: MemberContext,
    postId: string,
    note: string | undefined,
  ): Promise<Post> {
    const post = await loadPost(member, postId);
    if (post.authorId !== caller.user.id) {
      throw forbidden('NOT_POST_AUTHOR', 'Only its author can send a post for review');
    }
    if (post.status === 'in_review') {
      throw conflict('POST_IN_REVIEW', 'This post is already waiting for review');
    }
    if (post.status !== 'draft') {
      throw conflict('POST_NOT_DRAFT', 'Only a draft can be sent for review');
    }
    const live = post.targets.filter((t) => t.status !== 'cancelled');
    if (live.length === 0) throw unprocessable('NO_ACCOUNTS', 'Choose at least one account');
    await posts.checkPublishable(
      member,
      postId,
      live.map((t) => t.id),
    );
    await step(member, caller, postId, 'draft', 'in_review', 'submitted', noteOf(note), () =>
      conflict('POST_NOT_DRAFT', 'Only a draft can be sent for review'),
    );
    await events.emit('post.submitted', {
      workspaceId: member.workspaceId,
      postId,
      userId: caller.user.id,
      authorId: post.authorId,
      note: noteOf(note),
      afterEdit: false,
    });
    return posts.view(member.workspaceId, postId);
  }

  /**
   * Approves a post in review, then schedules it if asked ("Approve & schedule"). When the
   * workspace reviews every post, someone other than the author approves it. If scheduling then
   * fails (a time in the past), the approval stands and the error says why.
   */
  async function approve(
    caller: AuthContext,
    member: MemberContext,
    postId: string,
    body: ApprovePostBody,
  ): Promise<Post> {
    const post = await loadPost(member, postId);
    if (post.status !== 'in_review') throw notInReview();
    if (post.authorId === caller.user.id) {
      const workspace = await db.client.workspace.findUnique({
        where: { id: member.workspaceId },
        select: { requireReviewForAll: true },
      });
      if (workspace?.requireReviewForAll) {
        throw forbidden('CANNOT_APPROVE_OWN', 'Someone else needs to approve your post');
      }
    }
    await step(
      member,
      caller,
      postId,
      'in_review',
      'approved',
      'approved',
      noteOf(body.note),
      notInReview,
    );
    await events.emit('post.approved', {
      workspaceId: member.workspaceId,
      postId,
      userId: caller.user.id,
      authorId: post.authorId,
      note: noteOf(body.note),
    });
    if (body.schedule) {
      if (!can(member.role, 'posts:publish')) {
        throw forbidden('FORBIDDEN', 'Your role can approve but not schedule');
      }
      return scheduling.schedule(caller, member, postId, body.schedule);
    }
    return posts.view(member.workspaceId, postId);
  }

  /** Sends a post in review back to its author as a draft, saying why. */
  async function requestChanges(
    caller: AuthContext,
    member: MemberContext,
    postId: string,
    note: string,
  ): Promise<Post> {
    const post = await loadPost(member, postId);
    if (post.status !== 'in_review') throw notInReview();
    await step(
      member,
      caller,
      postId,
      'in_review',
      'draft',
      'changes_requested',
      note,
      notInReview,
    );
    await events.emit('post.changes_requested', {
      workspaceId: member.workspaceId,
      postId,
      userId: caller.user.id,
      authorId: post.authorId,
      note,
    });
    return posts.view(member.workspaceId, postId);
  }

  /** The author takes their post out of review, back to a draft. */
  async function withdraw(caller: AuthContext, member: MemberContext, postId: string) {
    const post = await loadPost(member, postId);
    if (post.authorId !== caller.user.id) {
      throw forbidden('NOT_POST_AUTHOR', 'Only its author can take a post out of review');
    }
    if (post.status !== 'in_review') throw notInReview();
    await step(member, caller, postId, 'in_review', 'draft', 'withdrawn', null, notInReview);
    await events.emit('post.withdrawn', {
      workspaceId: member.workspaceId,
      postId,
      userId: caller.user.id,
    });
    return posts.view(member.workspaceId, postId);
  }

  /** A post's review history, oldest first. */
  async function history(member: MemberContext, postId: string): Promise<ReviewStep[]> {
    await posts.assertVisible(member, postId);
    const rows = await scoped(member.workspaceId).postApproval.findMany({
      where: { postId },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      select: { id: true, action: true, note: true, createdAt: true, ...withActor },
    });
    return Promise.all(rows.map(toStep));
  }

  /** Posts going only to the member's accounts, for a member limited to some (P4-B4). */
  const visiblePosts = (member: MemberContext): Prisma.PostWhereInput =>
    member.accountIds === null
      ? {}
      : { NOT: { targets: { some: { socialAccountId: { notIn: [...member.accountIds] } } } } };

  /**
   * The review queue. `pending`: posts waiting for review, the longest-waiting first (by when
   * they were last submitted). `decided`: the approvals and requests for changes, newest first.
   */
  async function list(
    member: MemberContext,
    query: { status: 'pending' | 'decided'; limit: number; cursor?: string | undefined },
  ): Promise<{ items: ReviewItem[]; nextCursor: string | null }> {
    const ws = scoped(member.workspaceId);
    if (query.status === 'decided') {
      const rows = await ws.postApproval.findMany({
        where: {
          action: { in: ['approved', 'changes_requested'] },
          post: visiblePosts(member),
          ...(query.cursor ? afterCursor(decodeCursor(query.cursor)) : {}),
        },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: query.limit + 1,
        select: { id: true, postId: true, action: true, note: true, createdAt: true, ...withActor },
      });
      const page = toPage(rows, query.limit);
      return {
        items: await Promise.all(page.items.map((s) => item(member, s.postId, s))),
        nextCursor: page.nextCursor,
      };
    }

    const waiting = await ws.post.findMany({
      where: { status: 'in_review', ...visiblePosts(member) },
      take: PENDING_MAX,
      select: {
        id: true,
        reviewSteps: {
          where: { action: 'submitted' },
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
          take: 1,
          select: { id: true, action: true, note: true, createdAt: true, ...withActor },
        },
      },
    });
    const queue = waiting
      .flatMap((p) => (p.reviewSteps[0] ? [{ postId: p.id, submitted: p.reviewSteps[0] }] : []))
      .sort(
        (a, b) =>
          a.submitted.createdAt.getTime() - b.submitted.createdAt.getTime() ||
          a.postId.localeCompare(b.postId),
      );
    const after = query.cursor ? decodeCursor(query.cursor) : null;
    const rest = after
      ? queue.filter(
          (q) =>
            q.submitted.createdAt > after.createdAt ||
            (q.submitted.createdAt.getTime() === after.createdAt.getTime() && q.postId > after.id),
        )
      : queue;
    const page = rest.slice(0, query.limit);
    const last = page.at(-1);
    return {
      items: await Promise.all(page.map((q) => item(member, q.postId, q.submitted))),
      nextCursor:
        rest.length > query.limit && last
          ? encodeCursor({ createdAt: last.submitted.createdAt, id: last.postId })
          : null,
    };
  }

  /** One queue entry: the post, who submitted it and when, and the step it is listed for. */
  async function item(
    member: MemberContext,
    postId: string,
    latest: Parameters<typeof toStep>[0],
  ): Promise<ReviewItem> {
    const submitted = await scoped(member.workspaceId).postApproval.findFirst({
      where: { postId, action: 'submitted', createdAt: { lte: latest.createdAt } },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      select: { createdAt: true, ...withActor },
    });
    return {
      post: await posts.view(member.workspaceId, postId),
      submittedBy: await person(submitted?.actor ?? null),
      submittedAt: (submitted?.createdAt ?? latest.createdAt).toISOString(),
      latest: await toStep(latest),
    };
  }

  return { submit, approve, requestChanges, withdraw, history, list };
}

export type ApprovalService = ReturnType<typeof createApprovalService>;
