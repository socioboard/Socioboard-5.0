// Temporary start page for P0-F1: proves routing, a typed API call through Query, translations and
// the themes work together. Sign-in (P0-F3) and the app shell (P0-F5) replace it with a redirect.
import { apiRoutes } from '@socioboard/contracts';
import { cn, useTheme, type ThemePreference } from '@socioboard/ui';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { api, ApiError } from '../lib/api';
import { errorMessage } from '../lib/i18n';

export const Route = createFileRoute('/')({ component: Home });

const themes: ThemePreference[] = ['light', 'dark', 'system'];

function Home() {
  const { t } = useTranslation();
  const { preference, setPreference } = useTheme();
  const me = useQuery({
    queryKey: ['me'],
    queryFn: ({ signal }) => api(apiRoutes.auth.getMe, { signal }),
  });
  const signedOut = me.error instanceof ApiError && me.error.status === 401;

  let apiStatus: string;
  if (me.isPending) apiStatus = t('home.apiChecking');
  else if (me.data) apiStatus = t('home.apiSignedIn', { name: me.data.user.name });
  else if (signedOut) apiStatus = t('home.apiSignedOut');
  else apiStatus = errorMessage(me.error);

  return (
    <main className="grid min-h-dvh place-items-center p-4">
      <div className="glass animate-settle flex w-full max-w-lg flex-col gap-6 p-8">
        <img src="/sb-mark.svg" alt={t('app.name')} width={28} height={32} />
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">{t('home.title')}</h1>
          <p className="text-ink-2 text-sm leading-relaxed">{t('home.body')}</p>
        </div>
        <p
          className="glass-chip flex items-center gap-2 rounded-control px-3 py-2 text-sm"
          role="status"
        >
          <span
            className={cn(
              'size-2 rounded-full',
              me.isPending ? 'bg-ink-3' : me.data || signedOut ? 'bg-success' : 'bg-danger',
            )}
          />
          <span className="text-ink-3">{t('home.apiLabel')}</span>
          <span>{apiStatus}</span>
        </p>
        <fieldset className="flex flex-col gap-2">
          <legend className="text-ink-3 mb-2 text-xs font-semibold">{t('theme.label')}</legend>
          <div className="glass-chip flex gap-1 rounded-control p-1">
            {themes.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={preference === option}
                onClick={() => {
                  setPreference(option);
                }}
                className={cn(
                  'h-8 flex-1 rounded-lg text-sm font-medium transition-colors',
                  preference === option
                    ? 'bg-glass text-ink shadow-sm'
                    : 'text-ink-3 hover:text-ink',
                )}
              >
                {t(`theme.${option}`)}
              </button>
            ))}
          </div>
        </fieldset>
      </div>
    </main>
  );
}
