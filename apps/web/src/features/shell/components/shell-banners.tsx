import type { Me } from '@socioboard/contracts';
import { Banner, Button } from '@socioboard/ui';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { authClient, unwrap } from '../../../lib/auth-client';
import { errorMessage } from '../../../lib/i18n';
import { withRedirect } from '../../../lib/redirect';
import { authOptionsQuery } from '../../../lib/session';

/**
 * Notices across the top of the content. Phase 0 has one: an unverified email on a server that
 * sends email. Reconnect, payment, announcement, maintenance and support-session banners join
 * with their phases (docs/frontend/areas/app-shell.md).
 */
export function ShellBanners({ me }: { me: Me }) {
  const options = useQuery(authOptionsQuery);
  const needsVerification = options.data?.emailVerificationRequired && !me.user.emailVerified;
  if (!needsVerification) return null;
  return <VerifyEmailBanner email={me.user.email} />;
}

function VerifyEmailBanner({ email }: { email: string }) {
  const { t } = useTranslation('shell');
  const location = useLocation();
  const [dismissed, setDismissed] = useState(false);
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState<string>();
  if (dismissed) return null;

  const resend = async () => {
    setState('sending');
    setError(undefined);
    try {
      unwrap(
        await authClient.sendVerificationEmail({
          email,
          callbackURL: withRedirect('/verify-email', location.href),
        }),
      );
      setState('sent');
    } catch (err) {
      setError(errorMessage(err));
      setState('idle');
    }
  };

  return (
    <Banner
      tone="warning"
      onDismiss={() => {
        setDismissed(true);
      }}
      dismissLabel={t('banners.dismiss')}
      action={
        state === 'sent' ? (
          <span className="text-ink-2">{t('banners.resent')}</span>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            loading={state === 'sending'}
            onClick={() => {
              void resend();
            }}
          >
            {t('banners.resend')}
          </Button>
        )
      }
    >
      {error ?? t('banners.verifyEmail', { email })}
    </Banner>
  );
}
