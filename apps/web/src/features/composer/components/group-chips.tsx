import type { AccountGroup, SocialAccount } from '@socioboard/contracts';
import { cn, Tooltip } from '@socioboard/ui';
import { Check, Layers } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * The workspace's account groups above the account picker (P3-F3): one click adds a group's
 * accounts that can post; when all of them are chosen, a click takes them off again. Accounts
 * the group holds that can't post (reconnect, paused, disconnected) are skipped.
 */
export function GroupChips({
  groups,
  accounts,
  value,
  onChange,
}: {
  groups: AccountGroup[];
  accounts: SocialAccount[];
  value: readonly string[];
  onChange: (accountIds: string[]) => void;
}) {
  const { t } = useTranslation('composer');
  if (groups.length === 0) return null;
  return (
    <div
      role="group"
      aria-label={t('groups.label')}
      className="flex flex-wrap items-center gap-1.5"
    >
      {groups.map((g) => {
        const postable = g.accountIds.filter((id) =>
          accounts.some((a) => a.id === id && a.status === 'active'),
        );
        const on = postable.length > 0 && postable.every((id) => value.includes(id));
        const chip = (
          <button
            type="button"
            aria-pressed={on}
            aria-label={t('groups.chip', { name: g.name, count: postable.length })}
            aria-disabled={postable.length === 0 ? true : undefined}
            onClick={() => {
              if (postable.length === 0) return;
              onChange(
                on
                  ? value.filter((id) => !postable.includes(id))
                  : [...value, ...postable.filter((id) => !value.includes(id))],
              );
            }}
            className={cn(
              'inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-full px-2.5 text-xs font-medium',
              'ease-out-soft transition-[background-color,color,border-color,transform] duration-200',
              'active:scale-95 motion-reduce:active:scale-100',
              'focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-2',
              'aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:active:scale-100',
              on
                ? 'bg-ring text-canvas border border-transparent'
                : 'glass-chip text-ink-2 hover:text-ink hover:border-hair-strong',
            )}
          >
            {on ? (
              <Check aria-hidden="true" className="size-3.5" />
            ) : (
              <Layers aria-hidden="true" className="size-3.5" />
            )}
            {g.name}
            <span className="opacity-60">{postable.length}</span>
          </button>
        );
        return (
          <Tooltip key={g.id} content={t('groups.noneCanPost')} disabled={postable.length > 0}>
            {chip}
          </Tooltip>
        );
      })}
    </div>
  );
}
