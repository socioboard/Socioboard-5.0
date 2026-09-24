import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    // Integration tests (*.int.test.ts) need `pnpm services:up`; setup loads the root .env.
    setupFiles: ['./vitest.setup.ts'],
  },
});
