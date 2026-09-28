import { zodResolver } from '@hookform/resolvers/zod';
import { Button, FormField, Input } from '@socioboard/ui';
import { Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { authClient, unwrap } from '../../../lib/auth-client';
import { errorMessage, linkErrorMessage } from '../../../lib/i18n';
import { withRedirect } from '../../../lib/redirect';
import { useFinishSignIn } from '../hooks';
import { AuthLayout, FormError, FormNotice } from './auth-layout';
import { PasswordField } from './password-field';
import { SocialButtons } from './social-buttons';

const passwordSchema = z.object({
  email: z.email({ error: 'validation.emailInvalid' }),
  password: z.string().min(1, { error: 'validation.passwordShort' }),
});
const linkSchema = z.object({ email: z.email({ error: 'validation.emailInvalid' }) });

export function SignInScreen({ redirect, linkError }: { redirect?: string; linkError?: string }) {
  const { t } = useTranslation('auth');
  const [mode, setMode] = useState<'password' | 'link'>('password');
  return (
    <AuthLayout
      title={t('signIn.title')}
      footer={
        <>
          {t('signIn.noAccount')}{' '}
          <Link
            to="/signup"
            search={redirect ? { redirect } : {}}
            className="text-ink font-semibold underline-offset-4 hover:underline"
          >
            {t('signIn.createAccount')}
          </Link>
        </>
      }
    >
      <SocialButtons redirect={redirect} />
      {linkError && <FormError>{linkErrorMessage(linkError)}</FormError>}
      {mode === 'password' ? (
        <PasswordForm
          {...(redirect ? { redirect } : {})}
          onUseLink={() => {
            setMode('link');
          }}
        />
      ) : (
        <LinkForm
          {...(redirect ? { redirect } : {})}
          onUsePassword={() => {
            setMode('password');
          }}
        />
      )}
    </AuthLayout>
  );
}

function PasswordForm({ redirect, onUseLink }: { redirect?: string; onUseLink: () => void }) {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const finish = useFinishSignIn();
  const [formError, setFormError] = useState<string>();
  const form = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { email: '', password: '' },
  });
  const password = useWatch({ control: form.control, name: 'password' });
  const { errors, isSubmitting } = form.formState;

  const onSubmit = form.handleSubmit(async ({ email, password }) => {
    setFormError(undefined);
    try {
      const result = unwrap(await authClient.signIn.email({ email, password }));
      if (result && 'twoFactorRedirect' in result && result.twoFactorRedirect) {
        await navigate({ to: '/login/2fa', search: redirect ? { redirect } : {} });
        return;
      }
      await finish(redirect);
    } catch (err) {
      setFormError(errorMessage(err));
    }
  });

  return (
    <form onSubmit={(e) => void onSubmit(e)} noValidate className="flex flex-col gap-4">
      <FormField
        label={t('fields.email')}
        error={errors.email?.message && t(errors.email.message as 'validation.emailInvalid')}
      >
        {(p) => (
          <Input {...p} {...form.register('email')} type="email" autoComplete="email" autoFocus />
        )}
      </FormField>
      <PasswordField
        label={t('fields.password')}
        {...form.register('password')}
        value={password}
        autoComplete="current-password"
        error={errors.password?.message && t(errors.password.message as 'validation.passwordShort')}
      />
      <div className="-mt-2 flex justify-end">
        <Link
          to="/reset-password"
          className="text-ink-2 text-[13px] underline-offset-4 hover:underline"
        >
          {t('signIn.forgot')}
        </Link>
      </div>
      <FormError>{formError}</FormError>
      <Button type="submit" variant="primary" size="lg" loading={isSubmitting}>
        {t('signIn.submit')}
      </Button>
      <Button variant="ghost" onClick={onUseLink}>
        {t('signIn.withLink')}
      </Button>
    </form>
  );
}

function LinkForm({ redirect, onUsePassword }: { redirect?: string; onUsePassword: () => void }) {
  const { t } = useTranslation('auth');
  const [sentTo, setSentTo] = useState<string>();
  const [formError, setFormError] = useState<string>();
  const form = useForm({ resolver: zodResolver(linkSchema), defaultValues: { email: '' } });
  const { errors, isSubmitting } = form.formState;

  const onSubmit = form.handleSubmit(async ({ email }) => {
    setFormError(undefined);
    try {
      unwrap(
        await authClient.signIn.magicLink({
          email,
          // Both land on this page, which routes onward or explains the error.
          callbackURL: withRedirect('/login', redirect),
          errorCallbackURL: withRedirect('/login', redirect),
        }),
      );
      setSentTo(email);
    } catch (err) {
      setFormError(errorMessage(err));
    }
  });

  return (
    <form onSubmit={(e) => void onSubmit(e)} noValidate className="flex flex-col gap-4">
      <FormField
        label={t('fields.email')}
        error={errors.email?.message && t(errors.email.message as 'validation.emailInvalid')}
      >
        {(p) => (
          <Input {...p} {...form.register('email')} type="email" autoComplete="email" autoFocus />
        )}
      </FormField>
      {sentTo && <FormNotice>{t('signIn.linkSent', { email: sentTo })}</FormNotice>}
      <FormError>{formError}</FormError>
      <Button type="submit" variant="primary" size="lg" loading={isSubmitting}>
        {t('signIn.sendLink')}
      </Button>
      <Button variant="ghost" onClick={onUsePassword}>
        {t('signIn.withPassword')}
      </Button>
    </form>
  );
}
