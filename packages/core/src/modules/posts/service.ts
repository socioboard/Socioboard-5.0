import {
  can,
  PublishError,
  TargetOverride,
  type CreatePostBody,
  type ListPostsQuery,
  type NetworkId,
  type Post,
  type PostDetails,
  type PostTarget,
  type TargetInput,
  type UpdatePostBody,
  type ValidatePostBody,
  type ValidatePostResponse,
  type ValidationIssue,
} from '@socioboard/contracts';
import { Prisma } from '@socioboard/db';
import { issue, type ContentMedia, type Registry } from '@socioboard/providers';
import type { z } from 'zod';

import {
  afterCursor,
  AppError,
  createUrlSigner,
  decodeCursor,
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
import { deriveStatus, LOCKED_TARGET, resolveContent, type SharedContent } from './content';
import type { PostEvents } from './events';

export interface PostServiceDeps {
  db: Db;
  storage: Storage | undefined;
  events: EventBus<Record<string, unknown>>;
  registry: Registry;
}

/** Issue codes of our own; each network's adapter adds its codes (providers IssueCode). */
export const PostIssueCode = {
  NO_ACCOUNTS: 'NO_ACCOUNTS',
  ACCOUNT_NOT_AVAILABLE: 'ACCOUNT_NOT_AVAILABLE',
  ACCOUNT_NEEDS_RECONNECT: 'ACCOUNT_NEEDS_RECONNECT',
  ACCOUNT_PAUSED: 'ACCOUNT_PAUSED',
  NETWORK_NOT_ENABLED: 'NETWORK_NOT_ENABLED',
  OPTIONS_NOT_FOR_NETWORK: 'OPTIONS_NOT_FOR_NETWORK',
  MEDIA_NOT_FOUND: 'MEDIA_NOT_FOUND',
  MEDIA_NOT_READY: 'MEDIA_NOT_READY',
  MEDIA_FAILED: 'MEDIA_FAILED',
} as const;

/** Keys of `override.options` by the network they belong to. */
const OPTION_NETWORK: Record<string, NetworkId> = { instagram: 'instagram' };

const targetInclude = {
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
} as const;
const postInclude = {
  author: { select: { id: true, name: true, image: true, avatarKey: true } },
  targets: { include: targetInclude, orderBy: { createdAt: 'asc' } },
} as const;
type PostRow = Prisma.PostGetPayload<{ include: typeof postInclude }>;
type TargetRow = PostRow['targets'][number];

type Body<T extends z.ZodType> = z.infer<T>;

function safeUrl(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null;
  } catch {
    return null;
  }
}

export function createPostService(deps: PostServiceDeps) {
  const { db, registry } = deps;
  const events = typedEvents<PostEvents>(deps.events);
  const signUrl = createUrlSigner(deps.storage);
  const scoped = (workspaceId: string) => db.forWorkspace(workspaceId);

  // ---------------------------------------------------------------- shaping

  const parseOverride = (value: Prisma.JsonValue | null) =>
    value === null ? null : (TargetOverride.safeParse(value).data ?? null);

  function toTarget(t: TargetRow): PostTarget {
    return {
      id: t.id,
      account: { ...t.account, avatarUrl: safeUrl(t.account.avatarUrl) },
      override: parseOverride(t.override),
      status: t.status,
      scheduledAt: t.scheduledAt?.toISOString() ?? null,
      externalPostId: t.externalPostId,
      permalink: safeUrl(t.permalink),
      attempts: t.attempts,
      lastError: t.lastError === null ? null : (PublishError.safeParse(t.lastError).data ?? null),
      publishedAt: t.publishedAt?.toISOString() ?? null,
    };
  }

  async function toPost(p: PostRow): Promise<Post> {
    return {
      id: p.id,
      status: p.status,
      text: p.text,
      mediaIds: p.mediaIds,
      link: p.link,
      firstComment: p.firstComment,
      labelIds: p.labelIds,
      author: p.author
        ? {
            id: p.author.id,
            name: p.author.name,
            avatarUrl: await signUrl(p.author.avatarKey ?? p.author.image),
          }
        : null,
      targets: p.targets.map(toTarget),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    };
  }

  // ---------------------------------------------------------------- lookups and checks

  async function findPost(workspaceId: string, postId: string) {
    const post = await scoped(workspaceId).post.findUnique({
      where: { id: postId },
      include: postInclude,
    });
    if (!post) throw notFound('POST_NOT_FOUND', 'Post not found');
    return post;
  }

  /** The author may edit their post; `posts:approve` roles may edit anyone's. */
  function assertCanEdit(caller: AuthContext, member: MemberContext, post: PostRow) {
    if (post.authorId !== caller.user.id && !can(member.role, 'posts:approve')) {
      throw forbidden('NOT_POST_AUTHOR', 'You can only change your own posts');
    }
  }

  const allMediaIds = (content: { mediaIds?: string[] | undefined }, targets: TargetInput[]) => [
    ...new Set([
      ...(content.mediaIds ?? []),
      ...targets.flatMap((t) => t.override?.mediaIds ?? []),
    ]),
  ];

  /**
   * References must point inside the workspace: accounts that aren't disconnected (unless the
   * post already targets them), media not deleted, and options only for the account's network.
   */
  async function checkReferences(
    workspaceId: string,
    content: { mediaIds?: string[] | undefined },
    targets: TargetInput[],
    alreadyTargeted = new Set<string>(),
  ) {
    const ws = scoped(workspaceId);
    const accounts = await ws.socialAccount.findMany({
      where: { id: { in: targets.map((t) => t.accountId) } },
      select: { id: true, network: true, status: true },
    });
    const byId = new Map(accounts.map((a) => [a.id, a]));
    // Not in this workspace: 404, like any other foreign id (nothing says it exists elsewhere).
    const missing = targets.map((t) => t.accountId).filter((id) => !byId.has(id));
    if (missing.length > 0) {
      throw new AppError(404, 'ACCOUNT_NOT_FOUND', 'Account not found', { accountIds: missing });
    }
    const disconnected = targets
      .map((t) => t.accountId)
      .filter((id) => byId.get(id)?.status === 'disconnected' && !alreadyTargeted.has(id));
    if (disconnected.length > 0) {
      throw unprocessable('ACCOUNT_NOT_AVAILABLE', 'Some accounts are disconnected', {
        accountIds: disconnected,
      });
    }
    for (const t of targets) {
      const network = byId.get(t.accountId)?.network;
      const wrong = Object.keys(t.override?.options ?? {}).filter(
        (k) => OPTION_NETWORK[k] !== network,
      );
      if (wrong.length > 0) {
        throw unprocessable(
          'OPTIONS_NOT_FOR_NETWORK',
          `Options ${wrong.join(', ')} don't apply to this account's network`,
          { accountId: t.accountId, options: wrong },
        );
      }
    }
    const mediaIds = allMediaIds(content, targets);
    if (mediaIds.length > 0) {
      const found = await ws.mediaAsset.findMany({
        where: { id: { in: mediaIds }, deletedAt: null },
        select: { id: true },
      });
      const have = new Set(found.map((m) => m.id));
      const gone = mediaIds.filter((id) => !have.has(id));
      if (gone.length > 0) {
        throw new AppError(404, 'MEDIA_NOT_FOUND', 'Media not found', { mediaIds: gone });
      }
    }
  }

  /** A stored override: the JSON, or database NULL for "no override". */
  const overrideJson = (o: TargetInput['override']) =>
    o === null ? Prisma.DbNull : (o as Prisma.InputJsonValue);

  /**
   * Locks the post row for the rest of the transaction, then refuses if a target is publishing
   * or published. Editing, deleting and publish-now (P1-B7) all take this lock, so an edit can't
   * slip in between "nothing is publishing" and the write while a publish starts.
   */
  async function lockUnpublished(
    tx: Prisma.TransactionClient,
    workspaceId: string,
    postId: string,
    refuse: () => Error,
  ) {
    await tx.$queryRaw`SELECT id FROM "Post" WHERE id = ${postId}::uuid AND "workspaceId" = ${workspaceId}::uuid FOR UPDATE`;
    const locked = await tx.postTarget.count({
      where: { workspaceId, postId, status: { in: [...LOCKED_TARGET] } },
    });
    if (locked > 0) throw refuse();
  }

  const notEditable = () =>
    unprocessable(
      'POST_NOT_EDITABLE',
      'This post is being published or was published, so it can’t be changed',
    );
  const notDeletable = () =>
    unprocessable(
      'POST_NOT_DELETABLE',
      'Posts that are being published or were published stay in the history',
    );

  async function recomputeStatus(workspaceId: string, postId: string) {
    const ws = scoped(workspaceId);
    const post = await ws.post.findUnique({
      where: { id: postId },
      select: { status: true, targets: { select: { status: true } } },
    });
    if (!post) return;
    const status = deriveStatus(post.status, post.targets);
    if (status !== post.status) await ws.post.update({ where: { id: postId }, data: { status } });
  }

  // ---------------------------------------------------------------- validation

  /**
   * Checks the content for every target, as it will be published: our checks (account usable,
   * media ready, options for the right network), then the network adapter's rules on the merged
   * content. Used by the composer on every edit and before publishing.
   */
  async function validate(
    member: MemberContext,
    body: Body<typeof ValidatePostBody>,
  ): Promise<ValidatePostResponse> {
    const ws = scoped(member.workspaceId);
    const accounts = await ws.socialAccount.findMany({
      where: { id: { in: body.targets.map((t) => t.accountId) } },
      select: { id: true, network: true, status: true },
    });
    const unknown = body.targets.filter((t) => !accounts.some((a) => a.id === t.accountId));
    if (unknown.length > 0) {
      throw new AppError(404, 'ACCOUNT_NOT_FOUND', 'Account not found', {
        accountIds: unknown.map((t) => t.accountId),
      });
    }
    const mediaIds = allMediaIds(body, body.targets);
    const mediaRows = mediaIds.length
      ? await ws.mediaAsset.findMany({ where: { id: { in: mediaIds }, deletedAt: null } })
      : [];
    const media = new Map(mediaRows.map((m) => [m.id, m]));
    const shared: SharedContent = {
      text: body.text,
      mediaIds: body.mediaIds,
      link: body.link,
      firstComment: body.firstComment,
    };

    const issues: ValidationIssue[] = [];
    if (body.targets.length === 0) {
      issues.push(
        issue('error', PostIssueCode.NO_ACCOUNTS, 'Choose at least one account.', {
          field: 'account',
        }),
      );
    }

    const targets = body.targets.map((t) => {
      const account = accounts.find((a) => a.id === t.accountId);
      const network = account?.network ?? 'facebook_page';
      const found: ValidationIssue[] = [];
      const add = (...i: Parameters<typeof issue>) => found.push(issue(...i));
      if (account?.status === 'disconnected') {
        add('error', PostIssueCode.ACCOUNT_NOT_AVAILABLE, 'This account is disconnected.', {
          field: 'account',
        });
      } else if (account?.status === 'reauth_required') {
        add(
          'error',
          PostIssueCode.ACCOUNT_NEEDS_RECONNECT,
          'Reconnect this account to post to it.',
          {
            field: 'account',
          },
        );
      } else if (account?.status === 'paused') {
        add('error', PostIssueCode.ACCOUNT_PAUSED, 'This account is paused.', { field: 'account' });
      }
      for (const key of Object.keys(t.override?.options ?? {})) {
        if (OPTION_NETWORK[key] !== network) {
          add(
            'error',
            PostIssueCode.OPTIONS_NOT_FOR_NETWORK,
            `"${key}" options don't apply here.`,
            {
              field: 'options',
              params: { option: key },
            },
          );
        }
      }
      if (!registry.isEnabled(network)) {
        add(
          'error',
          PostIssueCode.NETWORK_NOT_ENABLED,
          'This network is not enabled on this server.',
          {
            field: 'account',
          },
        );
        return { accountId: t.accountId, network, issues: found };
      }

      const content = resolveContent(shared, t.override);
      const usable: ContentMedia[] = [];
      for (const id of content.mediaIds) {
        const m = media.get(id);
        if (!m) {
          add('error', PostIssueCode.MEDIA_NOT_FOUND, 'This file was deleted.', {
            field: 'media',
            mediaId: id,
          });
        } else if (m.status === 'failed') {
          add('error', PostIssueCode.MEDIA_FAILED, "This file couldn't be processed.", {
            field: 'media',
            mediaId: id,
          });
        } else {
          if (m.status !== 'ready') {
            add('error', PostIssueCode.MEDIA_NOT_READY, 'This file is still being processed.', {
              field: 'media',
              mediaId: id,
            });
          }
          usable.push({
            id: m.id,
            kind: m.kind,
            mime: m.mime,
            sizeBytes: m.sizeBytes,
            width: m.width,
            height: m.height,
            durationSec: m.durationSec,
            altText: m.altText,
          });
        }
      }
      found.push(
        ...registry.network(network).validate({
          text: content.text,
          media: usable,
          link: content.link,
          firstComment: content.firstComment,
          options: content.options,
        }),
      );
      return { accountId: t.accountId, network, issues: found };
    });
    return { issues, targets };
  }

  // ---------------------------------------------------------------- create, edit, delete

  async function createDraft(
    caller: AuthContext,
    member: MemberContext,
    body: Body<typeof CreatePostBody>,
  ) {
    await checkReferences(member.workspaceId, body, body.targets);
    const id = newId();
    await db.client.$transaction(async (tx) => {
      await tx.post.create({
        data: {
          id,
          workspaceId: member.workspaceId,
          authorId: caller.user.id,
          status: 'draft',
          text: body.text,
          mediaIds: body.mediaIds,
          link: body.link ?? null,
          firstComment: body.firstComment ?? null,
        },
      });
      await tx.postTarget.createMany({
        data: body.targets.map((t) => ({
          id: newId(),
          workspaceId: member.workspaceId,
          postId: id,
          socialAccountId: t.accountId,
          override: overrideJson(t.override),
        })),
      });
    });
    await events.emit('post.created', {
      workspaceId: member.workspaceId,
      postId: id,
      userId: caller.user.id,
    });
    return toPost(await findPost(member.workspaceId, id));
  }

  async function update(
    caller: AuthContext,
    member: MemberContext,
    postId: string,
    body: Body<typeof UpdatePostBody>,
  ) {
    const post = await findPost(member.workspaceId, postId);
    assertCanEdit(caller, member, post);
    // Checked early for a quick answer; checked again under the lock below.
    if (post.targets.some((t) => LOCKED_TARGET.includes(t.status))) throw notEditable();
    const targets = body.targets;
    await checkReferences(
      member.workspaceId,
      { mediaIds: body.mediaIds },
      targets ?? [],
      new Set(post.targets.map((t) => t.socialAccountId)),
    );

    await db.client.$transaction(async (tx) => {
      await lockUnpublished(tx, member.workspaceId, post.id, notEditable);
      await tx.post.update({
        where: { id: post.id, workspaceId: member.workspaceId },
        data: {
          ...(body.text !== undefined ? { text: body.text } : {}),
          ...(body.mediaIds !== undefined ? { mediaIds: body.mediaIds } : {}),
          ...(body.link !== undefined ? { link: body.link } : {}),
          ...(body.firstComment !== undefined ? { firstComment: body.firstComment } : {}),
        },
      });
      if (!targets) return;
      // The new list replaces the old: removed accounts go, new ones join, kept ones keep
      // their history and take the new override.
      const keep = new Set(targets.map((t) => t.accountId));
      await tx.postTarget.deleteMany({
        where: {
          postId: post.id,
          workspaceId: member.workspaceId,
          socialAccountId: { notIn: [...keep] },
        },
      });
      for (const t of targets) {
        const existing = post.targets.find((x) => x.socialAccountId === t.accountId);
        if (existing) {
          await tx.postTarget.update({
            where: { id: existing.id, workspaceId: member.workspaceId },
            data: {
              override: t.override === null ? Prisma.DbNull : (t.override as Prisma.InputJsonValue),
            },
          });
        } else {
          await tx.postTarget.create({
            data: {
              id: newId(),
              workspaceId: member.workspaceId,
              postId: post.id,
              socialAccountId: t.accountId,
              override: overrideJson(t.override),
            },
          });
        }
      }
    });
    await recomputeStatus(member.workspaceId, post.id);
    await events.emit('post.updated', {
      workspaceId: member.workspaceId,
      postId: post.id,
      userId: caller.user.id,
      fields: Object.keys(body),
    });
    return toPost(await findPost(member.workspaceId, post.id));
  }

  async function remove(caller: AuthContext, member: MemberContext, postId: string) {
    const post = await findPost(member.workspaceId, postId);
    assertCanEdit(caller, member, post);
    if (post.targets.some((t) => LOCKED_TARGET.includes(t.status))) throw notDeletable();
    await db.client.$transaction(async (tx) => {
      await lockUnpublished(tx, member.workspaceId, post.id, notDeletable);
      await tx.post.delete({ where: { id: post.id, workspaceId: member.workspaceId } });
    });
    await events.emit('post.deleted', {
      workspaceId: member.workspaceId,
      postId: post.id,
      userId: caller.user.id,
    });
  }

  async function duplicate(caller: AuthContext, member: MemberContext, postId: string) {
    const post = await findPost(member.workspaceId, postId);
    // Accounts that were disconnected since are left out of the copy.
    const targets = post.targets
      .filter((t) => t.account.status !== 'disconnected')
      .map((t) => ({ accountId: t.socialAccountId, override: parseOverride(t.override) }));
    const media = await scoped(member.workspaceId).mediaAsset.findMany({
      where: { id: { in: allMediaIds(post, targets) }, deletedAt: null },
      select: { id: true },
    });
    const live = new Set(media.map((m) => m.id));
    return createDraft(caller, member, {
      text: post.text,
      mediaIds: post.mediaIds.filter((id) => live.has(id)),
      link: post.link,
      firstComment: post.firstComment,
      targets: targets.map((t) => ({
        ...t,
        override: t.override?.mediaIds
          ? { ...t.override, mediaIds: t.override.mediaIds.filter((id) => live.has(id)) }
          : t.override,
      })),
    });
  }

  // ---------------------------------------------------------------- reading

  async function list(member: MemberContext, query: Body<typeof ListPostsQuery>) {
    const range =
      query.from || query.to
        ? {
            ...(query.from ? { gte: new Date(query.from) } : {}),
            ...(query.to ? { lte: new Date(query.to) } : {}),
          }
        : undefined;
    const where: Prisma.PostWhereInput = {
      ...(query.status ? { status: { in: query.status } } : {}),
      ...(query.accountId ? { targets: { some: { socialAccountId: query.accountId } } } : {}),
      ...(query.authorId ? { authorId: query.authorId } : {}),
      ...(query.labelId ? { labelIds: { has: query.labelId } } : {}),
      ...(range
        ? {
            AND: [
              {
                OR: [
                  { createdAt: range },
                  { targets: { some: { scheduledAt: range } } },
                  { targets: { some: { publishedAt: range } } },
                ],
              },
            ],
          }
        : {}),
      ...(query.cursor ? afterCursor(decodeCursor(query.cursor)) : {}),
    };
    const rows = await scoped(member.workspaceId).post.findMany({
      where,
      include: postInclude,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: query.limit + 1,
    });
    const page = toPage(rows, query.limit);
    return { items: await Promise.all(page.items.map(toPost)), nextCursor: page.nextCursor };
  }

  async function get(member: MemberContext, postId: string): Promise<PostDetails> {
    const post = await findPost(member.workspaceId, postId);
    const attempts = await scoped(member.workspaceId).publishAttempt.findMany({
      where: { postTargetId: { in: post.targets.map((t) => t.id) } },
      orderBy: { attemptNo: 'desc' },
    });
    const base = await toPost(post);
    return {
      ...base,
      targets: base.targets.map((t) => ({
        ...t,
        history: attempts
          .filter((a) => a.postTargetId === t.id)
          .map((a) => ({
            id: a.id,
            attemptNo: a.attemptNo,
            startedAt: a.startedAt.toISOString(),
            finishedAt: a.finishedAt?.toISOString() ?? null,
            outcome: a.outcome,
            error: a.errorKind
              ? { kind: a.errorKind, networkCode: a.networkCode, message: a.message ?? '' }
              : null,
          })),
      })),
    };
  }

  /** After accounts were disconnected: their cancelled targets change these posts' status. */
  async function recomputeForTargets(workspaceId: string, targetIds: string[]) {
    if (targetIds.length === 0) return;
    const targets = await scoped(workspaceId).postTarget.findMany({
      where: { id: { in: targetIds } },
      select: { postId: true },
    });
    for (const postId of new Set(targets.map((t) => t.postId))) {
      await recomputeStatus(workspaceId, postId);
    }
  }

  return {
    validate,
    createDraft,
    update,
    remove,
    duplicate,
    list,
    get,
    recomputeStatus,
    recomputeForTargets,
  };
}

export type PostService = ReturnType<typeof createPostService>;
