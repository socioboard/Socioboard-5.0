import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    // Integration tests (*.int.test.ts) need `pnpm services:up`; setup loads the root .env.
    setupFiles: ['./vitest.setup.ts'],
    // The first integration tests of a run pay for starting Prisma, Valkey and Better Auth; on a
    // cold machine (a fresh clone) that went past the default 5 s.
    testTimeout: 15_000,
    hookTimeout: 30_000,
  },
});
