import '@testing-library/jest-dom/vitest';
import { skipMotionInTests, toast } from '@socioboard/ui';
import { cleanup, configure } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

import { fakeSockets } from './src/testing/fake-socket';

// No real socket in unit tests: the app's live updates talk to a fake the tests drive.
// (Imported inside the factory: vi.mock runs before this file's imports.)
vi.mock('socket.io-client', async () => ({
  io: (await import('./src/testing/fake-socket')).fakeIo,
}));

skipMotionInTests();
// findBy…/waitFor wait up to 3 s (default 1 s): whole-app renders are slower on a busy machine.
configure({ asyncUtilTimeout: 3000 });

afterEach(() => {
  // Sonner keeps toasts in module state; without this one test's toast shows in the next.
  toast.dismiss();
  fakeSockets.length = 0;
  cleanup();
});
