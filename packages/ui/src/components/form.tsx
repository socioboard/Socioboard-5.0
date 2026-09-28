import { Label as LabelPrimitive } from 'radix-ui';
import { useId, type ComponentProps, type ReactNode } from 'react';

import { cn } from '../cn';

const fieldBase = [
  'glass-chip w-full rounded-control px-3 text-sm text-ink',
  'placeholder:text-ink-3 transition-[border-color,box-shadow] duration-150',
  'hover:border-hair-strong focus-visible:border-ring focus-visible:outline-none',
  'focus-visible:shadow-[inset_0_1px_0_var(--sb-spec),0_0_0_3px_var(--sb-ring-glow)]',
  'aria-invalid:border-danger aria-invalid:focus-visible:shadow-[0_0_0_3px_var(--sb-danger-tint)]',
  'disabled:cursor-not-allowed disabled:opacity-60',
];

export function Label({ className, ...props }: ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      className={cn('text-ink-2 text-[13px] font-medium select-none', className)}
      {...props}
    />
  );
}

export function Input({ className, type = 'text', ...props }: ComponentProps<'input'>) {
  return <input type={type} className={cn(fieldBase, 'h-10', className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return (
    <textarea
      className={cn(fieldBase, 'min-h-24 resize-y py-2.5 leading-relaxed', className)}
      {...props}
    />
  );
}

/** What FormField hands to its control, so label, hint and error are announced with it. */
export interface FieldControlProps {
  id: string;
  'aria-describedby'?: string;
  'aria-invalid'?: true;
  'aria-required'?: true;
}

export interface FormFieldProps {
  label: ReactNode;
  /** Help shown under the field while there is no error. */
  hint?: ReactNode;
  /** Shown instead of the hint, and marks the field invalid. */
  error?: ReactNode;
  required?: boolean;
  className?: string;
  children: (control: FieldControlProps) => ReactNode;
}

/**
 * Label, control, and hint or error, wired for screen readers:
 *   <FormField label="Email" error={errors.email}>{(p) => <Input {...p} type="email" />}</FormField>
 */
export function FormField({ label, hint, error, required, className, children }: FormFieldProps) {
  const id = useId();
  const noteId = `${id}-note`;
  const note = error ?? hint;
  const control: FieldControlProps = {
    id,
    ...(note ? { 'aria-describedby': noteId } : {}),
    ...(error ? { 'aria-invalid': true } : {}),
    ...(required ? { 'aria-required': true } : {}),
  };
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label htmlFor={id}>
        {label}
        {required && (
          <span className="text-ink-3" aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </Label>
      {children(control)}
      {note && (
        <p
          id={noteId}
          className={cn('text-xs leading-relaxed', error ? 'text-danger' : 'text-ink-3')}
          {...(error ? { role: 'alert' } : {})}
        >
          {note}
        </p>
      )}
    </div>
  );
}
