import { Button, cn, Spinner, Swap } from '@socioboard/ui';
import {
  CalendarClock,
  CircleAlert,
  CircleCheck,
  ClipboardCheck,
  ListPlus,
  Repeat,
  Send,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { formatTime } from '../../../lib/format';
import { errorMessage } from '../../../lib/i18n';
import type { Acting, SaveState } from '../use-save';

/** Where the post stands: not yet set to go out, due at a time, or repeating. */
export type ComposerMode = 'draft' | 'scheduled' | 'repeating';

/**
 * The composer's actions (docs/frontend/areas/composer.md, "Actions"): where the draft stands on
 * the left (saving, saved at…, unsaved changes, or why it didn't save); on the right Save, then
 * the ways to send it: Add to queue, Schedule and Publish now. Those are only offered to people
 * who can publish, and say why they're unavailable. A post that's already scheduled or repeats
 * keeps its timing: saving is the main action, and the timing can be changed. A post that needs
 * review offers "Submit for review" instead (P4-F1), and says so while it waits.
 */
export function ComposerFooter({
  state,
  dirty,
  saved,
  mode,
  acting,
  onSave,
  onPublish,
  onSchedule,
  onQueue,
  canPublish,
  reviewRequired,
  blocked,
  noAccounts,
  queue,
  onSubmit,
  inReview = false,
}: {
  state: SaveState;
  dirty: boolean;
  /** The post exists on the server (so "all changes saved" can be said). */
  saved: boolean;
  mode: ComposerMode;
  acting: Acting;
  onSave: () => void;
  onPublish: () => void;
  /** Opens the schedule dialog. */
  onSchedule: () => void;
  onQueue: () => void;
  canPublish: boolean;
  reviewRequired: boolean;
  /** Networks with a problem to fix. */
  blocked: number;
  noAccounts: boolean;
  /** Add to queue: offered once a chosen account has posting times; `why` when it can't be used. */
  queue: { offered: boolean; why: string | null };
  /** Set when the post needs review and its author can send it: "Submit for review". */
  onSubmit?: (() => void) | undefined;
  /** The post is waiting for review. */
  inReview?: boolean;
}) {
  const { t } = useTranslation('composer');
  const offerSend = canPublish && !reviewRequired;
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
  const sendBlocked = noAccounts || blocked > 0;
  const busy = acting !== null;
  const toReview = onSubmit !== undefined;
  const why = inReview
    ? t('footer.waitingReview')
    : toReview
      ? noAccounts
        ? t('footer.chooseAccountsReview')
        : blocked > 0
          ? t('footer.fixFirstReview', { count: blocked })
          : null
      : !canPublish
        ? t('footer.cantPublish')
        : reviewRequired
          ? t('footer.reviewRequired')
          : noAccounts
            ? t('footer.chooseAccounts')
            : blocked > 0
              ? t('footer.fixFirst', { count: blocked })
              : mode === 'draft' && queue.offered
                ? queue.why
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
        <Button
          // Once the post has its time, saving is what's left to do here.
          variant={mode === 'draft' || toReview ? 'secondary' : 'primary'}
          onClick={onSave}
          disabled={(!dirty && state.kind !== 'error') || busy}
        >
          {state.kind === 'error'
            ? t('footer.retry')
            : mode === 'draft'
              ? t('footer.saveDraft')
              : t('footer.saveChanges')}
        </Button>
        {toReview && (
          <Button
            variant="primary"
            onClick={onSubmit}
            disabled={sendBlocked || busy}
            loading={acting === 'submit'}
          >
            <ClipboardCheck aria-hidden="true" />
            {t('footer.submit')}
          </Button>
        )}
        {offerSend && mode === 'draft' && queue.offered && (
          <Button
            onClick={onQueue}
            disabled={sendBlocked || queue.why !== null || busy}
            loading={acting === 'queue'}
          >
            <ListPlus aria-hidden="true" />
            {t('footer.addToQueue')}
          </Button>
        )}
        {offerSend && (
          <Button
            onClick={onSchedule}
            disabled={sendBlocked || busy}
            loading={acting === 'schedule' || acting === 'repeat'}
          >
            {mode === 'repeating' ? (
              <Repeat aria-hidden="true" />
            ) : (
              <CalendarClock aria-hidden="true" />
            )}
            {t(`footer.schedule.${mode}`)}
          </Button>
        )}
        {offerSend && mode !== 'repeating' && (
          <Button
            variant={mode === 'draft' ? 'primary' : 'secondary'}
            className="group"
            onClick={onPublish}
            disabled={sendBlocked || busy}
            aria-busy={acting === 'publish' || undefined}
          >
            {acting === 'publish' ? (
              <Spinner className="size-4" />
            ) : (
              <Send
                aria-hidden="true"
                className="transition-transform duration-300 ease-out-soft group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            )}
            {acting === 'publish' ? t('footer.publishing') : t('footer.publishNow')}
          </Button>
        )}
      </div>
    </div>
  );
}
