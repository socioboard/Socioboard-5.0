import { cn, FormField, Input } from '@socioboard/ui';
import { Eye, EyeOff } from 'lucide-react';
import { useState, type ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';

import { passwordStrength } from '../password';

interface PasswordFieldProps extends Omit<ComponentProps<'input'>, 'type' | 'value'> {
  label: string;
  error?: string | undefined;
  hint?: string;
  /** Show the strength meter (new passwords only). */
  showStrength?: boolean;
  value: string;
}

const barColor = { weak: 'bg-danger', fair: 'bg-warning', strong: 'bg-success' } as const;
const barLevel = { weak: 0, fair: 1, strong: 2 } as const;

export function PasswordField({
  label,
  error,
  hint,
  showStrength = false,
  value,
  ...input
}: PasswordFieldProps) {
  const { t } = useTranslation('auth');
  const [visible, setVisible] = useState(false);
  const strength = passwordStrength(value);
  return (
    <FormField label={label} error={error} {...(hint ? { hint } : {})}>
      {(p) => (
        <div className="flex flex-col gap-2">
          <div className="relative">
            <Input
              {...p}
              {...input}
              value={value}
              type={visible ? 'text' : 'password'}
              className="pr-11"
            />
            <button
              type="button"
              onClick={() => {
                setVisible((shown) => !shown);
              }}
              aria-label={visible ? t('fields.hidePassword') : t('fields.showPassword')}
              aria-pressed={visible}
              className="text-ink-3 hover:text-ink absolute top-1/2 right-1.5 inline-flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg"
            >
              {visible ? (
                <EyeOff className="size-4" aria-hidden="true" />
              ) : (
                <Eye className="size-4" aria-hidden="true" />
              )}
            </button>
          </div>
          {showStrength && value.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex flex-1 gap-1" aria-hidden="true">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className={cn(
                      'h-1 flex-1 rounded-full transition-colors',
                      i <= barLevel[strength] ? barColor[strength] : 'bg-hair-strong',
                    )}
                  />
                ))}
              </div>
              <span className="text-ink-3 text-xs" aria-live="polite">
                {t('strength.label', { level: t(`strength.${strength}`) })}
              </span>
            </div>
          )}
        </div>
      )}
    </FormField>
  );
}
