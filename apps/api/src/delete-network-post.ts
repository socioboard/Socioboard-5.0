// `pnpm --filter @socioboard/api delete-network-post <workspaceId> <postId>`: takes a post that went
// out back off the networks, for development and the Meta end-to-end test's cleanup
// (docs/stages/phase-1.md, P1-Q1). Networks without a delete API (Instagram) are reported, not
// touched. Not for production: deleting from the networks has no screen or audit trail yet.
import { bootstrap, createPlatform, createPublishingServices } from '@socioboard/core';

const [workspaceId, postId] = process.argv.slice(2);
const { config, logger } = bootstrap('delete-network-post');
if (config.env === 'production') {
  console.error('delete-network-post is a development tool; it refuses to run in production.');
  process.exit(1);
}
if (!workspaceId || !postId) {
  console.error('Usage: delete-network-post <workspaceId> <postId>');
  process.exit(1);
}

const platform = createPlatform(config, logger);
try {
  const { registry, socialAccounts } = createPublishingServices(platform);
  const targets = await platform.db.client.postTarget.findMany({
    where: { workspaceId, postId, externalPostId: { not: null } },
    select: { socialAccountId: true, externalPostId: true },
  });
  if (targets.length === 0) console.log('Nothing published on this post.');
  for (const t of targets) {
    const externalId = t.externalPostId ?? '';
    const { network, credentials } = await socialAccounts.getCredentials(
      workspaceId,
      t.socialAccountId,
    );
    const adapter = registry.network(network);
    if (!adapter.deletePost) {
      console.log(`${network} ${externalId}: this network has no delete API; left as is.`);
      continue;
    }
    await adapter.deletePost(externalId, credentials);
    console.log(`${network} ${externalId}: deleted.`);
  }
} catch (err) {
  logger.error({ err }, 'delete-network-post failed');
  process.exitCode = 1;
} finally {
  await platform.close();
}
