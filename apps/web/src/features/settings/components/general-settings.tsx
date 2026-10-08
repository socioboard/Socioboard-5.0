import { zodResolver } from '@hookform/resolvers/zod';
import { apiRoutes, Slug, type WorkspaceWithRole } from '@socioboard/contracts';
import {
  Button,
  Combobox,
  EmptyState,
  FormField,
  Input,
  Skeleton,
  Switch,
  toast,
} from '@socioboard/ui';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useId, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { api, ApiError } from '../../../lib/api';
import { errorMessage } from '../../../lib/i18n';
import { meQuery } from '../../../lib/session';
import { uploadImage } from '../../../lib/upload';
import { useWorkspace } from '../../../lib/workspace';
import { FormError } from '../../auth';
import { timezoneOptions } from '../../onboarding';
import { workspaceKeys, workspaceQuery } from '../api';
import { DangerZone } from './danger-zone';
import { ImageField } from './image-field';
import { SettingsSection } from './settings-page';

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: 'general.validation.nameRequired' })
    .max(80, { error: 'general.validation.nameLong' }),
  // The contract's own slug rule, with our translated message.
  slug: z.string().refine((s) => Slug.safeParse(s).success, {
    error: 'general.validation.slugInvalid',
  }),
  timezone: z.string().min(1),
});
type Values = z.infer<typeof schema>;

/** `/w/:slug/settings/general`: name, URL, time zone and logo; the danger zone for the owner. */
export function GeneralSettings() {
  const { t } = useTranslation('settings');
  const { workspace, role } = useWorkspace();
  const detail = useQuery(workspaceQuery(workspace.id));

  if (detail.isPending) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }
  if (detail.isError) {
    return (
      <EmptyState
        title={errorMessage(detail.error)}
        action={<Button onClick={() => void detail.refetch()}>{t('common.retry')}</Button>}
      />
    );
  }
  return (
    <>
      {/* Re-mount the form when the saved values change, so it starts from them. */}
      <WorkspaceForm
        key={`${detail.data.name}|${detail.data.slug}|${detail.data.timezone}`}
        saved={detail.data}
      />
      <LogoSection saved={detail.data} />
      <ReviewSection saved={detail.data} />
      {role === 'owner' && <DangerZone workspace={detail.data} />}
    </>
  );
}

function WorkspaceForm({ saved }: { saved: WorkspaceWithRole }) {
  const { t } = useTranslation('settings');
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const zones = useMemo(() => timezoneOptions([saved.timezone]), [saved.timezone]);
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: saved.name, slug: saved.slug, timezone: saved.timezone },
  });
  const { errors, dirtyFields, isDirty, isSubmitting } = form.formState;
  // Client checks carry translation keys; server errors arrive already translated.
  const message = (text?: string) =>
    text?.startsWith('general.validation.') ? t(text as 'general.validation.nameRequired') : text;

  const onSubmit = form.handleSubmit(async (values) => {
    // Send only what changed, so a stale tab can't undo someone else's edit to another field.
    const body: Partial<Values> = {};
    if (dirtyFields.name) body.name = values.name;
    if (dirtyFields.slug) body.slug = values.slug;
    if (dirtyFields.timezone) body.timezone = values.timezone;
    try {
      const updated = await api(apiRoutes.workspaces.updateWorkspace, {
        params: { workspaceId: saved.id },
        body,
      });
      queryClient.setQueryData(workspaceKeys.detail(saved.id), updated);
      // Name and URL also live in `me` (switcher, routes): refresh it before moving the URL.
      await queryClient.invalidateQueries({ queryKey: meQuery.queryKey });
      toast.success(t('general.saved'));
      if (updated.slug !== saved.slug) {
        await navigate({
          to: '/w/$slug/settings/general',
          params: { slug: updated.slug },
          replace: true,
        });
      }
    } catch (err) {
      if (err instanceof ApiError && err.code === 'SLUG_TAKEN') {
        form.setError('slug', { message: errorMessage(err) });
      } else {
        form.setError('root', { message: errorMessage(err) });
      }
    }
  });

  return (
    <SettingsSection title={t('general.workspace')} description={t('general.workspaceBody')}>
      <form onSubmit={(e) => void onSubmit(e)} noValidate className="flex flex-col gap-4">
        <FormField label={t('general.name')} error={message(errors.name?.message)}>
          {(p) => (
            <Input {...p} {...form.register('name')} maxLength={80} autoComplete="organization" />
          )}
        </FormField>
        <FormField
          label={t('general.slug')}
          hint={t('general.slugHint')}
          error={message(errors.slug?.message)}
        >
          {(p) => (
            <div className="glass-chip rounded-control flex h-10 items-center overflow-hidden focus-within:border-ring">
              <span className="text-ink-3 border-hair border-r px-3 text-sm select-none">
                {`${window.location.host}/w/`}
              </span>
              <input
                {...p}
                {...form.register('slug', {
                  setValueAs: (v: string) => v.trim().toLowerCase(),
                })}
                maxLength={48}
                autoComplete="off"
                spellCheck={false}
                className="text-ink h-full min-w-0 flex-1 bg-transparent px-3 text-sm outline-none"
              />
            </div>
          )}
        </FormField>
        <FormField label={t('general.timezone')} hint={t('general.timezoneHint')}>
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
                  searchLabel={t('general.timezoneSearch')}
                  emptyText={t('general.timezoneEmpty')}
                />
              )}
            />
          )}
        </FormField>
        <FormError>{errors.root?.message}</FormError>
        <div>
          <Button type="submit" variant="primary" loading={isSubmitting} disabled={!isDirty}>
            {t('general.save')}
          </Button>
        </div>
      </form>
    </SettingsSection>
  );
}

function LogoSection({ saved }: { saved: WorkspaceWithRole }) {
  const { t } = useTranslation('settings');
  const queryClient = useQueryClient();
  const params = { workspaceId: saved.id };

  const save = async (logoKey: string | null) => {
    const updated = await api(apiRoutes.workspaces.updateWorkspace, { params, body: { logoKey } });
    queryClient.setQueryData(workspaceKeys.detail(saved.id), updated);
    await queryClient.invalidateQueries({ queryKey: meQuery.queryKey });
  };

  return (
    <SettingsSection title={t('general.logo')}>
      <ImageField
        name={saved.name}
        src={saved.logoUrl}
        hint={t('general.logoHint')}
        labels={{
          upload: t('general.uploadLogo'),
          replace: t('general.replaceLogo'),
          remove: t('general.removeLogo'),
        }}
        onUpload={async (file) => {
          const key = await uploadImage(file, (body) =>
            api(apiRoutes.workspaces.createLogoUpload, { params, body }),
          );
          await save(key);
          toast.success(t('general.logoSaved'));
        }}
        onRemove={async () => {
          await save(null);
          toast.success(t('general.logoRemoved'));
        }}
      />
    </SettingsSection>
  );
}

/**
 * "Review every post" (P4-F5): when on, every post needs someone else's approval before it is
 * scheduled or published; when off, only contributors' posts do.
 */
function ReviewSection({ saved }: { saved: WorkspaceWithRole }) {
  const { t } = useTranslation('settings');
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const id = useId();

  const change = async (requireReviewForAll: boolean) => {
    setBusy(true);
    try {
      const updated = await api(apiRoutes.workspaces.updateWorkspace, {
        params: { workspaceId: saved.id },
        body: { requireReviewForAll },
      });
      queryClient.setQueryData(workspaceKeys.detail(saved.id), updated);
      toast.success(requireReviewForAll ? t('general.reviewOn') : t('general.reviewOff'));
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <SettingsSection title={t('general.review')} description={t('general.reviewBody')}>
      <div className="flex items-center justify-between gap-4">
        <label htmlFor={id} className="text-ink text-sm">
          {t('general.reviewAll')}
        </label>
        <Switch
          id={id}
          checked={saved.requireReviewForAll}
          disabled={busy}
          onCheckedChange={(on) => void change(on)}
        />
      </div>
    </SettingsSection>
  );
}
