// `pnpm db:seed`: development data (docs/backend/modules/platform.md). Safe to run again.
import { bootstrap, createPlatform, seedDevData } from '@socioboard/core';

const { config, logger } = bootstrap('seed');
const password = process.env.SEED_PASSWORD ?? 'socioboard-dev-password';
const platform = createPlatform(config, logger);

try {
  const result = await seedDevData(platform, { password });
  const { workspace } = result;
  console.log(
    [
      '',
      `Workspace: ${workspace.slug} (${workspace.created ? 'created' : 'already there'})`,
      'Users (sign in at the app with the seed password):',
      ...result.users.map(
        (u) => `  ${u.role.padEnd(12)} ${u.email}${u.created ? '' : ' (already there)'}`,
      ),
      `Media: ${typeof result.media === 'number' ? `${String(result.media)} sample files` : result.media}`,
      `Posts: ${typeof result.posts === 'number' ? `${String(result.posts)} sample posts (on paused sample accounts)` : result.posts}`,
      `Queue slots: ${typeof result.queueSlots === 'number' ? `${String(result.queueSlots)} (weekdays 09:00 and 15:00)` : result.queueSlots}`,
      '',
    ].join('\n'),
  );
} catch (err) {
  logger.error({ err }, 'seed failed');
  process.exitCode = 1;
} finally {
  await platform.close();
}
