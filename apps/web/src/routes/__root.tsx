import type { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, Link, Outlet } from '@tanstack/react-router';
import { Backdrop, Toaster } from '@socioboard/ui';
import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';

export interface RouterContext {
  queryClient: QueryClient;
}

// Devtools load only in development and never ship in the production bundle.
const Devtools = import.meta.env.DEV
  ? lazy(async () => {
      const [router, query] = await Promise.all([
        import('@tanstack/react-router-devtools'),
        import('@tanstack/react-query-devtools'),
      ]);
      return {
        default: () => (
          <>
            {/* Both bottom-right, side by side: bottom-left would cover the sidebar's account menu. */}
            <router.TanStackRouterDevtools position="bottom-right" />
            <div className="fixed right-40 bottom-2 z-[99999]">
              <query.ReactQueryDevtools buttonPosition="relative" />
            </div>
          </>
        ),
      };
    })
  : () => null;

export const Route = createRootRouteWithContext<RouterContext>()({
  component: Root,
  notFoundComponent: NotFound,
});

function Root() {
  return (
    <>
      <Backdrop />
      <Outlet />
      <Toaster />
      <Suspense>
        <Devtools />
      </Suspense>
    </>
  );
}

function NotFound() {
  const { t } = useTranslation();
  return (
    <main className="grid min-h-dvh place-items-center p-4">
      <div className="glass rounded-pane animate-settle flex max-w-md flex-col gap-3 p-8">
        <h1 className="text-xl font-semibold tracking-tight">{t('notFound.title')}</h1>
        <p className="text-ink-2 text-sm leading-relaxed">{t('notFound.body')}</p>
        <Link to="/" className="text-sm font-semibold underline underline-offset-4">
          {t('notFound.home')}
        </Link>
      </div>
    </main>
  );
}
