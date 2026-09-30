import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    // Playwright's end-to-end specs live in e2e/ and run with `pnpm e2e`, not here.
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./vitest.setup.ts'],
    // Tests render the whole app (router, shell, queries) and type like a person; the heaviest
    // take ~5 s on a busy machine, so the default 5 s limit made them flaky.
    testTimeout: 15_000,
  },
});
