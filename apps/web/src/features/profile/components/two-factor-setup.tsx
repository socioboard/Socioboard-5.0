import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  FormField,
  Input,
  toast,
} from '@socioboard/ui';
import { Copy, Download } from 'lucide-react';
import { useState, type SyntheticEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { ApiError } from '../../../lib/api';
import { authClient, unwrap } from '../../../lib/auth-client';
import { errorMessage } from '../../../lib/i18n';
import { FormError } from '../../auth';
import { QrCode } from './qr-code';

/**
 * Turning on 2FA: confirm the password, scan the QR code (or type the key), prove it works with a
 * code, then save the backup codes. Better Auth turns 2FA on only once the code checks out.
 */
export function TwoFactorSetupDialog({
  open,
  onOpenChange,
  onEnabled,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEnabled: () => void;
}) {
  const { t } = useTranslation('account');
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent closeLabel={t('common.close')}>
        {/* Mounted only while open: every attempt starts at the password step. */}
        <SetupSteps
          onEnabled={onEnabled}
          close={() => {
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

type Step =
  | { name: 'password' }
  | { name: 'scan'; totpURI: string; backupCodes: string[] }
  | { name: 'codes'; backupCodes: string[] };

function SetupSteps({ onEnabled, close }: { onEnabled: () => void; close: () => void }) {
  const { t } = useTranslation('account');
  const [step, setStep] = useState<Step>({ name: 'password' });
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  const submit = async (event: SyntheticEvent) => {
    event.preventDefault();
    setError(undefined);
    if (step.name === 'scan' && !/^\d{6}$/.test(code)) {
      setError(t('twoFactor.codeInvalid'));
      return;
    }
    setBusy(true);
    try {
      if (step.name === 'password') {
        const result = unwrap(await authClient.twoFactor.enable({ password }));
        // We use app codes (TOTP) only; the email-code variant isn't configured on the server.
        if (!result || !('totpURI' in result)) throw new ApiError(500, 'UNEXPECTED', '', undefined);
        setStep({ name: 'scan', totpURI: result.totpURI, backupCodes: result.backupCodes });
      } else if (step.name === 'scan') {
        unwrap(await authClient.twoFactor.verifyTotp({ code }));
        onEnabled();
        setStep({ name: 'codes', backupCodes: step.backupCodes });
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (step.name === 'codes') {
    return (
      <>
        <DialogHeader>
          <DialogTitle>{t('twoFactor.codesTitle')}</DialogTitle>
          <DialogDescription>{t('twoFactor.codesStep')}</DialogDescription>
        </DialogHeader>
        <BackupCodes codes={step.backupCodes} />
        <DialogFooter>
          <Button
            variant="primary"
            // The code field just went away; keep focus inside, on the next thing to do.
            autoFocus
            onClick={() => {
              toast.success(t('twoFactor.enabled'));
              close();
            }}
          >
            {t('twoFactor.done')}
          </Button>
        </DialogFooter>
      </>
    );
  }

  // Grouped in fours for typing; authenticator apps ignore the spaces.
  const secret = step.name === 'scan' ? new URL(step.totpURI).searchParams.get('secret') : null;
  return (
    <form onSubmit={(e) => void submit(e)} noValidate className="flex flex-col gap-4">
      <DialogHeader>
        <DialogTitle>{t('twoFactor.enableTitle')}</DialogTitle>
        <DialogDescription>
          {step.name === 'password' ? t('twoFactor.passwordStep') : t('twoFactor.scanStep')}
        </DialogDescription>
      </DialogHeader>
      {step.name === 'password' ? (
        <FormField label={t('twoFactor.password')}>
          {(p) => (
            <Input
              {...p}
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              autoFocus
            />
          )}
        </FormField>
      ) : (
        <>
          <div className="flex flex-col items-center gap-3">
            <QrCode value={step.totpURI} label={t('twoFactor.qrLabel')} />
            {secret && (
              <p className="text-ink-3 text-center text-xs">
                {t('twoFactor.manual')}{' '}
                <code className="text-ink bg-chip rounded px-1.5 py-0.5 font-mono tracking-wider break-all">
                  {secret.match(/.{1,4}/g)?.join(' ')}
                </code>
              </p>
            )}
          </div>
          <FormField label={t('twoFactor.code')}>
            {(p) => (
              <Input
                {...p}
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                }}
                inputMode="numeric"
                autoComplete="one-time-code"
                className="text-center font-semibold tracking-[0.5em]"
                autoFocus
              />
            )}
          </FormField>
        </>
      )}
      <FormError>{error}</FormError>
      <DialogFooter>
        <Button onClick={close} disabled={busy}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" variant="primary" loading={busy}>
          {step.name === 'password' ? t('twoFactor.continue') : t('twoFactor.verify')}
        </Button>
      </DialogFooter>
    </form>
  );
}

/** New backup codes (after "New backup codes"), shown once. */
export function BackupCodesDialog({
  codes,
  onClose,
}: {
  codes: string[] | null;
  onClose: () => void;
}) {
  const { t } = useTranslation('account');
  return (
    <Dialog
      open={codes !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent closeLabel={t('common.close')}>
        <DialogHeader>
          <DialogTitle>{t('twoFactor.codesTitle')}</DialogTitle>
          <DialogDescription>{t('twoFactor.codesStep')}</DialogDescription>
        </DialogHeader>
        {codes && <BackupCodes codes={codes} />}
        <DialogFooter>
          <Button variant="primary" onClick={onClose}>
            {t('twoFactor.done')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BackupCodes({ codes }: { codes: string[] }) {
  const { t } = useTranslation('account');
  const text = codes.join('\n');
  return (
    <div className="flex flex-col gap-3">
      <ul className="glass-chip rounded-control grid grid-cols-2 gap-x-6 gap-y-1.5 p-4 font-mono text-sm tracking-wider">
        {codes.map((code) => (
          <li key={code}>{code}</li>
        ))}
      </ul>
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => {
            void navigator.clipboard.writeText(text).then(() => {
              toast.success(t('twoFactor.codesCopied'));
            });
          }}
        >
          <Copy aria-hidden="true" />
          {t('twoFactor.copyCodes')}
        </Button>
        <Button size="sm" asChild>
          <a
            href={`data:text/plain;charset=utf-8,${encodeURIComponent(`Socioboard backup codes\n\n${text}\n`)}`}
            download="socioboard-backup-codes.txt"
          >
            <Download aria-hidden="true" />
            {t('twoFactor.downloadCodes')}
          </a>
        </Button>
      </div>
    </div>
  );
}
