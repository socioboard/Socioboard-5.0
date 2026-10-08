import {
  SCHEDULE_MIN_LEAD_MINUTES,
  textLength,
  type Network,
  type NetworkId,
  type PostDetails,
  type RecurrenceRuleInput,
  type SocialAccount,
} from '@socioboard/contracts';
import {
  AccountPicker,
  Banner,
  ConfirmDialog,
  Button,
  cn,
  CharacterCounter,
  EmptyState,
  FormField,
  Input,
  networkName,
  PageHeader,
  motion,
  Skeleton,
  springs,
  Textarea,
  useChangeMotion,
  toast,
} from '@socioboard/ui';
import { useQueries, useQuery } from '@tanstack/react-query';
import { Link, useBlocker, useNavigate } from '@tanstack/react-router';
import { MessageSquarePlus, RotateCcw, Trash2 } from 'lucide-react';
import { useEffect, useId, useReducer, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { ApiError } from '../../../lib/api';
import { errorMessage } from '../../../lib/i18n';
import { useCan } from '../../../lib/permissions';
import { useWorkspace } from '../../../lib/workspace';
import { useWorkspaceTime } from '../../../lib/use-workspace-time';
import { WorkspaceTime } from '../../../lib/workspace-time';
import {
  accountGroupsQuery,
  accountsQuery,
  networksQuery,
  queueSlotsQuery,
  toPickerAccount,
} from '../../accounts';
import { workspaceQuery } from '../../settings';
import { LabelPicker, postQuery, useRepeatWording } from '../../posts';
import {
  contentFor,
  draftReducer,
  emptyDraft,
  fromPost,
  selectedNetworks,
  toPostBody,
  type Draft,
} from '../draft';
import { MediaStrip } from './media-strip';
import { useAttachedMedia } from '../media';
import { useSavePost } from '../use-save';
import { useValidation } from '../use-validation';
import { isWebAddress, type ComposerIssue } from '../validation';
import { useIssueWording } from '../issue-wording';
import { scheduledAt } from '../schedule';
import { OptionsSection } from '../options/panels';
import { ComposerFooter, type ComposerMode } from './composer-footer';
import { GroupChips } from './group-chips';
import { IssuesPanel } from './issues-panel';
import { NetworkTabs } from './network-tabs';
import { PreviewPanel } from './preview-panel';
import { ScheduleDialog } from './schedule-dialog';

/** Targets in these states make a post history: it can't be edited any more. */
const LOCKED = new Set(['publishing', 'published']);

/**
 * `/w/:slug/compose` and `/w/:slug/compose/:postId` (docs/frontend/areas/composer.md): write
 * once, tailor per network, see it as each network will show it, then save or publish.
 */
export function ComposerPage({
  postId,
  initialAt,
  initialAccount,
}: {
  postId?: string | undefined;
  initialAt?: string | undefined;
  /** A new post starts with this account chosen (a queue slot's "Write a post"). */
  initialAccount?: string | undefined;
}) {
  const { t } = useTranslation('composer');
  const { workspace } = useWorkspace();
  const accounts = useQuery(accountsQuery(workspace.id));
  const networks = useQuery(networksQuery);
  const post = useQuery({
    ...postQuery(workspace.id, postId ?? ''),
    enabled: postId !== undefined,
  });
  const navigate = useNavigate();
  // Which composer is on screen. Saving a new post puts its id in the address; that composer
  // stays (keeping focus and anything typed during the save). Opening another post, or "New post"
  // again, starts a fresh one.
  const [session, setSession] = useState<{
    postId: string | undefined;
    n: number;
    created: string | null;
  }>({ postId, n: 0, created: null });
  // Coming back to "New post" from a post is a fresh start; any other move keeps the count.
  if (session.postId !== postId) {
    setSession({
      postId,
      n: postId === undefined ? session.n + 1 : session.n,
      created: postId === undefined ? null : session.created,
    });
  }
  const mountKey =
    postId === undefined || postId === session.created ? `session-${String(session.n)}` : postId;
  const onCreated = (id: string) => {
    setSession((s) => ({ ...s, created: id }));
    void navigate({
      to: '/w/$slug/compose/{-$postId}',
      params: { slug: workspace.slug, postId: id },
      replace: true,
    });
  };

  const title = postId ? t('editTitle') : t('newTitle');
  let body: ReactNode;
  if (accounts.isPending || networks.isPending || (postId && post.isPending)) {
    body = (
      <div className="flex flex-col gap-5" aria-hidden="true">
        <Skeleton className="rounded-control h-24" />
        <Skeleton className="rounded-control h-72" />
      </div>
    );
  } else if (postId && post.isError && !post.data) {
    // Only when the post never loaded: a failed re-read keeps the composer and what's typed.
    const gone = post.error instanceof ApiError && post.error.status === 404;
    body = (
      <EmptyState
        title={gone ? t('notFound') : t('loadError')}
        action={
          gone ? (
            <Button asChild>
              <Link to="/w/$slug/posts" params={{ slug: workspace.slug }}>
                {t('backToPosts')}
              </Link>
            </Button>
          ) : (
            <Button onClick={() => void post.refetch()}>{t('retry')}</Button>
          )
        }
      />
    );
  } else if (accounts.isError || networks.isError) {
    body = (
      <EmptyState
        title={t('loadError')}
        action={
          <Button
            onClick={() => {
              void accounts.refetch();
              void networks.refetch();
            }}
          >
            {t('retry')}
          </Button>
        }
      />
    );
  } else {
    body = (
      <Composer
        key={mountKey}
        initialAt={initialAt}
        initialAccount={initialAccount}
        post={post.data}
        accounts={accounts.data}
        networks={networks.data}
        onCreated={onCreated}
        onPublished={(id) =>
          void navigate({
            to: '/w/$slug/posts/$postId',
            params: { slug: workspace.slug, postId: id },
            replace: true,
          })
        }
      />
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title={title} />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="stagger-children mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-5 sm:px-6">
          {body}
        </div>
      </div>
    </div>
  );
}

function Composer({
  initialAt,
  initialAccount,
  post,
  accounts,
  networks,
  onCreated,
  onPublished,
}: {
  initialAt?: string | undefined;
  initialAccount?: string | undefined;
  post: PostDetails | undefined;
  accounts: SocialAccount[];
  networks: Network[];
  onCreated: (postId: string) => void;
  onPublished: (postId: string) => void;
}) {
  const { t } = useTranslation('composer');
  const { me, workspace } = useWorkspace();
  const can = useCan();
  const time = useWorkspaceTime();
  const groups = useQuery(accountGroupsQuery(workspace.id));
  const describeRepeat = useRepeatWording();
  // A proposed time from the calendar, unless it has passed (an old link, a tab left open).
  const [preferredAt] = useState(() =>
    initialAt && Date.parse(initialAt) >= Date.now() + SCHEDULE_MIN_LEAD_MINUTES * 60_000
      ? initialAt
      : undefined,
  );
  const [draft, dispatch] = useReducer(draftReducer, post, (p) =>
    p
      ? fromPost(p)
      : {
          ...emptyDraft(),
          // Only an account that can be posted to; anything else is left for the person to pick.
          accountIds: accounts.some((a) => a.id === initialAccount && a.status === 'active')
            ? [initialAccount ?? '']
            : [],
        },
  );
  const [tab, setTab] = useState<NetworkId | null>(null);
  // The preview follows the editor to a network's tab, and can be switched on its own.
  const [previewTab, setPreviewTab] = useState<NetworkId | null>(null);
  // Under 1024 px the editor and the preview take turns (docs: "Edit" / "Preview").
  const [view, setView] = useState<'edit' | 'preview'>('edit');
  // Files uploading, by the tab they were started from ("all" for the shared media).
  const [uploadsByTab, setUploadsByTab] = useState<Record<string, string[]>>({});
  const panelId = useId();

  const networkOf = (id: string) => accounts.find((a) => a.id === id)?.network;
  const selected = selectedNetworks(draft, networkOf);
  // A tab whose network was just deselected falls back to the shared content.
  const active = tab !== null && selected.includes(tab) ? tab : null;
  // Switching a network tab refreshes the panel (the same fields, new content).
  const panelMotion = useChangeMotion(active);
  const customised = new Set(selected.filter((n) => draft.overrides[n] !== undefined));
  const rulesOf = (n: NetworkId) => networks.find((x) => x.id === n);

  const locked = post?.targets.some((x) => LOCKED.has(x.status)) ?? false;
  const mayEdit =
    !post || post.author?.id === me.user.id ? can('posts:create') : can('posts:approve');
  const readOnly = locked || !mayEdit;

  // Every file on the post (shared or a network's own), to name them in issues.
  const allMediaIds = [
    ...new Set([
      ...draft.mediaIds,
      ...Object.values(draft.overrides).flatMap((o) => o.mediaIds ?? []),
    ]),
  ];
  const attached = useAttachedMedia(workspace.id, allMediaIds);
  const validation = useValidation({
    workspaceId: workspace.id,
    draft,
    networkOf,
    selected,
    rulesOf: (n) => rulesOf(n)?.rules,
    enabled: !readOnly,
    mediaState: allMediaIds
      .map(
        (id, i) =>
          `${id}:${attached[i]?.data?.status ?? (attached[i]?.isError ? 'gone' : 'loading')}`,
      )
      .join(','),
  });
  const wording = useIssueWording({
    account: (id) => accounts.find((a) => a.id === id)?.displayName,
    file: (id) => attached[allMediaIds.indexOf(id)]?.data?.name,
  });
  // The panel appears once there's something to check, and then stays (so "Choose at least one
  // account" can still be read after every account is taken off).
  const hasContent =
    draft.accountIds.length > 0 || draft.text.trim() !== '' || draft.mediaIds.length > 0;
  const [touched, setTouched] = useState(hasContent);
  if (hasContent && !touched) setTouched(true);

  // Where the post stands (as the server has it): repeating, due at a time, or neither yet.
  const recurrence = post?.recurrence?.active ? post.recurrence : null;
  const due = scheduledAt(post);
  const mode: ComposerMode = recurrence
    ? 'repeating'
    : post?.status === 'scheduled' && due
      ? 'scheduled'
      : 'draft';
  const saving = useSavePost({
    workspaceId: workspace.id,
    initialPost: post,
    body: toPostBody(draft, networkOf),
    hasContent,
    enabled: !readOnly,
    // What's saved on a scheduled or repeating post goes out: it's saved when the person says so.
    autosave: mode === 'draft',
    onCreated,
  });
  // Review (P4-F1): the server says whether a saved post needs it; a new one needs it when the
  // workspace reviews every post or its author (this person) can't publish.
  const reviewAll = useQuery(workspaceQuery(workspace.id)).data?.requireReviewForAll ?? false;
  const review = post?.review;
  const needsReview = review ? review.needed : reviewAll || !can('posts:publish');
  const approved =
    review?.latest?.action === 'approved' &&
    (post?.status === 'approved' || post?.status === 'scheduled');
  const inReviewPost = post?.status === 'in_review' ? post : null;
  const inReview = inReviewPost !== null;
  const approvedBy = review?.latest?.action === 'approved' ? review.latest.actor?.name : undefined;
  const isAuthor = !post || post.author?.id === me.user.id;
  const reviewRequired = needsReview && !approved;
  const maySend = can('posts:publish') && !reviewRequired && !readOnly;
  const offerSubmit =
    reviewRequired && !inReview && isAuthor && !readOnly && (post?.status ?? 'draft') === 'draft';
  const changesAsked =
    post?.status === 'draft' && review?.latest?.action === 'changes_requested'
      ? review.latest
      : null;
  const [scheduling, setScheduling] = useState(false);
  const [confirmStop, setConfirmStop] = useState(false);

  // Add to queue is offered once a chosen account has posting times; every chosen account needs
  // some for it to work (the server refuses the whole post otherwise).
  const slots = useQueries({
    queries: draft.accountIds.map((id) => ({
      ...queueSlotsQuery(workspace.id, id),
      enabled: maySend && mode === 'draft' && can('calendar:read'),
    })),
  });
  const withoutSlots = draft.accountIds.filter((_, i) => slots[i]?.data?.slots.length === 0);
  const queue = {
    offered: slots.some((q) => (q.data?.slots.length ?? 0) > 0),
    why:
      withoutSlots.length > 0
        ? t('footer.noSlots', {
            count: withoutSlots.length,
            accounts: new Intl.ListFormat(undefined, { type: 'conjunction' }).format(
              withoutSlots.map((id) => accounts.find((a) => a.id === id)?.displayName ?? ''),
            ),
          })
        : null,
  };

  /** A refusal in the person's words; anything else gets the general message. */
  const explain = (err: unknown) => {
    const code = err instanceof ApiError ? err.code : '';
    const words: Record<string, string> = {
      POST_HAS_ERRORS: t('publish.hasErrors'),
      REVIEW_REQUIRED: t('publish.reviewRequired'),
      POST_ALREADY_SENT: t('publish.alreadySent'),
      POST_NOT_EDITABLE: t('publish.notEditable'),
      SCHEDULE_TOO_SOON: t('schedule.errors.tooSoon'),
      SCHEDULE_TOO_FAR: t('schedule.problems.tooFar'),
      NO_QUEUE_SLOTS: t('schedule.errors.noSlots'),
      POST_IS_RECURRING: t('schedule.errors.isRecurring'),
      POST_IS_OCCURRENCE: t('schedule.errors.isOccurrence'),
      POST_IS_SCHEDULED: t('schedule.errors.isScheduled'),
      POST_NOT_SCHEDULED: t('schedule.errors.notScheduled'),
      POST_IN_REVIEW: t('review.errors.inReview'),
      POST_NOT_DRAFT: t('review.errors.notDraft'),
      POST_NOT_IN_REVIEW: t('review.errors.notInReview'),
      NOT_POST_AUTHOR: t('review.errors.notAuthor'),
      RECURRENCE_ENDED: t('schedule.errors.ended'),
      RECURRENCE_NOT_FOUND: t('schedule.errors.notRepeating'),
    };
    toast.error(words[code] ?? errorMessage(err));
  };
  const publish = async () => {
    try {
      const published = await saving.publish();
      if (published) {
        toast.success(t('publish.started', { count: published.targets.length }));
        // How it goes, account by account, is on the post's page.
        onPublished(published.id);
      }
    } catch (err) {
      explain(err);
    }
  };
  const schedule = async (at: Date) => {
    try {
      const scheduled = await saving.schedule(at, { repeating: mode === 'repeating' });
      // A save that failed says so in the footer, behind the dialog.
      setScheduling(false);
      if (!scheduled) return;
      toast.success(
        t('schedule.done', { time: time.format(scheduledAt(scheduled) ?? at, 'long') }),
      );
      onPublished(scheduled.id);
    } catch (err) {
      explain(err);
    }
  };
  const repeat = async (rule: RecurrenceRuleInput) => {
    try {
      const set = await saving.repeat(rule, { scheduled: mode === 'scheduled' });
      setScheduling(false);
      if (!set) return;
      toast.success(
        set.recurrence.nextRunAt
          ? t('schedule.repeating', { time: time.format(set.recurrence.nextRunAt, 'long') })
          : t('schedule.repeatingNoDate'),
      );
      onPublished(set.postId);
    } catch (err) {
      explain(err);
    }
  };
  const addToQueue = async () => {
    try {
      const queued = await saving.addToQueue();
      if (!queued) return;
      const times = new Set(queued.targets.map((x) => x.scheduledAt).filter(Boolean));
      toast.success(
        t('schedule.queued', {
          count: times.size,
          time: time.format(scheduledAt(queued) ?? new Date(), 'long'),
        }),
      );
      onPublished(queued.id);
    } catch (err) {
      explain(err);
    }
  };
  const submit = async () => {
    try {
      if (await saving.submit()) toast.success(t('review.sent'));
    } catch (err) {
      explain(err);
    }
  };
  const withdraw = async () => {
    try {
      if (await saving.withdraw()) toast.success(t('review.withdrawn'));
    } catch (err) {
      explain(err);
    }
  };
  const unschedule = async () => {
    try {
      if (await saving.unschedule()) toast.success(t('schedule.unscheduled'));
    } catch (err) {
      explain(err);
    }
  };
  // Leaving with unsaved changes asks first, in the app and when closing the tab. Moving within
  // this route (a new post getting its id in the address) never asks.
  const blocker = useBlocker({
    shouldBlockFn: ({ current, next }) => saving.dirty && current.routeId !== next.routeId,
    enableBeforeUnload: () => saving.dirty,
    withResolver: true,
  });
  const editorRef = useRef<HTMLDivElement>(null);
  // Jumping to an issue: switch to the tab that holds the field, then focus it once drawn.
  const pendingFocus = useRef<string | null>(null);
  const [focusTick, setFocusTick] = useState(0);
  useEffect(() => {
    const field = pendingFocus.current;
    if (!field) return;
    pendingFocus.current = null;
    const el = editorRef.current?.querySelector<HTMLElement>(`[data-field="${field}"]`);
    const target = el?.matches('input, textarea, button') ? el : el?.querySelector('button');
    target?.focus();
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [focusTick]);
  const goToIssue = (issue: ComposerIssue) => {
    const n = issue.network;
    const own =
      n !== null &&
      ((issue.field === 'text' && contentFor(draft, n).textOverridden) ||
        (issue.field === 'media' && contentFor(draft, n).mediaOverridden) ||
        issue.field === 'options');
    if (issue.field !== 'account') {
      setTab(own ? n : null);
      if (n) setPreviewTab(n);
    }
    setView('edit');
    pendingFocus.current = issue.field ?? 'text';
    setFocusTick((x) => x + 1);
  };
  // The text box is marked invalid when its text breaks a network's rule.
  const textInvalid = validation.issues.some(
    (i) =>
      i.field === 'text' &&
      i.severity === 'error' &&
      (active
        ? i.network === active
        : i.network !== null && !contentFor(draft, i.network).textOverridden),
  );

  const pickerAccounts = accounts.map(toPickerAccount);

  return (
    <>
      {locked && post && (
        <Banner tone="warning">
          {t('locked')}{' '}
          <Link
            to="/w/$slug/posts/$postId"
            params={{ slug: workspace.slug, postId: post.id }}
            className="font-semibold underline underline-offset-2"
          >
            {t('seeDelivery')}
          </Link>
        </Banner>
      )}
      {!locked && !mayEdit && <Banner tone="warning">{t('notYours')}</Banner>}
      {inReviewPost && (
        <Banner
          action={
            isAuthor ? (
              <Button
                size="sm"
                variant="ghost"
                loading={saving.acting === 'withdraw'}
                disabled={saving.acting !== null}
                onClick={() => void withdraw()}
              >
                {t('review.withdraw')}
              </Button>
            ) : can('posts:approve') ? (
              <Link
                to="/w/$slug/approvals"
                params={{ slug: workspace.slug }}
                search={{ post: inReviewPost.id }}
                className="text-ink text-sm font-semibold underline underline-offset-2"
              >
                {t('review.open')}
              </Link>
            ) : null
          }
        >
          {isAuthor ? t('review.waitingMine') : t('review.waiting')}
        </Banner>
      )}
      {changesAsked && (
        <Banner tone="warning">
          {changesAsked.note
            ? t('review.changesNote', {
                name: changesAsked.actor?.name ?? t('review.someone'),
                note: changesAsked.note,
              })
            : t('review.changes', { name: changesAsked.actor?.name ?? t('review.someone') })}
        </Banner>
      )}
      {approved && !readOnly && !can('posts:approve') && (
        <Banner>{t('review.approvedEditing', { name: approvedBy ?? t('review.someone') })}</Banner>
      )}
      {!readOnly && mode === 'draft' && preferredAt && (
        <Banner>{t('calendarTime', { time: time.format(preferredAt, 'long') })}</Banner>
      )}
      {!readOnly && mode === 'scheduled' && due && (
        <Banner
          action={
            maySend && (
              <Button
                size="sm"
                variant="ghost"
                loading={saving.acting === 'unschedule'}
                disabled={saving.acting !== null}
                onClick={() => void unschedule()}
              >
                {t('schedule.unschedule')}
              </Button>
            )
          }
        >
          <WorkspaceTime iso={due} style="long">
            {(at) => t('schedule.scheduledFor', { time: at })}
          </WorkspaceTime>{' '}
          {post?.recurring === 'occurrence' ? t('schedule.occurrence') : t('schedule.savedGoOut')}
        </Banner>
      )}
      {!readOnly && recurrence && (
        <Banner
          action={
            maySend && (
              <Button
                size="sm"
                variant="ghost"
                disabled={saving.acting !== null}
                onClick={() => {
                  setConfirmStop(true);
                }}
              >
                {t('schedule.stop')}
              </Button>
            )
          }
        >
          {t('schedule.repeats', { rule: describeRepeat(recurrence.rule) })}{' '}
          {recurrence.nextRunAt && (
            <>
              <WorkspaceTime iso={recurrence.nextRunAt} style="long">
                {(at) => t('schedule.next', { time: at })}
              </WorkspaceTime>{' '}
            </>
          )}
          {t('schedule.templateNote')}
        </Banner>
      )}
      <ViewSwitch value={view} onChange={setView} />
      <div className="grid gap-5 @4xl:grid-cols-[minmax(0,1fr)_minmax(0,420px)] @4xl:items-start">
        <fieldset
          ref={editorRef as unknown as React.Ref<HTMLFieldSetElement>}
          disabled={readOnly}
          className={cn('flex min-w-0 flex-col gap-5', view === 'preview' && '@max-4xl:hidden')}
        >
          <Section title={t('postTo')}>
            {accounts.length === 0 ? (
              <p className="text-ink-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                {can('accounts:connect') ? t('noAccounts') : t('noAccountsReadOnly')}
                {can('accounts:connect') && (
                  <Link
                    to="/w/$slug/accounts"
                    params={{ slug: workspace.slug }}
                    className="text-ring font-medium hover:underline"
                  >
                    {t('connectAccounts')}
                  </Link>
                )}
              </p>
            ) : (
              <div data-field="account" className="flex flex-col gap-3">
                {!readOnly && (
                  <GroupChips
                    groups={groups.data ?? []}
                    accounts={accounts}
                    value={draft.accountIds}
                    onChange={(accountIds) => {
                      dispatch({ type: 'accounts', accountIds });
                    }}
                  />
                )}
                <AccountPicker
                  accounts={pickerAccounts}
                  value={draft.accountIds}
                  onChange={(accountIds) => {
                    if (!readOnly) dispatch({ type: 'accounts', accountIds });
                  }}
                  labels={{ group: t('accountsLabel') }}
                />
              </div>
            )}
          </Section>

          <section className="glass-chip rounded-pane flex flex-col gap-4 p-4 sm:p-5">
            <NetworkTabs
              networks={selected}
              active={active}
              customised={customised}
              flagged={validation.blocked}
              onChange={(n) => {
                setTab(n);
                if (n) setPreviewTab(n);
              }}
              panelId={panelId}
            />
            <div
              ref={panelMotion}
              role="tabpanel"
              id={panelId}
              aria-labelledby={`${panelId}-tab-${active ?? 'all'}`}
              className="flex flex-col gap-5"
            >
              <TextBlock
                draft={draft}
                network={active}
                invalid={textInvalid}
                selected={selected}
                maxOf={(n) => rulesOf(n)?.rules.maxChars}
                onText={(text) => {
                  dispatch({ type: 'text', network: active, text });
                }}
                onReset={() => {
                  if (active) dispatch({ type: 'reset', network: active, part: 'text' });
                }}
              />
              <MediaBlock
                workspaceId={workspace.id}
                draft={draft}
                network={active}
                canUpload={can('media:upload')}
                readOnly={readOnly}
                onMedia={(mediaIds) => {
                  dispatch({ type: 'media', network: active, mediaIds });
                }}
                onAttach={(mediaIds, before) => {
                  dispatch({
                    type: 'attach',
                    network: active,
                    mediaIds,
                    ...(before ? { before } : {}),
                  });
                }}
                onReset={() => {
                  if (active) dispatch({ type: 'reset', network: active, part: 'media' });
                }}
                uploadIds={uploadsByTab[active ?? 'all'] ?? []}
                onUploadIds={(update) => {
                  const scope = active ?? 'all';
                  setUploadsByTab((all) => ({ ...all, [scope]: update(all[scope] ?? []) }));
                }}
              />
              {active === null && (
                <>
                  <LinkField
                    value={draft.link}
                    onChange={(link) => {
                      dispatch({ type: 'link', link });
                    }}
                  />
                  <FirstComment
                    value={draft.firstComment}
                    onChange={(firstComment) => {
                      dispatch({ type: 'firstComment', firstComment });
                    }}
                  />
                  {/* Labels organise the posts list; they're saved with the post. */}
                  <div
                    role="group"
                    aria-labelledby={`${panelId}-labels`}
                    className="flex flex-col gap-1.5"
                  >
                    <span id={`${panelId}-labels`} className="text-ink text-sm font-medium">
                      {t('labels')}
                    </span>
                    <LabelPicker
                      value={draft.labelIds}
                      disabled={readOnly}
                      onChange={(labelIds) => {
                        dispatch({ type: 'labels', labelIds });
                      }}
                    />
                  </div>
                </>
              )}
              {active && (
                <OptionsSection
                  network={active}
                  accounts={accounts.filter(
                    (a) => a.network === active && draft.accountIds.includes(a.id),
                  )}
                  draft={draft}
                  dispatch={dispatch}
                />
              )}
            </div>
          </section>
          {!readOnly && touched && (
            <IssuesPanel validation={validation} wording={wording} onSelect={goToIssue} />
          )}
        </fieldset>
        <aside
          aria-labelledby={`${panelId}-preview`}
          className={cn(
            'glass-chip rounded-pane flex min-w-0 flex-col gap-3 p-4 sm:p-5 @4xl:sticky @4xl:top-0',
            view === 'edit' && '@max-4xl:hidden',
          )}
        >
          <h2 id={`${panelId}-preview`} className="text-ink-2 text-xs font-semibold">
            {t('preview.title')}
          </h2>
          <PreviewPanel
            workspaceId={workspace.id}
            draft={draft}
            selected={selected}
            accounts={accounts}
            networks={networks}
            active={previewTab}
            onActiveChange={setPreviewTab}
          />
        </aside>
      </div>
      {!readOnly && (
        <div className="sticky bottom-0 z-10">
          <ComposerFooter
            state={saving.state}
            dirty={saving.dirty}
            saved={saving.postId !== null}
            mode={mode}
            acting={saving.acting}
            onSave={() => void saving.save()}
            onPublish={() => void publish()}
            onSchedule={() => {
              setScheduling(true);
            }}
            onQueue={() => void addToQueue()}
            queue={queue}
            canPublish={can('posts:publish')}
            reviewRequired={reviewRequired}
            onSubmit={offerSubmit ? () => void submit() : undefined}
            inReview={inReview}
            blocked={validation.blocked.size}
            noAccounts={draft.accountIds.length === 0}
          />
        </div>
      )}
      <ScheduleDialog
        initialAt={preferredAt}
        open={scheduling}
        onOpenChange={setScheduling}
        post={post}
        recurrence={recurrence}
        canRepeat={post?.recurring !== 'occurrence'}
        busy={saving.acting === 'schedule' || saving.acting === 'repeat'}
        onSchedule={(at) => void schedule(at)}
        onRepeat={(rule) => void repeat(rule)}
      />
      <ConfirmDialog
        open={confirmStop}
        onOpenChange={setConfirmStop}
        tone="danger"
        title={t('schedule.stopTitle')}
        description={t('schedule.stopBody')}
        confirmLabel={t('schedule.stop')}
        cancelLabel={t('schedule.cancel')}
        onConfirm={async () => {
          await saving.stopRepeating();
          toast.success(t('schedule.stopped'));
        }}
        errorMessage={errorMessage}
      />
      <ConfirmDialog
        open={blocker.status === 'blocked'}
        onOpenChange={(open) => {
          if (!open && blocker.status === 'blocked') blocker.reset();
        }}
        tone="danger"
        title={t('leave.title')}
        description={t('leave.body')}
        confirmLabel={t('leave.confirm')}
        cancelLabel={t('leave.cancel')}
        onConfirm={() => {
          if (blocker.status === 'blocked') blocker.proceed();
        }}
      />
    </>
  );
}

/** Phones and tablets: the editor and the preview take turns. */
function ViewSwitch({
  value,
  onChange,
}: {
  value: 'edit' | 'preview';
  onChange: (v: 'edit' | 'preview') => void;
}) {
  const { t } = useTranslation('composer');
  return (
    <div
      role="group"
      aria-label={t('view.label')}
      className="glass-chip rounded-control flex self-start p-1 @4xl:hidden"
    >
      {(['edit', 'preview'] as const).map((v) => (
        <button
          key={v}
          type="button"
          aria-pressed={value === v}
          onClick={() => {
            onChange(v);
          }}
          className={cn(
            'relative isolate h-8 rounded-lg px-4 text-[13px] font-medium transition-colors duration-200',
            value === v ? 'text-ink' : 'text-ink-3 hover:text-ink',
          )}
        >
          {value === v && (
            <motion.span
              layoutId="composer-view"
              aria-hidden="true"
              className="bg-chip absolute inset-0 -z-10 rounded-lg shadow-sm"
              transition={springs.snappy}
            />
          )}
          {t(`view.${v}`)}
        </button>
      ))}
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const id = useId();
  return (
    <section
      aria-labelledby={id}
      className="glass-chip rounded-pane flex flex-col gap-3 p-4 sm:p-5"
    >
      <h2 id={id} className="text-ink-2 text-xs font-semibold">
        {title}
      </h2>
      {children}
    </section>
  );
}

function TextBlock({
  draft,
  network,
  invalid,
  selected,
  maxOf,
  onText,
  onReset,
}: {
  draft: Draft;
  network: NetworkId | null;
  invalid: boolean;
  selected: NetworkId[];
  maxOf: (n: NetworkId) => number | undefined;
  onText: (text: string) => void;
  onReset: () => void;
}) {
  const { t } = useTranslation('composer');
  const content = contentFor(draft, network);
  const name = network ? networkName(network) : '';
  // On "All networks", count for the networks that use the shared text.
  const counted = network
    ? [network]
    : selected.filter((n) => !contentFor(draft, n).textOverridden);
  const ownText = network ? [] : selected.filter((n) => contentFor(draft, n).textOverridden);
  const list = new Intl.ListFormat(undefined, { type: 'conjunction' });
  return (
    <FormField
      label={network ? t('text.labelFor', { network: name }) : t('text.label')}
      hint={
        network
          ? content.textOverridden
            ? t('text.custom', { network: name })
            : t('text.shared', { network: name })
          : undefined
      }
    >
      {(control) => (
        <div className="flex flex-col gap-2">
          <Textarea
            {...control}
            {...(invalid ? { 'aria-invalid': true } : {})}
            data-field="text"
            rows={7}
            value={content.text}
            placeholder={t('text.placeholder')}
            onChange={(e) => {
              onText(e.target.value);
            }}
          />
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            {counted.map((n) => {
              const max = maxOf(n);
              return max ? (
                <CharacterCounter
                  key={n}
                  count={textLength(contentFor(draft, n).text)}
                  max={max}
                  network={n}
                />
              ) : null;
            })}
            {ownText.length > 0 && (
              <span className="text-ink-3 text-xs">
                {t('text.otherNetworksCustom', {
                  count: ownText.length,
                  networks: list.format(ownText.map(networkName)),
                })}
              </span>
            )}
            {network && content.textOverridden && <ResetButton onClick={onReset} />}
          </div>
        </div>
      )}
    </FormField>
  );
}

function MediaBlock({
  workspaceId,
  draft,
  network,
  canUpload,
  readOnly,
  onMedia,
  onAttach,
  onReset,
  uploadIds,
  onUploadIds,
}: {
  workspaceId: string;
  draft: Draft;
  network: NetworkId | null;
  canUpload: boolean;
  readOnly: boolean;
  onMedia: (mediaIds: string[]) => void;
  onAttach: (mediaIds: string[], before?: string[]) => void;
  onReset: () => void;
  uploadIds: string[];
  onUploadIds: (update: (ids: string[]) => string[]) => void;
}) {
  const { t } = useTranslation('composer');
  const content = contentFor(draft, network);
  const name = network ? networkName(network) : '';
  const shared = network !== null && !content.mediaOverridden;
  const label = network ? t('media.labelFor', { network: name }) : t('media.label');
  return (
    <div className="flex flex-col gap-2 outline-none" data-field="media" tabIndex={-1}>
      <span className="text-ink text-[13px] font-medium">{label}</span>
      {content.mediaIds.length === 0 && shared && (
        <p className="text-ink-3 text-sm">{t('media.none')}</p>
      )}
      <MediaStrip
        workspaceId={workspaceId}
        mediaIds={content.mediaIds}
        onChange={onMedia}
        onAttach={onAttach}
        canUpload={canUpload}
        // A network tab shows the shared files until the user chooses its own.
        disabled={readOnly || shared}
        label={label}
        uploadIds={uploadIds}
        onUploadIds={onUploadIds}
      />
      {network && !readOnly && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <span className="text-ink-3 text-xs">
            {shared ? t('media.shared') : t('media.custom', { network: name })}
          </span>
          {shared ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                onMedia([...draft.mediaIds]);
              }}
            >
              {t('media.customise', { network: name })}
            </Button>
          ) : (
            <ResetButton onClick={onReset} />
          )}
        </div>
      )}
    </div>
  );
}

function ResetButton({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation('composer');
  return (
    <Button size="sm" variant="ghost" onClick={onClick}>
      <RotateCcw aria-hidden="true" />
      {t('reset')}
    </Button>
  );
}

function LinkField({ value, onChange }: { value: string; onChange: (link: string) => void }) {
  const { t } = useTranslation('composer');
  const [touched, setTouched] = useState(false);
  const invalid = touched && value.trim() !== '' && !isWebAddress(value.trim());
  return (
    <FormField
      label={t('link.label')}
      hint={t('link.hint')}
      {...(invalid ? { error: t('link.invalid') } : {})}
    >
      {(control) => (
        <Input
          {...control}
          data-field="link"
          type="url"
          inputMode="url"
          value={value}
          placeholder={t('link.placeholder')}
          onChange={(e) => {
            onChange(e.target.value);
          }}
          onBlur={() => {
            setTouched(true);
          }}
        />
      )}
    </FormField>
  );
}

function FirstComment({
  value,
  onChange,
}: {
  value: string;
  onChange: (firstComment: string) => void;
}) {
  const { t } = useTranslation('composer');
  const [open, setOpen] = useState(value !== '');
  if (!open) {
    return (
      <div>
        <Button
          size="sm"
          variant="ghost"
          data-field="firstComment"
          onClick={() => {
            setOpen(true);
          }}
        >
          <MessageSquarePlus aria-hidden="true" />
          {t('firstComment.add')}
        </Button>
      </div>
    );
  }
  return (
    <FormField label={t('firstComment.label')} hint={t('firstComment.hint')}>
      {(control) => (
        <div className="flex flex-col gap-1.5">
          <Textarea
            {...control}
            data-field="firstComment"
            rows={3}
            value={value}
            autoFocus={value === ''}
            onChange={(e) => {
              onChange(e.target.value);
            }}
          />
          <div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                onChange('');
                setOpen(false);
              }}
            >
              <Trash2 aria-hidden="true" />
              {t('firstComment.remove')}
            </Button>
          </div>
        </div>
      )}
    </FormField>
  );
}
