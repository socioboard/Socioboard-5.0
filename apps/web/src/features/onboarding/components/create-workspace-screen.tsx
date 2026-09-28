import { zodResolver } from '@hookform/resolvers/zod';
import { apiRoutes, type Me } from '@socioboard/contracts';
import { Button, Combobox, FormField, Input } from '@socioboard/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { api, ApiError } from '../../../lib/api';
import { errorMessage } from '../../../lib/i18n';
import { meQuery } from '../../../lib/session';
import { AuthLayout, FormError, useSignOut } from '../../auth';
import { browserTimezone, timezoneOptions } from '../timezones';

// The server's limits (contracts WorkspaceName); the time zone comes from the list, so it's valid.
const schema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: 'validation.nameRequired' })
    .max(80, { error: 'validation.nameLong' }),
  timezone: z.string().min(1),
});
type Values = z.infer<typeof schema>;

/**
 * Onboarding step 1: name the workspace and pick its time zone. The server makes the URL slug from
 * the name and switches to the new workspace. Steps 2–3 (connect an account, first post) arrive
 * with phase 1 (P1-F7).
 */
export function CreateWorkspaceScreen({ me }: { me: Me }) {
  const { t } = useTranslation('onboarding');
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const signOut = useSignOut();

  const defaultZone = me.user.timezone ?? browserTimezone();
  const zones = useMemo(() => timezoneOptions([defaultZone]), [defaultZone]);
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', timezone: defaultZone },
  });
  const { errors } = form.formState;

  const create = useMutation({
    mutationFn: (body: Values) => api(apiRoutes.workspaces.createWorkspace, { body }),
    onSuccess: async (workspace) => {
      await queryClient.invalidateQueries({ queryKey: meQuery.queryKey });
      await navigate({ href: `/w/${encodeURIComponent(workspace.slug)}`, replace: true });
    },
  });
  const notVerified =
    create.error instanceof ApiError && create.error.code === 'EMAIL_NOT_VERIFIED';
  // Someone who already has a workspace can make another, and can go back to it.
  const current = (
    me.memberships.find((m) => m.workspace.id === me.activeWorkspaceId) ?? me.memberships[0]
  )?.workspace;

  return (
    <AuthLayout
      title={current ? t('create.titleAnother') : t('create.title')}
      subtitle={t('create.subtitle')}
      footer={
        <>
          {t('create.signedInAs', { email: me.user.email })} ·{' '}
          <button
            type="button"
            onClick={() => {
              void signOut();
            }}
            className="text-ink cursor-pointer font-semibold underline-offset-4 hover:underline"
          >
            {t('create.signOut')}
          </button>
        </>
      }
    >
      <form
        onSubmit={(e) =>
          void form.handleSubmit((values) => {
            create.mutate(values);
          })(e)
        }
        noValidate
        className="flex flex-col gap-4"
      >
        <FormField
          label={t('create.name')}
          hint={t('create.nameHint')}
          error={errors.name?.message && t(errors.name.message as 'validation.nameRequired')}
        >
          {(p) => (
            <Input
              {...p}
              {...form.register('name')}
              placeholder={t('create.namePlaceholder')}
              autoComplete="organization"
              maxLength={80}
              autoFocus
            />
          )}
        </FormField>
        <FormField label={t('create.timezone')} hint={t('create.timezoneHint')}>
          {(p) => (
            <Controller
              control={form.control}
              name="timezone"
              render={({ field }) => (
                <Combobox
                  {...p}
                  ref={field.ref}
                  onBlur={field.onBlur}
                  options={zones}
                  value={field.value}
                  onValueChange={field.onChange}
                  searchLabel={t('create.timezoneSearch')}
                  emptyText={t('create.timezoneEmpty')}
                />
              )}
            />
          )}
        </FormField>
        {notVerified ? (
          <div className="flex flex-col gap-3">
            <FormError>{t('create.verifyFirst')}</FormError>
            <Button asChild size="lg">
              <Link to="/verify-email" search={{ redirect: '/onboarding' }}>
                {t('create.goVerify')}
              </Link>
            </Button>
          </div>
        ) : (
          <FormError>{create.error ? errorMessage(create.error) : undefined}</FormError>
        )}
        <Button type="submit" variant="primary" size="lg" loading={create.isPending}>
          {t('create.submit')}
        </Button>
        {current && (
          <Button asChild variant="ghost">
            <Link to="/w/$slug" params={{ slug: current.slug }}>
              {t('create.cancel', { workspace: current.name })}
            </Link>
          </Button>
        )}
      </form>
    </AuthLayout>
  );
}
