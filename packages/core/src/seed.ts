// Development seed data (P0-B10): one user per workspace role, a demo workspace and sample media.
// Everything goes through the same code paths as real use: Better Auth creates users (its own
// password hashing and user-create hook), memberships and the workspace; media is stored and then
// processed by the media-process job function. Running it again only adds what is missing.
import { MEDIA_MIME_KINDS, type MediaMime, type Role } from '@socioboard/contracts';
import { hashPassword } from 'better-auth/crypto';
import sharp from 'sharp';

import { createAuthModule } from './modules/auth';
import { mediaKeys, processMedia } from './modules/media';
import { newId, type Platform } from './platform';

export interface SeedOptions {
  /** Password for every seeded user (10+ characters, Better Auth's minimum). */
  password: string;
  /** Seeded users are `<role>@<emailDomain>`. */
  emailDomain?: string;
  /** Address of the demo workspace. */
  workspaceSlug?: string;
  workspaceName?: string;
}

export interface SeedResult {
  users: { email: string; role: Role; created: boolean }[];
  workspace: { id: string; slug: string; created: boolean };
  /** Sample files added; "no-storage" when S3/MinIO isn't configured, "exists" when all are there. */
  media: number | 'no-storage' | 'exists';
  /** Sample posts added (a draft and a scheduled post), or "exists". */
  posts: number | 'exists';
  /** Queue slots added to the sample accounts (weekdays 09:00 and 15:00), or "exists". */
  queueSlots: number | 'exists';
}

/** Marks the sample accounts: paused, so validation says they can't publish. */
const SAMPLE_ACCOUNT_REASON = 'Sample account: connect a real one to publish';
const SAMPLE_POSTS = [
  {
    text: 'Sample draft: fresh roast arriving this week ☕ What should we call it?',
    status: 'draft' as const,
  },
  {
    text: 'Sample scheduled post: our weekend tasting starts Saturday at 10. See you there!',
    status: 'scheduled' as const,
  },
];

const ROLES: readonly Role[] = ['owner', 'admin', 'editor', 'contributor', 'viewer'];

/** Sample images drawn as SVG, so the seed needs no binary files in the repo. */
const SAMPLES: {
  name: string;
  mime: MediaMime;
  width: number;
  height: number;
  hue: number;
  inFolder: boolean;
}[] = [
  {
    name: 'Launch banner.png',
    mime: 'image/png',
    width: 1200,
    height: 628,
    hue: 210,
    inFolder: true,
  },
  {
    name: 'Square post.jpg',
    mime: 'image/jpeg',
    width: 1080,
    height: 1080,
    hue: 330,
    inFolder: true,
  },
  {
    name: 'Story background.webp',
    mime: 'image/webp',
    width: 1080,
    height: 1920,
    hue: 150,
    inFolder: false,
  },
  { name: 'Logo loop.gif', mime: 'image/gif', width: 480, height: 480, hue: 40, inFolder: false },
];
const FOLDER = 'Brand kit';

async function drawSample(s: (typeof SAMPLES)[number]): Promise<Buffer> {
  const r = Math.min(s.width, s.height) / 4;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${String(s.width)}" height="${String(s.height)}">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="hsl(${String(s.hue)},70%,55%)"/>
      <stop offset="1" stop-color="hsl(${String(s.hue + 60)},70%,35%)"/>
    </linearGradient></defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <circle cx="${String(s.width / 2)}" cy="${String(s.height / 2)}" r="${String(r)}" fill="white" fill-opacity="0.85"/>
  </svg>`;
  const image = sharp(Buffer.from(svg));
  switch (s.mime) {
    case 'image/png':
      return image.png().toBuffer();
    case 'image/jpeg':
      return image.jpeg({ quality: 85 }).toBuffer();
    case 'image/webp':
      return image.webp({ quality: 85 }).toBuffer();
    default:
      return image.gif().toBuffer();
  }
}

export async function seedDevData(platform: Platform, options: SeedOptions): Promise<SeedResult> {
  const { config, db, logger } = platform;
  if (config.isProduction) throw new Error('Refusing to seed demo data in production');
  const domain = options.emailDomain ?? 'socioboard.test';
  const slug = options.workspaceSlug ?? 'demo';

  const { auth } = createAuthModule(platform);
  const ctx = await auth.$context;

  // Better Auth's default password hash, called directly: the configured one is wrapped by the
  // breached-password plugin, which only works inside a request. Hashed before any user is
  // created, so a failure can't leave a user without a password.
  const passwordHash = await hashPassword(options.password);

  // Users, owner first: on an empty database the first user becomes platform admin.
  const users: (SeedResult['users'][number] & { id: string })[] = [];
  for (const role of ROLES) {
    const email = `${role}@${domain}`;
    const existing = await db.client.user.findUnique({ where: { email }, select: { id: true } });
    let userId = existing?.id;
    if (!userId) {
      const name = `${role.charAt(0).toUpperCase()}${role.slice(1)} Demo`;
      const user = await ctx.internalAdapter.createUser(
        { name, email, emailVerified: true },
        { method: 'admin' },
      );
      userId = user.id;
    }
    // Also repairs a user left without a password by an interrupted run. Existing passwords stay.
    const accounts = await ctx.internalAdapter.findAccounts(userId);
    if (!accounts.some((a) => a.providerId === 'credential')) {
      await ctx.internalAdapter.linkAccount({
        userId,
        providerId: 'credential',
        accountId: userId,
        password: passwordHash,
      });
    }
    users.push({ id: userId, email, role, created: !existing });
  }
  const owner = users[0];
  if (!owner) throw new Error('No owner user');

  // Workspace (Better Auth adds the owner membership).
  let workspace = await db.client.workspace.findUnique({ where: { slug } });
  const workspaceCreated = !workspace;
  if (workspace?.deletedAt) {
    throw new Error(`Workspace "${slug}" is deleted; restore it or seed with another slug`);
  }
  if (!workspace) {
    const created = await auth.api.createOrganization({
      body: {
        name: options.workspaceName ?? 'Demo Workspace',
        slug,
        timezone: 'UTC',
        userId: owner.id,
      },
    });
    workspace = await db.client.workspace.findUniqueOrThrow({ where: { id: created.id } });
  }
  const workspaceId = workspace.id;
  const scoped = db.forWorkspace(workspaceId);

  for (const u of users.slice(1)) {
    const member = await scoped.member.findFirst({ where: { userId: u.id }, select: { id: true } });
    if (member) continue;
    await auth.api.addMember({ body: { userId: u.id, role: u.role, organizationId: workspaceId } });
  }

  // Sample media, processed exactly as an upload would be.
  let media: SeedResult['media'];
  const { storage } = platform;
  if (!storage) {
    media = 'no-storage';
    logger.warn('S3 is not configured: skipping sample media');
  } else {
    // Adds whichever samples are missing (by name), so an interrupted run is completed next time.
    const present = new Set(
      (
        await scoped.mediaAsset.findMany({
          where: { name: { in: SAMPLES.map((s) => s.name) } },
          select: { name: true },
        })
      ).map((a) => a.name),
    );
    const missing = SAMPLES.filter((s) => !present.has(s.name));
    if (missing.length === 0) {
      media = 'exists';
    } else {
      const folder =
        (await scoped.mediaFolder.findFirst({ where: { name: FOLDER, parentId: null } })) ??
        (await scoped.mediaFolder.create({ data: { id: newId(), workspaceId, name: FOLDER } }));
      const deps = { ...platform, tools: config.media };
      for (const s of missing) {
        const id = newId();
        const bytes = await drawSample(s);
        const key = mediaKeys(workspaceId, id, s.mime).original;
        await storage.put(key, bytes, s.mime);
        await scoped.mediaAsset.create({
          data: {
            id,
            workspaceId,
            name: s.name,
            folderId: s.inFolder ? folder.id : null,
            kind: MEDIA_MIME_KINDS[s.mime],
            mime: s.mime,
            storageKey: key,
            sizeBytes: bytes.length,
            status: 'processing',
            uploadedById: owner.id,
          },
        });
        await processMedia(deps, id, true);
      }
      media = missing.length;
    }
  }

  // Sample accounts and posts (P1-B6). The accounts use fake tokens, so they are paused.
  const login =
    (await scoped.socialConnection.findFirst({
      where: { provider: 'facebook', externalUserId: 'sample-login' },
    })) ??
    (await scoped.socialConnection.create({
      data: {
        id: newId(),
        workspaceId,
        provider: 'facebook',
        externalUserId: 'sample-login',
        displayName: 'Sample Facebook login',
        accessTokenEnc: platform.crypto.encrypt('sample-token'),
        connectedById: owner.id,
      },
    }));
  const sampleAccounts: { id: string }[] = [];
  for (const a of [
    {
      network: 'facebook_page' as const,
      externalId: 'sample-page',
      displayName: 'Demo Café',
      username: null,
    },
    {
      network: 'instagram' as const,
      externalId: 'sample-instagram',
      displayName: 'Demo Café',
      username: 'demo.cafe',
    },
  ]) {
    sampleAccounts.push(
      (await scoped.socialAccount.findFirst({
        where: { network: a.network, externalId: a.externalId },
      })) ??
        (await scoped.socialAccount.create({
          data: {
            id: newId(),
            workspaceId,
            connectionId: login.id,
            ...a,
            status: 'paused',
            statusReason: SAMPLE_ACCOUNT_REASON,
            connectedById: owner.id,
          },
        })),
    );
  }
  const existingPosts = await scoped.post.count({
    where: { text: { in: SAMPLE_POSTS.map((p) => p.text) } },
  });
  let posts: SeedResult['posts'] = 'exists';
  if (existingPosts === 0) {
    const square = await scoped.mediaAsset.findFirst({ where: { name: 'Square post.jpg' } });
    // Tomorrow at 10:00 UTC.
    const at = new Date();
    at.setUTCDate(at.getUTCDate() + 1);
    at.setUTCHours(10, 0, 0, 0);
    for (const sample of SAMPLE_POSTS) {
      const postId = newId();
      const scheduled = sample.status === 'scheduled';
      await db.client.$transaction(async (tx) => {
        await tx.post.create({
          data: {
            id: postId,
            workspaceId,
            authorId: owner.id,
            status: sample.status,
            text: sample.text,
            mediaIds: square ? [square.id] : [],
          },
        });
        await tx.postTarget.createMany({
          data: sampleAccounts.map((account) => ({
            id: newId(),
            workspaceId,
            postId,
            socialAccountId: account.id,
            status: scheduled ? ('scheduled' as const) : ('pending' as const),
            scheduledAt: scheduled ? at : null,
          })),
        });
      });
    }
    posts = SAMPLE_POSTS.length;
  }

  // Queue slots (P2-B1): weekdays at 09:00 and 15:00 in the workspace's timezone, for "Add to queue".
  const slots = sampleAccounts.flatMap((account) =>
    [1, 2, 3, 4, 5].flatMap((weekday) =>
      ['09:00', '15:00'].map((time) => ({
        id: newId(),
        workspaceId,
        socialAccountId: account.id,
        weekday,
        time,
        timezone: workspace.timezone,
      })),
    ),
  );
  const { count: slotsAdded } = await scoped.queueSlot.createMany({
    data: slots,
    skipDuplicates: true,
  });

  return {
    users: users.map(({ email, role, created }) => ({ email, role, created })),
    workspace: { id: workspaceId, slug, created: workspaceCreated },
    media,
    posts,
    queueSlots: slotsAdded > 0 ? slotsAdded : 'exists',
  };
}
