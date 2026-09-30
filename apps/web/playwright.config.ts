// End-to-end tests (docs/traceability.md: `apps/web/e2e/phase-<n>/`). They drive the real app,
// API and worker against the dev services (Postgres, Valkey, Mailpit, local S3: `docker compose -f
// docker/compose.dev.yml up -d` with COMPOSE_PROFILES=local-s3). `pnpm e2e` starts the api, worker and
// web app unless they are already running.
import { fileURLToPath } from 'node:url';

import { defineConfig, devices } from '@playwright/test';

const CI = Boolean(process.env.CI);

// The repo's .env (storage, the Meta app) applies to the tests and the servers they start, as it
// does to `pnpm dev`. Values already in the environment win.
try {
  process.loadEnvFile(fileURLToPath(new URL('../../.env', import.meta.url)));
} catch {
  // No .env: the dev defaults below.
}

// Uploads need storage: the S3 bucket from .env when there is one (it must allow PUT/POST from
// the app's origin and expose ETag: docs/backend/modules/media.md), else the dev compose's local S3
// with all of its settings. None come from .env: its S3_FORCE_PATH_STYLE=false (right for AWS)
// would send the browser to socioboard-media.localhost, which the local S3 doesn't serve.
const storage: Record<string, string> = process.env.S3_BUCKET
  ? {}
  : {
      S3_ENDPOINT: 'http://localhost:9000',
      S3_BUCKET: 'socioboard-media',
      S3_REGION: 'us-east-1',
      S3_ACCESS_KEY_ID: 'socioboard',
      S3_SECRET_ACCESS_KEY: 'socioboard-dev-secret',
      S3_FORCE_PATH_STYLE: 'true',
      STORAGE_PUBLIC_URL: '',
      MEDIA_PUBLIC_URL: '',
    };

export default defineConfig({
  testDir: './e2e',
  // One flow per file, run one at a time: they share the database and the mailbox.
  fullyParallel: false,
  workers: 1,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  timeout: 120_000,
  expect: { timeout: 15_000 },
  reporter: CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    ...devices['Desktop Chrome'],
  },
  projects: [
    // The app against the dev services: `pnpm e2e`.
    { name: 'app', testIgnore: /phase-1\/meta-/ },
    // Real Facebook and Instagram accounts (it publishes): only `pnpm e2e:meta`.
    { name: 'meta', testMatch: /phase-1\/meta-/ },
  ],
  webServer: [
    {
      command: 'pnpm --filter @socioboard/api dev',
      url: 'http://localhost:3000/api/health',
      env: storage,
      reuseExistingServer: !CI,
      timeout: 120_000,
    },
    {
      command: 'pnpm --filter @socioboard/worker dev',
      // No HTTP port: wait for its start-up log line.
      wait: { stdout: /worker started/ },
      env: storage,
      reuseExistingServer: !CI,
      timeout: 120_000,
    },
    {
      command: 'pnpm --filter @socioboard/web dev',
      url: 'http://localhost:5173',
      reuseExistingServer: !CI,
      timeout: 120_000,
    },
  ],
});
