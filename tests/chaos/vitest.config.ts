import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    // One run at a time: the suite starts and kills its own processes and Valkey.
    fileParallelism: false,
    // Posts can't be scheduled sooner than 2 minutes ahead, and recovery waits for BullMQ to
    // notice a dead worker (30 s locks): a run takes about six minutes.
    testTimeout: 15 * 60_000,
    hookTimeout: 3 * 60_000,
  },
});
