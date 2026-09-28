import { zodResolver } from '@hookform/resolvers/zod';
import { apiRoutes, type SessionInfo } from '@socioboard/contracts';
import {
  Badge,
  Button,
  Checkbox,
  ConfirmDialog,
  Input,
  Label,
  Skeleton,
  Switch,
  toast,
} from '@socioboard/ui';
import { queryOptions, useQuery, useQueryClient } from '@tanstack/react-query';
import { Laptop } from 'lucide-react';
import { useId, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { api } from '../../../lib/api';
import { authClient, unwrap } from '../../../lib/auth-client';
import { formatDateTime } from '../../../lib/format';
import { errorMessage } from '../../../lib/i18n';
import { meQuery } from '../../../lib/session';
import { useWorkspace } from '../../../lib/workspace';
import { FormError, FormNotice, PasswordField } from '../../auth';
import { SettingsSection } from '../../settings';
import { describeUserAgent, formatIp } from '../user-agent';
import { AccountPage } from './account-page';
import { BackupCodesDialog, TwoFactorSetupDialog } from './two-factor-setup';

/** Whether I can sign in with a password (people who use Google or email links may not). */
const accountsQuery = queryOptions({
  queryKey: ['me', 'accounts'],
  queryFn: async () => unwrap(await authClient.listAccounts()),
});

const sessionsQuery = queryOptions({
  queryKey: ['me', 'sessions'],
  queryFn: async ({ signal }) => (await api(apiRoutes.auth.listSessions, { signal })).items,
});

/** `/me/security`: password, two-factor authentication, and where I'm signed in. */
export function SecurityPage() {
  const accounts = useQuery(accountsQuery);
  const hasPassword = accounts.data?.some((a) => a.providerId === 'credential');
  return (
    <AccountPage>
      {accounts.isPending ? (
        <Skeleton className="h-40 w-full" />
      ) : (
        <>
          {hasPassword ? <ChangePassword /> : <SetPassword />}
          <TwoFactor hasPassword={hasPassword === true} />
        </>
      )}
      <Sessions />
    </AccountPage>
  );
}

const passwordSchema = z.object({
  currentPassword: z.string().min(1, { error: 'password.currentRequired' }),
  newPassword: z.string().min(10, { error: 'auth:validation.passwordShort' }).max(128),
  revokeOtherSessions: z.boolean(),
});
type PasswordValues = z.infer<typeof passwordSchema>;

function ChangePassword() {
  const { t } = useTranslation(['account', 'auth']);
  const queryClient = useQueryClient();
  const form = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', revokeOtherSessions: true },
  });
  const [current, next] = useWatch({
    control: form.control,
    name: ['currentPassword', 'newPassword'],
  });
  const { errors, isSubmitting } = form.formState;
  const message = (key?: string) => (key ? t(key as 'password.currentRequired') : undefined);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      unwrap(await authClient.changePassword(values));
      form.reset();
      await queryClient.invalidateQueries({ queryKey: sessionsQuery.queryKey });
      toast.success(t('password.changed'));
    } catch (err) {
      form.setError('root', { message: errorMessage(err) });
    }
  });

  return (
    <SettingsSection title={t('password.title')} description={t('password.body')}>
      <form onSubmit={(e) => void onSubmit(e)} noValidate className="flex flex-col gap-4">
        <PasswordField
          label={t('password.current')}
          {...form.register('currentPassword')}
          value={current}
          autoComplete="current-password"
          error={message(errors.currentPassword?.message)}
        />
        <PasswordField
          label={t('password.new')}
          {...form.register('newPassword')}
          value={next}
          autoComplete="new-password"
          showStrength
          error={message(errors.newPassword?.message)}
        />
        <Controller
          control={form.control}
          name="revokeOtherSessions"
          render={({ field }) => (
            <Checkbox
              label={t('password.signOutOthers')}
              description={t('password.signOutOthersHint')}
              checked={field.value}
              onCheckedChange={(checked) => {
                field.onChange(checked === true);
              }}
            />
          )}
        />
        <FormError>{errors.root?.message}</FormError>
        <div>
          <Button type="submit" variant="primary" loading={isSubmitting}>
            {t('password.change')}
          </Button>
        </div>
      </form>
    </SettingsSection>
  );
}

/** Without a password: set one through the emailed reset link, which creates it. */
function SetPassword() {
  const { t } = useTranslation('account');
  const { me } = useWorkspace();
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState<string>();
  const send = async () => {
    setState('sending');
    setError(undefined);
    try {
      unwrap(
        await authClient.requestPasswordReset({
          email: me.user.email,
          redirectTo: '/reset-password',
        }),
      );
      setState('sent');
    } catch (err) {
      setError(errorMessage(err));
      setState('idle');
    }
  };
  return (
    <SettingsSection title={t('password.noneTitle')} description={t('password.noneBody')}>
      {state === 'sent' ? (
        <FormNotice>{t('password.setSent')}</FormNotice>
      ) : (
        <div>
          <Button loading={state === 'sending'} onClick={() => void send()}>
            {t('password.set')}
          </Button>
        </div>
      )}
      <FormError>{error}</FormError>
    </SettingsSection>
  );
}

function TwoFactor({ hasPassword }: { hasPassword: boolean }) {
  const { t } = useTranslation('account');
  const { me } = useWorkspace();
  const queryClient = useQueryClient();
  const passwordId = useId();
  const enabled = me.user.twoFactorEnabled;
  const [dialog, setDialog] = useState<'enable' | 'disable' | 'codes' | null>(null);
  const [password, setPassword] = useState('');
  const [codes, setCodes] = useState<string[] | null>(null);
  const close = (open: boolean) => {
    if (!open) {
      setDialog(null);
      setPassword('');
    }
  };
  const refreshMe = () => queryClient.invalidateQueries({ queryKey: meQuery.queryKey });

  const passwordInput = (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={passwordId}>{t('twoFactor.password')}</Label>
      <Input
        id={passwordId}
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
        }}
        autoFocus
      />
    </div>
  );

  let status = enabled ? t('twoFactor.on') : t('twoFactor.off');
  if (!hasPassword && !enabled) status = t('twoFactor.needsPassword');

  return (
    <SettingsSection title={t('twoFactor.title')}>
      <div className="flex items-center justify-between gap-4">
        <p className="text-ink-2 text-sm leading-relaxed">{status}</p>
        <Switch
          aria-label={t('twoFactor.toggle')}
          checked={enabled}
          disabled={!hasPassword}
          onCheckedChange={(on) => {
            setDialog(on ? 'enable' : 'disable');
          }}
        />
      </div>
      {enabled && hasPassword && (
        <div>
          <Button
            size="sm"
            onClick={() => {
              setDialog('codes');
            }}
          >
            {t('twoFactor.newCodes')}
          </Button>
        </div>
      )}

      <TwoFactorSetupDialog
        open={dialog === 'enable'}
        onOpenChange={close}
        onEnabled={() => void refreshMe()}
      />
      <ConfirmDialog
        open={dialog === 'disable'}
        onOpenChange={close}
        tone="danger"
        title={t('twoFactor.disableTitle')}
        description={t('twoFactor.disableDescription')}
        confirmLabel={t('twoFactor.disableConfirm')}
        cancelLabel={t('common.cancel')}
        closeLabel={t('common.close')}
        errorMessage={errorMessage}
        onConfirm={async () => {
          unwrap(await authClient.twoFactor.disable({ password }));
          await refreshMe();
          toast.success(t('twoFactor.disabled'));
        }}
      >
        {passwordInput}
      </ConfirmDialog>
      <ConfirmDialog
        open={dialog === 'codes'}
        onOpenChange={close}
        title={t('twoFactor.regenerateTitle')}
        description={t('twoFactor.regenerateDescription')}
        confirmLabel={t('twoFactor.regenerateConfirm')}
        cancelLabel={t('common.cancel')}
        closeLabel={t('common.close')}
        errorMessage={errorMessage}
        onConfirm={async () => {
          const result = unwrap(await authClient.twoFactor.generateBackupCodes({ password }));
          setCodes(result?.backupCodes ?? []);
        }}
      >
        {passwordInput}
      </ConfirmDialog>
      <BackupCodesDialog
        codes={codes}
        onClose={() => {
          setCodes(null);
        }}
      />
    </SettingsSection>
  );
}

function Sessions() {
  const { t } = useTranslation('account');
  const queryClient = useQueryClient();
  const sessions = useQuery(sessionsQuery);
  const [revoking, setRevoking] = useState<SessionInfo | null>(null);
  const [revokingOthers, setRevokingOthers] = useState(false);
  const deviceName = (session: SessionInfo) => {
    const device = describeUserAgent(session.userAgent);
    return device ? t('sessions.onDevice', device) : t('sessions.unknownDevice');
  };
  const others = (sessions.data ?? []).filter((s) => !s.current);

  let body;
  if (sessions.isPending) body = <Skeleton className="h-24 w-full" />;
  else if (sessions.isError) body = <FormError>{t('sessions.loadError')}</FormError>;
  else {
    body = (
      <ul className="divide-hair glass-chip rounded-control flex flex-col divide-y">
        {sessions.data.map((session) => (
          <li key={session.id} className="flex flex-wrap items-center gap-3 px-3.5 py-3">
            <Laptop className="text-ink-3 size-4 shrink-0" aria-hidden="true" />
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-ink flex items-center gap-2 text-sm font-medium">
                {deviceName(session)}
                {session.current && <Badge tone="accent">{t('sessions.thisDevice')}</Badge>}
              </span>
              <span className="text-ink-3 text-xs">
                {[
                  formatIp(session.ipAddress),
                  t('sessions.started', { date: formatDateTime(session.createdAt) }),
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </span>
            </div>
            {!session.current && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setRevoking(session);
                }}
              >
                {t('sessions.revoke')}
              </Button>
            )}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <SettingsSection title={t('sessions.title')} description={t('sessions.body')}>
      {body}
      {others.length > 0 && (
        <div>
          <Button
            size="sm"
            onClick={() => {
              setRevokingOthers(true);
            }}
          >
            {t('sessions.revokeOthers')}
          </Button>
        </div>
      )}
      <ConfirmDialog
        open={revoking !== null}
        onOpenChange={(open) => {
          if (!open) setRevoking(null);
        }}
        title={t('sessions.revokeTitle', { device: revoking ? deviceName(revoking) : '' })}
        description={t('sessions.revokeDescription')}
        confirmLabel={t('sessions.revokeConfirm')}
        cancelLabel={t('common.cancel')}
        closeLabel={t('common.close')}
        errorMessage={errorMessage}
        onConfirm={async () => {
          if (!revoking) return;
          await api(apiRoutes.auth.revokeSession, { params: { sessionId: revoking.id } });
          queryClient.setQueryData(sessionsQuery.queryKey, (list?: SessionInfo[]) =>
            list?.filter((s) => s.id !== revoking.id),
          );
          toast.success(t('sessions.revoked', { device: deviceName(revoking) }));
        }}
      />
      <ConfirmDialog
        open={revokingOthers}
        onOpenChange={setRevokingOthers}
        title={t('sessions.revokeOthersTitle')}
        description={t('sessions.revokeOthersDescription')}
        confirmLabel={t('sessions.revokeOthers')}
        cancelLabel={t('common.cancel')}
        closeLabel={t('common.close')}
        errorMessage={errorMessage}
        onConfirm={async () => {
          unwrap(await authClient.revokeOtherSessions());
          await queryClient.invalidateQueries({ queryKey: sessionsQuery.queryKey });
          toast.success(t('sessions.revokedOthers'));
        }}
      />
    </SettingsSection>
  );
}
