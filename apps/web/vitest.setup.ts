import '@testing-library/jest-dom/vitest';
import { skipMotionInTests, toast } from '@socioboard/ui';
import { cleanup, configure } from '@testing-library/react';
import { afterEach } from 'vitest';

skipMotionInTests();
// findBy…/waitFor wait up to 3 s (default 1 s): whole-app renders are slower on a busy machine.
configure({ asyncUtilTimeout: 3000 });

afterEach(() => {
  // Sonner keeps toasts in module state; without this one test's toast shows in the next.
  toast.dismiss();
  cleanup();
});
