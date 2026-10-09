import { textLength } from '@socioboard/contracts';
import { CharacterCounter, Combobox, FormField, Input } from '@socioboard/ui';
import { useTranslation } from 'react-i18next';

import { PerAccount } from './per-account';
import type { OptionsPanelProps, PanelAccount } from './types';

/**
 * Pinterest's title limit, for the counter only. The adapter's `validate` has the final say
 * (PINTEREST_MAX_TITLE in packages/providers, which the browser can't import).
 */
const MAX_TITLE = 100;

/**
 * Pinterest (P3-B4): the board each account pins to, and the pin's title. The frame (panels.tsx)
 * has already asked each account for its boards (`optionChoices`, needsChoices) and handles
 * waiting and failures; this draws the fields.
 */
export function PinterestPanel({ accounts, options, set }: OptionsPanelProps) {
  const { t } = useTranslation('composer');
  const title = options.pinterest?.title ?? '';
  return (
    <div className="flex flex-col gap-4">
      <PerAccount accounts={accounts} label={t('pinterest.board')}>
        {(account, label) => <BoardField account={account} label={label} />}
      </PerAccount>
      <FormField label={t('pinterest.title')} hint={t('pinterest.titleHint')}>
        {(p) => (
          <div className="flex flex-col gap-1">
            <Input
              {...p}
              value={title}
              onChange={(e) => {
                // An empty title is no title: Pinterest's pin then has none.
                set('pinterest', { title: e.target.value === '' ? undefined : e.target.value });
              }}
            />
            <CharacterCounter
              count={textLength(title)}
              max={MAX_TITLE}
              network="pinterest"
              className="self-end"
            />
          </div>
        )}
      </FormField>
    </div>
  );
}

/** One account's board: a searchable list of its boards, or what to do when it has none. */
function BoardField({ account, label }: { account: PanelAccount; label: string }) {
  const { t } = useTranslation('composer');
  const boards = account.choices?.network === 'pinterest' ? account.choices.boards : [];
  if (boards.length === 0) {
    return (
      <p className="text-ink-2 text-[13px]">
        {t('pinterest.noBoards', { account: account.account.displayName })}
      </p>
    );
  }
  return (
    <FormField label={label}>
      {(p) => (
        <Combobox
          {...p}
          options={boards.map((b) => ({
            value: b.id,
            label: b.name,
            ...(b.privacy === 'protected' ? { hint: t('pinterest.protected') } : {}),
          }))}
          value={account.own.pinterest?.boardId}
          onValueChange={(boardId) => {
            // Each account pins to its own board (the draft keeps it per account).
            account.setOwn('pinterest', { boardId });
          }}
          placeholder={t('pinterest.boardPlaceholder')}
          searchLabel={t('pinterest.boardSearch')}
          emptyText={t('pinterest.boardNoMatch')}
        />
      )}
    </FormField>
  );
}
