// End-to-end tests (docs/traceability.md: `apps/web/e2e/phase-<n>/`). They drive the real app,
// API and worker against the dev services (Postgres, Valkey, Mailpit, MinIO: `docker compose -f
// docker/compose.dev.yml up -d` with COMPOSE_PROFILES=minio). `pnpm e2e` starts the api, worker and
// web app unless they are already running.
import { defineConfig, devices } from '@playwright/test';

const CI = Boolean(process.env.CI);

/** An environment value, or `fallback` when it is unset or empty (`S3_BUCKET=` in .env). */
function envOr(key: string, fallback: string): string {
  const value = process.env[key];
  if (value) return value;
  return fallback;
}

// Uploads need storage. Without S3 settings in the environment, use the dev MinIO.
const storage = {
  S3_ENDPOINT: envOr('S3_ENDPOINT', 'http://localhost:9000'),
  S3_BUCKET: envOr('S3_BUCKET', 'socioboard-media'),
  S3_REGION: envOr('S3_REGION', 'us-east-1'),
  S3_ACCESS_KEY_ID: envOr('S3_ACCESS_KEY_ID', 'socioboard'),
  S3_SECRET_ACCESS_KEY: envOr('S3_SECRET_ACCESS_KEY', 'socioboard-dev-secret'),
  S3_FORCE_PATH_STYLE: envOr('S3_FORCE_PATH_STYLE', 'true'),
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
