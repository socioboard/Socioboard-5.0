import { zodResolver } from '@hookform/resolvers/zod';
import { apiRoutes, AssignableRole } from '@socioboard/contracts';
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
  Label,
  RadioCard,
  RadioGroup,
  toast,
} from '@socioboard/ui';
import { useQueryClient } from '@tanstack/react-query';
import { useId } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { api } from '../../../lib/api';
import { errorMessage } from '../../../lib/i18n';
import { useWorkspace } from '../../../lib/workspace';
import { FormError } from '../../auth';
import { workspaceKeys } from '../api';

const schema = z.object({
  email: z.email({ error: 'invite.emailInvalid' }),
  role: AssignableRole,
});
type Values = z.infer<typeof schema>;

/** Invite by email with a role; the role picker says what each role can do. */
export function InviteDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation('settings');
  const { workspace } = useWorkspace();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent closeLabel={t('common.close')}>
        <DialogHeader>
          <DialogTitle>{t('invite.title', { workspace: workspace.name })}</DialogTitle>
          <DialogDescription>{t('invite.description')}</DialogDescription>
        </DialogHeader>
        {/* Mounted only while open: every invitation starts from an empty form. */}
        <InviteForm
          close={() => {
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

function InviteForm({ close }: { close: () => void }) {
  const { t } = useTranslation('settings');
  const { workspace } = useWorkspace();
  const queryClient = useQueryClient();
  const roleLabelId = useId();
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', role: 'editor' },
  });
  const { errors, isSubmitting } = form.formState;

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await api(apiRoutes.workspaces.createInvitation, {
        params: { workspaceId: workspace.id },
        body: values,
      });
      await queryClient.invalidateQueries({ queryKey: workspaceKeys.invitations(workspace.id) });
      toast.success(t('invite.sent', { email: values.email }));
      close();
    } catch (err) {
      form.setError('root', { message: errorMessage(err) });
    }
  });

  return (
    <form onSubmit={(e) => void onSubmit(e)} noValidate className="flex flex-col gap-4">
      <FormField
        label={t('invite.email')}
        error={errors.email?.message && t(errors.email.message as 'invite.emailInvalid')}
      >
        {(p) => (
          <Input
            {...p}
            {...form.register('email')}
            type="email"
            autoComplete="off"
            placeholder="name@example.com"
            autoFocus
          />
        )}
      </FormField>
      <div className="flex flex-col gap-1.5">
        <Label id={roleLabelId} asChild>
          <span>{t('invite.role')}</span>
        </Label>
        <Controller
          control={form.control}
          name="role"
          render={({ field }) => (
            <RadioGroup
              aria-labelledby={roleLabelId}
              value={field.value}
              onValueChange={field.onChange}
            >
              {AssignableRole.options.map((role) => (
                <RadioCard
                  key={role}
                  value={role}
                  label={t(`roles.${role}`)}
                  description={t(`roles.${role}About`)}
                />
              ))}
            </RadioGroup>
          )}
        />
      </div>
      <FormError>{errors.root?.message}</FormError>
      <DialogFooter>
        <Button onClick={close} disabled={isSubmitting}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" variant="primary" loading={isSubmitting}>
          {t('invite.send')}
        </Button>
      </DialogFooter>
    </form>
  );
}
