import '@testing-library/jest-dom/vitest';
import { toast } from '@socioboard/ui';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  // Sonner keeps toasts in module state; without this one test's toast shows in the next.
  toast.dismiss();
  cleanup();
});
