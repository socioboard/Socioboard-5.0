import '@fontsource-variable/instrument-sans';
import './styles.css';
import './lib/i18n';

import { MotionProvider, ThemeProvider } from '@socioboard/ui';
import { QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { createQueryClient } from './lib/query';
import { routeTree } from './routeTree.gen';

const queryClient = createQueryClient();
const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: 'intent',
  // Query owns caching, so loaders always hand off to it.
  defaultPreloadStaleTime: 0,
  scrollRestoration: true,
  // Moving to another page animates the content pane (styles.css, type "page"; a crossfade under
  // reduced motion); changes within a page (opening a drawer, a tab's filter) don't.
  defaultViewTransition: {
    types: ({ pathChanged }) => (pathChanged ? ['page'] : false),
  },
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const root = document.getElementById('root');
if (!root) throw new Error('#root element missing');

createRoot(root).render(
  <StrictMode>
    <ThemeProvider>
      <MotionProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </MotionProvider>
    </ThemeProvider>
  </StrictMode>,
);
