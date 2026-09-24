import { existsSync } from 'node:fs';

import { defineConfig } from 'prisma/config';

// Local dev keeps settings in the repo-root .env; CI and containers set env vars directly.
const rootEnv = new URL('../../.env', import.meta.url);
if (existsSync(rootEnv)) process.loadEnvFile(rootEnv);

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  // Not needed for `prisma generate`; migrate and studio fail clearly without it.
  datasource: { url: process.env.DATABASE_URL ?? '' },
});
