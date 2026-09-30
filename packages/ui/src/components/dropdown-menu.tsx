import { Check } from 'lucide-react';
import { DropdownMenu as MenuPrimitive } from 'radix-ui';
import type { ComponentProps, ReactNode } from 'react';

import { cn } from '../cn';

export const DropdownMenu = MenuPrimitive.Root;
export const DropdownMenuTrigger = MenuPrimitive.Trigger;
export const DropdownMenuGroup = MenuPrimitive.Group;
export const DropdownMenuRadioGroup = MenuPrimitive.RadioGroup;

/** A menu in a glass popover: arrow keys move, typeahead jumps, Escape closes and returns focus. */
export function DropdownMenuContent({
  className,
  sideOffset = 6,
  ...props
}: ComponentProps<typeof MenuPrimitive.Content>) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          'glass-float z-50 min-w-56 overflow-hidden rounded-[14px] p-1',
          'max-h-(--radix-dropdown-menu-content-available-height) overflow-y-auto',
          'origin-(--radix-dropdown-menu-content-transform-origin) data-[state=open]:animate-pop-in data-[state=closed]:animate-pop-out',
          className,
        )}
        {...props}
      />
    </MenuPrimitive.Portal>
  );
}

const itemBase = [
  'text-ink relative flex min-h-9 cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-sm outline-none select-none',
  'data-[highlighted]:bg-chip data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
  '[&>svg]:text-ink-3 [&>svg]:size-4 [&>svg]:shrink-0',
];

export interface DropdownMenuItemProps extends ComponentProps<typeof MenuPrimitive.Item> {
  /** Keyboard shortcut or short note shown on the right. */
  hint?: ReactNode;
  tone?: 'default' | 'danger';
}

export function DropdownMenuItem({
  className,
  children,
  hint,
  tone = 'default',
  ...props
}: DropdownMenuItemProps) {
  return (
    <MenuPrimitive.Item
      className={cn(itemBase, tone === 'danger' && 'text-danger [&>svg]:text-danger', className)}
      {...props}
    >
      {children}
      {hint && <span className="text-ink-3 ml-auto pl-4 text-xs">{hint}</span>}
    </MenuPrimitive.Item>
  );
}

/** One choice of a DropdownMenuRadioGroup (theme, sort order); the chosen one shows a check. */
export function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: ComponentProps<typeof MenuPrimitive.RadioItem>) {
  return (
    <MenuPrimitive.RadioItem className={cn(itemBase, 'pr-8', className)} {...props}>
      {children}
      <MenuPrimitive.ItemIndicator className="text-ring absolute right-2.5">
        <Check className="size-4" aria-hidden="true" />
      </MenuPrimitive.ItemIndicator>
    </MenuPrimitive.RadioItem>
  );
}

export function DropdownMenuLabel({
  className,
  ...props
}: ComponentProps<typeof MenuPrimitive.Label>) {
  return (
    <MenuPrimitive.Label
      className={cn('text-ink-3 px-2.5 pt-2 pb-1 text-xs font-semibold', className)}
      {...props}
    />
  );
}

export function DropdownMenuSeparator({
  className,
  ...props
}: ComponentProps<typeof MenuPrimitive.Separator>) {
  return <MenuPrimitive.Separator className={cn('bg-hair my-1 h-px', className)} {...props} />;
}
