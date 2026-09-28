import { zodResolver } from '@hookform/resolvers/zod';
import { Button, FormField, Input } from '@socioboard/ui';
import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { authClient, unwrap } from '../../../lib/auth-client';
import { errorMessage } from '../../../lib/i18n';
import { AuthLayout, FormError, FormNotice } from './auth-layout';
import { PasswordField } from './password-field';

const requestSchema = z.object({ email: z.email({ error: 'validation.emailInvalid' }) });
const setSchema = z.object({
  password: z
    .string()
    .min(10, { error: 'validation.passwordShort' })
    .max(128, { error: 'validation.passwordLong' }),
});

function BackToSignIn() {
  const { t } = useTranslation('auth');
  return (
    <Link to="/login" className="text-ink font-semibold underline-offset-4 hover:underline">
      {t('reset.backToSignIn')}
    </Link>
  );
}

/** Without a token: ask for a link. With one (from the email): choose a new password. */
export function ResetPasswordScreen({ token, linkError }: { token?: string; linkError?: string }) {
  return token && !linkError ? (
    <SetPassword token={token} />
  ) : (
    <RequestLink {...(linkError ? { linkError } : {})} />
  );
}

function RequestLink({ linkError }: { linkError?: string }) {
  const { t } = useTranslation('auth');
  const [sentTo, setSentTo] = useState<string>();
  const [formError, setFormError] = useState<string>();
  const form = useForm({ resolver: zodResolver(requestSchema), defaultValues: { email: '' } });
  const { errors, isSubmitting } = form.formState;

  const onSubmit = form.handleSubmit(async ({ email }) => {
    setFormError(undefined);
    try {
      // The same answer whether or not the address has an account, so the form can't be used to
      // find out who has one.
      unwrap(await authClient.requestPasswordReset({ email, redirectTo: '/reset-password' }));
      setSentTo(email);
    } catch (err) {
      setFormError(errorMessage(err));
    }
  });

  return (
    <AuthLayout
      title={t('reset.requestTitle')}
      subtitle={t('reset.requestBody')}
      footer={<BackToSignIn />}
    >
      {linkError && <FormError>{t('reset.linkInvalid')}</FormError>}
      {sentTo ? (
        <FormNotice>{t('reset.requestSent', { email: sentTo })}</FormNotice>
      ) : (
        <form onSubmit={(e) => void onSubmit(e)} noValidate className="flex flex-col gap-4">
          <FormField
            label={t('fields.email')}
            error={errors.email?.message && t(errors.email.message as 'validation.emailInvalid')}
          >
            {(p) => (
              <Input
                {...p}
                {...form.register('email')}
                type="email"
                autoComplete="email"
                autoFocus
              />
            )}
          </FormField>
          <FormError>{formError}</FormError>
          <Button type="submit" variant="primary" size="lg" loading={isSubmitting}>
            {t('reset.requestSubmit')}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}

function SetPassword({ token }: { token: string }) {
  const { t } = useTranslation('auth');
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState<string>();
  const form = useForm({ resolver: zodResolver(setSchema), defaultValues: { password: '' } });
  const password = useWatch({ control: form.control, name: 'password' });
  const { errors, isSubmitting } = form.formState;

  const onSubmit = form.handleSubmit(async ({ password }) => {
    setFormError(undefined);
    try {
      unwrap(await authClient.resetPassword({ newPassword: password, token }));
      setDone(true);
    } catch (err) {
      setFormError(errorMessage(err));
    }
  });

  if (done) {
    return (
      <AuthLayout title={t('reset.setTitle')}>
        <FormNotice>{t('reset.done')}</FormNotice>
        <Button asChild variant="primary" size="lg">
          <Link to="/login">{t('signIn.submit')}</Link>
        </Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={t('reset.setTitle')} footer={<BackToSignIn />}>
      <form onSubmit={(e) => void onSubmit(e)} noValidate className="flex flex-col gap-4">
        <PasswordField
          label={t('fields.newPassword')}
          {...form.register('password')}
          value={password}
          autoComplete="new-password"
          hint={t('fields.passwordHint')}
          showStrength
          autoFocus
          error={
            errors.password?.message && t(errors.password.message as 'validation.passwordShort')
          }
        />
        <FormError>{formError}</FormError>
        <Button type="submit" variant="primary" size="lg" loading={isSubmitting}>
          {t('reset.setSubmit')}
        </Button>
      </form>
    </AuthLayout>
  );
}
