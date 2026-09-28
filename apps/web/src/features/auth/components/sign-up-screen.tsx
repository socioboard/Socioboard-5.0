import { zodResolver } from '@hookform/resolvers/zod';
import { Button, FormField, Input } from '@socioboard/ui';
import { useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { authClient, unwrap } from '../../../lib/auth-client';
import { errorMessage } from '../../../lib/i18n';
import { withRedirect } from '../../../lib/redirect';
import { authOptionsQuery, meQuery } from '../../../lib/session';
import { useFinishSignIn } from '../hooks';
import { AuthLayout, FormError } from './auth-layout';
import { PasswordField } from './password-field';
import { SocialButtons } from './social-buttons';

// The same limits the server enforces (Better Auth: 10–128 characters).
const schema = z.object({
  name: z.string().trim().min(1, { error: 'validation.nameRequired' }).max(100),
  email: z.email({ error: 'validation.emailInvalid' }),
  password: z
    .string()
    .min(10, { error: 'validation.passwordShort' })
    .max(128, { error: 'validation.passwordLong' }),
});
type Values = z.infer<typeof schema>;

export function SignUpScreen({ redirect }: { redirect?: string }) {
  const { t } = useTranslation('auth');
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const finish = useFinishSignIn();
  const [formError, setFormError] = useState<string>();
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '' },
  });
  const password = useWatch({ control: form.control, name: 'password' });
  const { errors, isSubmitting } = form.formState;
  const fieldError = (message?: string) => message && t(message as 'validation.nameRequired');

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(undefined);
    try {
      unwrap(
        await authClient.signUp.email({
          ...values,
          // Where the verification link lands (the page asks the server whether it worked). It
          // keeps `redirect`: the link usually opens in a new tab, and an invitee must get back
          // to the invitation rather than to onboarding.
          callbackURL: withRedirect('/verify-email', redirect),
        }),
      );
      const options = await queryClient.query({ ...authOptionsQuery, staleTime: 'static' });
      if (options.emailVerificationRequired) {
        // Signing up also signed them in: drop the cached "signed out" from before the form.
        await queryClient.invalidateQueries({ queryKey: meQuery.queryKey });
        await navigate({ to: '/verify-email', search: redirect ? { redirect } : {} });
      } else {
        await finish(redirect);
      }
    } catch (err) {
      setFormError(errorMessage(err));
    }
  });

  return (
    <AuthLayout
      title={t('signUp.title')}
      subtitle={t('signUp.subtitle')}
      footer={
        <>
          {t('signUp.haveAccount')}{' '}
          <Link
            to="/login"
            search={redirect ? { redirect } : {}}
            className="text-ink font-semibold underline-offset-4 hover:underline"
          >
            {t('signUp.signIn')}
          </Link>
        </>
      }
    >
      <SocialButtons redirect={redirect} />
      <form onSubmit={(e) => void onSubmit(e)} noValidate className="flex flex-col gap-4">
        <FormField label={t('fields.name')} error={fieldError(errors.name?.message)}>
          {(p) => <Input {...p} {...form.register('name')} autoComplete="name" autoFocus />}
        </FormField>
        <FormField label={t('fields.email')} error={fieldError(errors.email?.message)}>
          {(p) => <Input {...p} {...form.register('email')} type="email" autoComplete="email" />}
        </FormField>
        <PasswordField
          label={t('fields.password')}
          {...form.register('password')}
          value={password}
          autoComplete="new-password"
          hint={t('fields.passwordHint')}
          showStrength
          error={fieldError(errors.password?.message)}
        />
        <FormError>{formError}</FormError>
        <Button type="submit" variant="primary" size="lg" loading={isSubmitting}>
          {t('signUp.submit')}
        </Button>
        <p className="text-ink-3 text-xs leading-relaxed">{t('signUp.terms')}</p>
      </form>
    </AuthLayout>
  );
}
