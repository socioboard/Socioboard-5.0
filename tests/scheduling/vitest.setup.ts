import { existsSync } from 'node:fs';

// The pipeline test uses the dev compose's Postgres and Valkey, as core's integration tests do.
const rootEnv = new URL('../../.env', import.meta.url);
if (existsSync(rootEnv)) process.loadEnvFile(rootEnv);
