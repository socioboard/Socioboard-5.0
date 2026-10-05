import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    // The clock walk covers every timezone for two years; the pipeline test uses Postgres.
    testTimeout: 120_000,
    hookTimeout: 60_000,
  },
});
