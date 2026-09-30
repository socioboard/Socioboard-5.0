import { Button, cn, Spinner, Swap } from '@socioboard/ui';
import { CircleAlert, CircleCheck, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { formatTime } from '../../../lib/format';
import { errorMessage } from '../../../lib/i18n';
import type { SaveState } from '../use-save';

/**
 * The composer's actions (docs/frontend/areas/composer.md, "Actions"): where the draft stands on
 * the left (saving, saved at…, unsaved changes, or why it didn't save), Save draft and Publish now
 * on the right. Publish is only offered to people who can publish, and says why it's unavailable.
 */
export function ComposerFooter({
  state,
  dirty,
  saved,
  onSave,
  onPublish,
  publishing,
  canPublish,
  reviewRequired,
  blocked,
  noAccounts,
}: {
  state: SaveState;
  dirty: boolean;
  /** The post exists on the server (so "all changes saved" can be said). */
  saved: boolean;
  onSave: () => void;
  onPublish: () => void;
  publishing: boolean;
  canPublish: boolean;
  reviewRequired: boolean;
  /** Networks with a problem to fix. */
  blocked: number;
  noAccounts: boolean;
}) {
  const { t } = useTranslation('composer');
  const offerPublish = canPublish && !reviewRequired;
  const statusKey =
    state.kind === 'saving' || state.kind === 'error'
      ? state.kind
      : dirty
        ? 'dirty'
        : state.kind === 'saved'
          ? `saved-${String(state.at.getTime())}`
          : saved
            ? 'all'
            : 'none';
  const publishBlocked = noAccounts || blocked > 0;
  const why = !canPublish
    ? t('footer.cantPublish')
    : reviewRequired
      ? t('footer.reviewRequired')
      : noAccounts
        ? t('footer.chooseAccounts')
        : blocked > 0
          ? t('footer.fixFirst', { count: blocked })
          : null;

  return (
    <div className="glass-float rounded-pane flex flex-wrap items-center gap-x-4 gap-y-2 p-3 sm:px-5">
      <div
        className={cn(
          'relative flex min-w-0 flex-1 text-[13px] transition-colors duration-300',
          state.kind === 'error' ? 'text-danger' : 'text-ink-3',
        )}
        role="status"
      >
        {/* Where the draft stands changes in place: the old words lift away as the new arrive. */}
        <Swap id={statusKey} className="flex min-w-0 items-center gap-1.5">
          {state.kind === 'saving' ? (
            <>
              <Spinner className="size-3.5" />
              {t('footer.saving')}
            </>
          ) : state.kind === 'error' ? (
            <>
              <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
              <span>
                {t('footer.saveFailed')} {errorMessage(state.error)}
              </span>
            </>
          ) : dirty ? (
            t('footer.unsaved')
          ) : state.kind === 'saved' ? (
            <>
              <CircleCheck className="text-success size-4" aria-hidden="true" />
              {t('footer.savedAt', { time: formatTime(state.at.toISOString()) })}
            </>
          ) : saved ? (
            t('footer.allSaved')
          ) : null}
        </Swap>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2">
        {why && <span className="text-ink-3 text-xs">{why}</span>}
        <Button onClick={onSave} disabled={!dirty && state.kind !== 'error'}>
          {state.kind === 'error' ? t('footer.retry') : t('footer.saveDraft')}
        </Button>
        {offerPublish && (
          <Button
            variant="primary"
            className="group"
            onClick={onPublish}
            disabled={publishBlocked || publishing}
            aria-busy={publishing || undefined}
          >
            {publishing ? (
              <Spinner className="size-4" />
            ) : (
              <Send
                aria-hidden="true"
                className="transition-transform duration-300 ease-out-soft group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            )}
            {publishing ? t('footer.publishing') : t('footer.publishNow')}
          </Button>
        )}
      </div>
    </div>
  );
}
