import type { Me } from '@socioboard/contracts';
import {
  Avatar,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  switchTheme,
  Tooltip,
  useTheme,
  type ThemePreference,
} from '@socioboard/ui';
import { LogOut, Moon, ShieldCheck, Sun, UserRound } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import type { Membership } from '../../../lib/workspace';
import { useSignOut } from '../../auth';

const THEMES: ThemePreference[] = ['light', 'dark', 'system'];

/**
 * Who is signed in and in what role, opening a menu with their account pages, the theme and sign
 * out. Notification settings join with P2-F4.
 */
export function UserMenu({
  me,
  role,
  compact = false,
  side = 'top',
}: {
  me: Me;
  role: Membership['role'];
  compact?: boolean;
  side?: 'top' | 'right' | 'bottom';
}) {
  const { t } = useTranslation(['shell', 'common']);
  const { preference, setPreference } = useTheme();
  const signOut = useSignOut();
  const navigate = useNavigate();
  return (
    <DropdownMenu>
      <Tooltip content={me.user.name} side="right" disabled={!compact}>
        <DropdownMenuTrigger
          aria-label={t('user.menu')}
          className={cn(
            'hover:bg-chip flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 rounded-control p-1.5 text-left',
            compact && 'flex-none justify-center',
          )}
        >
          <Avatar name={me.user.name} src={me.user.avatarUrl} size="sm" decorative />
          {!compact && (
            <span className="flex min-w-0 flex-col">
              <span className="text-ink truncate text-[13px] font-semibold">{me.user.name}</span>
              <span className="text-ink-3 text-xs">{t(`roles.${role}`)}</span>
            </span>
          )}
        </DropdownMenuTrigger>
      </Tooltip>
      <DropdownMenuContent side={side} align="start" className="w-64">
        <DropdownMenuLabel className="flex flex-col gap-0.5 pb-2">
          <span className="text-ink text-sm">{me.user.name}</span>
          <span className="truncate font-normal">{me.user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            void navigate({ to: '/me/profile' });
          }}
        >
          <UserRound aria-hidden="true" />
          {t('user.profile')}
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            void navigate({ to: '/me/security' });
          }}
        >
          <ShieldCheck aria-hidden="true" />
          {t('user.security')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>{t('common:theme.label')}</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={preference}
          onValueChange={(value) => {
            setPreference(value as ThemePreference);
          }}
        >
          {THEMES.map((theme) => (
            <DropdownMenuRadioItem key={theme} value={theme}>
              {t(`common:theme.${theme}`)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            void signOut();
          }}
        >
          <LogOut aria-hidden="true" />
          {t('user.signOut')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** One click between light and dark (the menu also offers "system"). */
export function ThemeToggle() {
  const { t } = useTranslation(['shell', 'common']);
  const { resolved, setPreference } = useTheme();
  const next = resolved === 'dark' ? 'light' : 'dark';
  const label = t('user.toggleTheme', { theme: t(`common:theme.${next}`).toLowerCase() });
  return (
    <Tooltip content={label}>
      <button
        type="button"
        aria-label={label}
        onClick={(event) => {
          // The new theme spreads out from the toggle.
          const box = event.currentTarget.getBoundingClientRect();
          switchTheme(next, setPreference, {
            x: box.left + box.width / 2,
            y: box.top + box.height / 2,
          });
        }}
        className="text-ink-2 hover:bg-chip hover:text-ink inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-[background-color,color,transform] duration-150 active:scale-90"
      >
        {/* The icon turns as it changes (sun ↔ moon). */}
        <span
          key={resolved}
          className="animate-[sb-scale-in_0.4s_var(--ease-spring)_both] motion-reduce:animate-none"
        >
          {resolved === 'dark' ? (
            <Sun className="size-4" aria-hidden="true" />
          ) : (
            <Moon className="size-4" aria-hidden="true" />
          )}
        </span>
      </button>
    </Tooltip>
  );
}
