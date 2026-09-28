import { Button } from '@socioboard/ui';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { authClient, unwrap } from '../../../lib/auth-client';
import { errorMessage } from '../../../lib/i18n';
import { withRedirect } from '../../../lib/redirect';
import { authOptionsQuery } from '../../../lib/session';
import { FormError } from './auth-layout';

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.6 10.6 0 0 0 12 1 11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}

function MicrosoftMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#F25022" d="M2 2h9.5v9.5H2z" />
      <path fill="#7FBA00" d="M12.5 2H22v9.5h-9.5z" />
      <path fill="#00A4EF" d="M2 12.5h9.5V22H2z" />
      <path fill="#FFB900" d="M12.5 12.5H22V22h-9.5z" />
    </svg>
  );
}

/**
 * Google / Microsoft sign-in, only for providers this server has configured. The provider sends the
 * browser back to the sign-in page either way: signed in, it routes onward (to `redirect` if set);
 * on failure (cancelled at the provider, account problem) it shows `?error=`.
 */
export function SocialButtons({ redirect }: { redirect?: string | undefined }) {
  const { t } = useTranslation('auth');
  const options = useQuery(authOptionsQuery);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string>();
  const providers = options.data?.socialProviders ?? [];
  if (providers.length === 0) return null;

  const start = async (provider: (typeof providers)[number]) => {
    setError(undefined);
    setPending(provider);
    try {
      const back = withRedirect('/login', redirect);
      // On success the browser leaves for the provider, so only a failure returns here.
      unwrap(
        await authClient.signIn.social({ provider, callbackURL: back, errorCallbackURL: back }),
      );
    } catch (err) {
      setError(errorMessage(err));
      setPending(null);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {providers.map((provider) => (
        <Button
          key={provider}
          size="lg"
          loading={pending === provider}
          disabled={pending !== null && pending !== provider}
          onClick={() => {
            void start(provider);
          }}
        >
          {provider === 'google' ? <GoogleMark /> : <MicrosoftMark />}
          {t(`social.${provider}`)}
        </Button>
      ))}
      <FormError>{error}</FormError>
      <div className="text-ink-3 flex items-center gap-3 text-xs" aria-hidden="true">
        <span className="bg-hair h-px flex-1" />
        {t('social.or')}
        <span className="bg-hair h-px flex-1" />
      </div>
    </div>
  );
}
