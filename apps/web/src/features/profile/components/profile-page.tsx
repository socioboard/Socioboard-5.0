import { zodResolver } from '@hookform/resolvers/zod';
import { apiRoutes, type Me } from '@socioboard/contracts';
import { Button, Combobox, FormField, Input, toast } from '@socioboard/ui';
import { useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { api } from '../../../lib/api';
import { errorMessage } from '../../../lib/i18n';
import { meQuery } from '../../../lib/session';
import { uploadImage } from '../../../lib/upload';
import { useWorkspace } from '../../../lib/workspace';
import { FormError } from '../../auth';
import { browserTimezone, timezoneOptions } from '../../onboarding';
import { ImageField, SettingsSection } from '../../settings';
import { AccountPage } from './account-page';

const schema = z.object({
  name: z.string().trim().min(1, { error: 'profile.nameRequired' }).max(80),
  timezone: z.string().min(1),
});
type Values = z.infer<typeof schema>;

/** `/me/profile`: name, photo and time zone. */
export function ProfilePage() {
  const { t } = useTranslation('account');
  const { me } = useWorkspace();
  const queryClient = useQueryClient();

  const saveAvatar = async (avatarKey: string | null) => {
    const updated = await api(apiRoutes.auth.updateMe, { body: { avatarKey } });
    queryClient.setQueryData(meQuery.queryKey, updated);
  };

  return (
    <AccountPage>
      <ProfileForm key={`${me.user.name}|${me.user.timezone ?? ''}`} me={me} />
      <SettingsSection title={t('profile.photo')}>
        <ImageField
          name={me.user.name}
          src={me.user.avatarUrl}
          hint={t('profile.photoHint')}
          labels={{
            upload: t('profile.upload'),
            replace: t('profile.replace'),
            remove: t('profile.remove'),
          }}
          onUpload={async (file) => {
            const key = await uploadImage(file, (body) =>
              api(apiRoutes.auth.createAvatarUpload, { body }),
            );
            await saveAvatar(key);
            toast.success(t('profile.photoSaved'));
          }}
          onRemove={async () => {
            await saveAvatar(null);
            toast.success(t('profile.photoRemoved'));
          }}
        />
      </SettingsSection>
    </AccountPage>
  );
}

function ProfileForm({ me }: { me: Me }) {
  const { t } = useTranslation('account');
  const queryClient = useQueryClient();
  const defaultZone = me.user.timezone ?? browserTimezone();
  const zones = useMemo(() => timezoneOptions([defaultZone]), [defaultZone]);
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: me.user.name, timezone: defaultZone },
  });
  const { errors, isDirty, isSubmitting, dirtyFields } = form.formState;
  // No time zone saved yet counts as a change, so the browser's zone can be saved as is.
  const unsaved = isDirty || me.user.timezone === null;

  const onSubmit = form.handleSubmit(async (values) => {
    const body: Partial<Values> = {};
    if (dirtyFields.name) body.name = values.name;
    if (dirtyFields.timezone || me.user.timezone === null) body.timezone = values.timezone;
    try {
      const updated = await api(apiRoutes.auth.updateMe, { body });
      queryClient.setQueryData(meQuery.queryKey, updated);
      toast.success(t('profile.saved'));
    } catch (err) {
      form.setError('root', { message: errorMessage(err) });
    }
  });

  return (
    <SettingsSection title={t('profile.title')} description={t('profile.body')}>
      <form onSubmit={(e) => void onSubmit(e)} noValidate className="flex flex-col gap-4">
        <FormField
          label={t('profile.name')}
          error={errors.name?.message && t(errors.name.message as 'profile.nameRequired')}
        >
          {(p) => <Input {...p} {...form.register('name')} maxLength={80} autoComplete="name" />}
        </FormField>
        <FormField label={t('profile.email')} hint={t('profile.emailHint')}>
          {(p) => <Input {...p} value={me.user.email} readOnly disabled />}
        </FormField>
        <FormField label={t('profile.timezone')} hint={t('profile.timezoneHint')}>
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
                  searchLabel={t('profile.timezoneSearch')}
                  emptyText={t('profile.timezoneEmpty')}
                />
              )}
            />
          )}
        </FormField>
        <FormError>{errors.root?.message}</FormError>
        <div>
          <Button type="submit" variant="primary" loading={isSubmitting} disabled={!unsaved}>
            {t('profile.save')}
          </Button>
        </div>
      </form>
    </SettingsSection>
  );
}
