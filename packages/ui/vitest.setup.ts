import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

import { skipMotionInTests } from './src/motion';

skipMotionInTests();

afterEach(() => {
  cleanup();
  localStorage.clear();
  document.documentElement.className = '';
});
