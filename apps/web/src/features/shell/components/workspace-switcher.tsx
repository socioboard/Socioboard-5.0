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
  Tooltip,
} from '@socioboard/ui';
import { useNavigate } from '@tanstack/react-router';
import { ChevronsUpDown, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { Membership } from '../../../lib/workspace';

/** The Socioboard mark and the current workspace; opens the list of mine and "Create workspace". */
export function WorkspaceSwitcher({
  me,
  current,
  compact = false,
}: {
  me: Me;
  current: Membership['workspace'];
  /** Icon only (collapsed sidebar). */
  compact?: boolean;
}) {
  const { t } = useTranslation('shell');
  const navigate = useNavigate();
  return (
    <DropdownMenu>
      <Tooltip content={current.name} side="right" disabled={!compact}>
        <DropdownMenuTrigger
          aria-label={`${t('switcher.label')}: ${current.name}`}
          className={cn(
            'text-ink hover:bg-chip flex h-10 w-full cursor-pointer items-center gap-2.5 rounded-control px-1.5 text-left',
            compact && 'justify-center px-0',
          )}
        >
          <img src="/sb-mark.svg" alt="" width={21} height={24} className="shrink-0" />
          {!compact && (
            <>
              <span className="min-w-0 flex-1 truncate text-sm font-semibold">{current.name}</span>
              <ChevronsUpDown className="text-ink-3 size-3.5 shrink-0" aria-hidden="true" />
            </>
          )}
        </DropdownMenuTrigger>
      </Tooltip>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>{t('switcher.heading')}</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={current.slug}
          onValueChange={(slug) => {
            void navigate({ to: '/w/$slug', params: { slug } });
          }}
        >
          {me.memberships.map(({ workspace, role }) => (
            <DropdownMenuRadioItem key={workspace.id} value={workspace.slug}>
              <Avatar name={workspace.name} src={workspace.logoUrl} size="sm" decorative />
              <span className="min-w-0 flex-1 truncate">{workspace.name}</span>
              <span className="text-ink-3 text-xs">{t(`roles.${role}`)}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            void navigate({ to: '/onboarding' });
          }}
        >
          <Plus aria-hidden="true" />
          {t('switcher.create')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
