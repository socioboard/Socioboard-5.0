import { Check } from 'lucide-react';
import {
  Checkbox as CheckboxPrimitive,
  RadioGroup as RadioPrimitive,
  Switch as SwitchPrimitive,
} from 'radix-ui';
import { useId, type ComponentProps, type ReactNode } from 'react';

import { cn } from '../cn';

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

/** A checkbox with its label to the right; the whole row is clickable. */
export function Checkbox({
  label,
  description,
  className,
  id,
  ...props
}: Omit<ComponentProps<typeof CheckboxPrimitive.Root>, 'children'> & {
  label: ReactNode;
  description?: ReactNode;
}) {
  const autoId = useId();
  const boxId = id ?? autoId;
  const descriptionId = `${boxId}-description`;
  return (
    <div className={cn('flex items-start gap-2.5', className)}>
      <CheckboxPrimitive.Root
        id={boxId}
        {...(description ? { 'aria-describedby': descriptionId } : {})}
        className={cn(
          'glass-chip mt-0.5 flex size-[18px] shrink-0 cursor-pointer items-center justify-center rounded-[5px]',
          'transition-[background-color,border-color,transform] duration-200 ease-out-soft not-disabled:active:scale-90 motion-reduce:transition-none',
          'data-[state=checked]:border-ring data-[state=checked]:bg-ring data-[state=checked]:text-canvas',
          'disabled:cursor-not-allowed disabled:opacity-50',
          focusRing,
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator className="data-[state=checked]:animate-scale-in motion-reduce:animate-none">
          <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      <div className="flex flex-col gap-0.5">
        <label htmlFor={boxId} className="text-ink cursor-pointer text-sm leading-snug">
          {label}
        </label>
        {description && (
          <p id={descriptionId} className="text-ink-3 text-xs leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

/** An on/off setting that takes effect at once (use a Checkbox inside forms saved by a button). */
export function Switch({ className, ...props }: ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        'glass-chip group relative inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-200',
        'data-[state=checked]:border-ring data-[state=checked]:bg-ring',
        'disabled:cursor-not-allowed disabled:opacity-50',
        focusRing,
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          'block h-[18px] w-[18px] rounded-full bg-white shadow-[0_1px_3px_rgb(0_0_0/0.25)] transition-[transform,width] duration-300 ease-spring',
          'group-active:w-[22px] data-[state=checked]:translate-x-4 data-[state=checked]:group-active:translate-x-3 motion-reduce:transition-none',
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export const RadioGroup = function RadioGroup({
  className,
  ...props
}: ComponentProps<typeof RadioPrimitive.Root>) {
  return <RadioPrimitive.Root className={cn('flex flex-col gap-1.5', className)} {...props} />;
};

/**
 * One choice as a selectable card: title and a one-line explanation, e.g. a role and what it can
 * do. Arrow keys move between choices (Radix radio group).
 */
export function RadioCard({
  value,
  label,
  description,
  className,
  ...props
}: Omit<ComponentProps<typeof RadioPrimitive.Item>, 'children'> & {
  label: ReactNode;
  description?: ReactNode;
}) {
  const id = useId();
  return (
    <RadioPrimitive.Item
      value={value}
      aria-labelledby={`${id}-label`}
      {...(description ? { 'aria-describedby': `${id}-description` } : {})}
      className={cn(
        'glass-chip rounded-control flex w-full cursor-pointer items-start gap-3 p-3 text-left',
        'transition-[box-shadow,border-color,transform] duration-200 ease-out-soft not-disabled:active:scale-[0.99]',
        'hover:border-hair-strong data-[state=checked]:ring-selected',
        'disabled:cursor-not-allowed disabled:opacity-50',
        focusRing,
        className,
      )}
      {...props}
    >
      <span className="border-hair-strong mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border">
        <RadioPrimitive.Indicator className="bg-ring data-[state=checked]:animate-scale-in size-2 rounded-full motion-reduce:animate-none" />
      </span>
      <span className="flex flex-col gap-0.5">
        <span id={`${id}-label`} className="text-ink text-sm font-semibold">
          {label}
        </span>
        {description && (
          <span id={`${id}-description`} className="text-ink-3 text-xs leading-relaxed">
            {description}
          </span>
        )}
      </span>
    </RadioPrimitive.Item>
  );
}
