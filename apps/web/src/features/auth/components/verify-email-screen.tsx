import { Button, Skeleton } from '@socioboard/ui';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { MailCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { authClient, unwrap } from '../../../lib/auth-client';
import { errorMessage, linkErrorMessage } from '../../../lib/i18n';
import { withRedirect } from '../../../lib/redirect';
import { meQuery } from '../../../lib/session';
import { useFinishSignIn, useSignOut } from '../hooks';
import { AuthLayout, FormError, FormNotice } from './auth-layout';

const COOLDOWN_SECONDS = 60;

export function VerifyEmailScreen({
  linkError,
  redirect,
}: {
  linkError?: string;
  redirect?: string;
}) {
  const { t } = useTranslation('auth');
  const me = useQuery(meQuery);
  const finish = useFinishSignIn();
  const signOut = useSignOut();
  const [cooldown, setCooldown] = useState(0);
  const [notice, setNotice] = useState<string>();
  const [formError, setFormError] = useState<string>();
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => {
      setCooldown((s) => s - 1);
    }, 1000);
    return () => {
      clearTimeout(timer);
    };
  }, [cooldown]);

  const user = me.data?.user;
  // Wait for the server: it alone says whether the email is verified (no flash of the wrong state).
  if (me.isPending) {
    return (
      <AuthLayout title={<Skeleton className="h-7 w-48" />}>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-11 w-full" />
      </AuthLayout>
    );
  }
  if (user?.emailVerified) {
    return (
      <AuthLayout title={t('verify.verifiedTitle')} subtitle={t('verify.verifiedBody')}>
        <Button
          variant="primary"
          size="lg"
          onClick={() => {
            void finish(redirect);
          }}
        >
          {t('verify.continue')}
        </Button>
      </AuthLayout>
    );
  }

  const resend = async () => {
    if (!user) return;
    setFormError(undefined);
    setNotice(undefined);
    setSending(true);
    try {
      unwrap(
        await authClient.sendVerificationEmail({
          email: user.email,
          callbackURL: withRedirect('/verify-email', redirect),
        }),
      );
      setNotice(t('verify.resent'));
      setCooldown(COOLDOWN_SECONDS);
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <AuthLayout
      title={t('verify.title')}
      subtitle={user ? t('verify.body', { email: user.email }) : t('verify.bodyNoEmail')}
    >
      <div className="glass-chip text-ink-2 flex size-12 items-center justify-center rounded-[14px]">
        <MailCheck className="size-5" aria-hidden="true" />
      </div>
      {linkError && <FormError>{linkErrorMessage(linkError)}</FormError>}
      {notice && <FormNotice>{notice}</FormNotice>}
      <FormError>{formError}</FormError>
      {user ? (
        <>
          <Button
            size="lg"
            loading={sending}
            disabled={cooldown > 0}
            onClick={() => {
              void resend();
            }}
          >
            {cooldown > 0 ? t('verify.resendIn', { seconds: cooldown }) : t('verify.resend')}
          </Button>
          <button
            type="button"
            onClick={() => {
              void signOut('/signup');
            }}
            className="text-ink-2 cursor-pointer text-[13px] underline-offset-4 hover:underline"
          >
            {t('verify.wrongAddress')}
          </button>
        </>
      ) : (
        <Link
          to="/login"
          search={{ redirect: '/verify-email' }}
          className="text-ink text-sm font-semibold underline-offset-4 hover:underline"
        >
          {t('verify.signInToResend')}
        </Link>
      )}
    </AuthLayout>
  );
}
