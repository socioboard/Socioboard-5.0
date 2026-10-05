import { AdminActionBody } from '@socioboard/contracts';
import { ConfirmDialog, FormField, Textarea } from '@socioboard/ui';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { errorMessage } from '../../../lib/i18n';

/**
 * Every admin action asks "Are you sure?" and why (3–500 characters, kept in the audit log with
 * the action). The confirm button waits for a reason that will be accepted.
 */
export function ReasonDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  tone = 'default',
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description: ReactNode;
  confirmLabel: string;
  tone?: 'default' | 'danger';
  onConfirm: (reason: string) => Promise<void>;
}) {
  const { t } = useTranslation('admin');
  const [reason, setReason] = useState('');
  const valid = AdminActionBody.safeParse({ reason }).success;
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setReason('');
        onOpenChange(next);
      }}
      title={title}
      description={description}
      confirmLabel={confirmLabel}
      cancelLabel={t('cancel')}
      tone={tone}
      errorMessage={errorMessage}
      confirmDisabled={!valid}
      onConfirm={async () => {
        await onConfirm(reason.trim());
        setReason('');
      }}
    >
      <FormField
        label={t('reason.label')}
        hint={t('reason.hint', { count: reason.trim().length })}
        required
      >
        {(control) => (
          <Textarea
            {...control}
            rows={3}
            maxLength={500}
            value={reason}
            autoFocus
            placeholder={t('reason.placeholder')}
            onChange={(e) => {
              setReason(e.target.value);
            }}
          />
        )}
      </FormField>
    </ConfirmDialog>
  );
}
