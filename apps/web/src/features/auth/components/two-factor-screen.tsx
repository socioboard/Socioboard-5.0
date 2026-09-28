import { Button, FormField, Input } from '@socioboard/ui';
import { Link } from '@tanstack/react-router';
import { useState, type SyntheticEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { ApiError } from '../../../lib/api';
import { authClient, unwrap } from '../../../lib/auth-client';
import { errorMessage } from '../../../lib/i18n';
import { useFinishSignIn } from '../hooks';
import { AuthLayout, FormError } from './auth-layout';

/** The second step of sign-in when 2FA is on: a code from the app, or a backup code. */
export function TwoFactorScreen({ redirect }: { redirect?: string }) {
  const { t } = useTranslation('auth');
  const finish = useFinishSignIn();
  const [mode, setMode] = useState<'app' | 'backup'>('app');
  const [code, setCode] = useState('');
  const [trustDevice, setTrustDevice] = useState(false);
  const [fieldError, setFieldError] = useState<string>();
  const [formError, setFormError] = useState<string>();
  const [expired, setExpired] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const valid = mode === 'app' ? /^\d{6}$/.test(code) : code.trim().length >= 6;

  const onSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();
    setFormError(undefined);
    if (!valid) {
      setFieldError(mode === 'app' ? t('validation.codeInvalid') : t('validation.backupInvalid'));
      return;
    }
    setFieldError(undefined);
    setSubmitting(true);
    try {
      unwrap(
        mode === 'app'
          ? await authClient.twoFactor.verifyTotp({ code, trustDevice })
          : await authClient.twoFactor.verifyBackupCode({ code: code.trim(), trustDevice }),
      );
      await finish(redirect);
    } catch (err) {
      // No pending sign-in (it timed out, or the page was opened directly): start again.
      if (err instanceof ApiError && err.code === 'INVALID_TWO_FACTOR_COOKIE') setExpired(true);
      else setFormError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (expired) {
    return (
      <AuthLayout title={t('twoFactor.title')}>
        <FormError>{t('twoFactor.expired')}</FormError>
        <Button asChild variant="primary" size="lg">
          <Link to="/login" search={redirect ? { redirect } : {}}>
            {t('signIn.submit')}
          </Link>
        </Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={t('twoFactor.title')}
      subtitle={mode === 'app' ? t('twoFactor.body') : t('twoFactor.backupBody')}
    >
      <form onSubmit={(e) => void onSubmit(e)} noValidate className="flex flex-col gap-4">
        <FormField
          label={mode === 'app' ? t('fields.code') : t('fields.backupCode')}
          error={fieldError}
        >
          {(p) => (
            <Input
              {...p}
              value={code}
              onChange={(e) => {
                setCode(
                  mode === 'app' ? e.target.value.replace(/\D/g, '').slice(0, 6) : e.target.value,
                );
              }}
              autoComplete="one-time-code"
              inputMode={mode === 'app' ? 'numeric' : 'text'}
              autoFocus
              className={mode === 'app' ? 'text-center font-semibold tracking-[0.5em]' : ''}
            />
          )}
        </FormField>
        <label className="text-ink-2 flex cursor-pointer items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            checked={trustDevice}
            onChange={(e) => {
              setTrustDevice(e.target.checked);
            }}
            className="accent-ring size-4"
          />
          {t('twoFactor.trustDevice')}
        </label>
        <FormError>{formError}</FormError>
        <Button type="submit" variant="primary" size="lg" loading={submitting}>
          {t('twoFactor.submit')}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setMode(mode === 'app' ? 'backup' : 'app');
            setCode('');
            setFieldError(undefined);
            setFormError(undefined);
          }}
        >
          {mode === 'app' ? t('twoFactor.useBackup') : t('twoFactor.useApp')}
        </Button>
      </form>
    </AuthLayout>
  );
}
