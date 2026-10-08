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

// The app formats dates and numbers in the browser's own locale (no locale given), so tests that
// expect "Sep 28, 2026" failed on machines set to another one ("28 Sept 2026" on en-IN). Tests
// run as an en-US browser would, whatever the machine.
const TEST_LOCALE = 'en-US';
class TestDateTimeFormat extends Intl.DateTimeFormat {
  constructor(locales?: Intl.LocalesArgument, options?: Intl.DateTimeFormatOptions) {
    super(locales ?? TEST_LOCALE, options);
  }
}
class TestNumberFormat extends Intl.NumberFormat {
  constructor(locales?: Intl.LocalesArgument, options?: Intl.NumberFormatOptions) {
    super(locales ?? TEST_LOCALE, options);
  }
}
Intl.DateTimeFormat = TestDateTimeFormat as typeof Intl.DateTimeFormat;
Intl.NumberFormat = TestNumberFormat as typeof Intl.NumberFormat;

skipMotionInTests();
// findBy…/waitFor wait up to 3 s (default 1 s): whole-app renders are slower on a busy machine.
configure({ asyncUtilTimeout: 3000 });

afterEach(() => {
  // Sonner keeps toasts in module state; without this one test's toast shows in the next.
  toast.dismiss();
  fakeSockets.length = 0;
  cleanup();
});
