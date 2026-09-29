import {
  textLength,
  type Network,
  type NetworkId,
  type Post,
  type SocialAccount,
} from '@socioboard/contracts';
import {
  AccountPicker,
  Banner,
  Button,
  CharacterCounter,
  EmptyState,
  FormField,
  Input,
  networkName,
  PageHeader,
  RadioCard,
  RadioGroup,
  Skeleton,
  Textarea,
  type PickerAccount,
} from '@socioboard/ui';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { MessageSquarePlus, RotateCcw, Trash2 } from 'lucide-react';
import { useId, useReducer, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { ApiError } from '../../../lib/api';
import { useCan } from '../../../lib/permissions';
import { useWorkspace } from '../../../lib/workspace';
import { accountsQuery, networksQuery } from '../../accounts';
import { postQuery } from '../api';
import {
  contentFor,
  draftReducer,
  emptyDraft,
  fromPost,
  selectedNetworks,
  type Draft,
} from '../draft';
import { MediaStrip } from './media-strip';
import { NetworkTabs } from './network-tabs';

/** Targets in these states make a post history: it can't be edited any more. */
const LOCKED = new Set(['publishing', 'published']);

/**
 * `/w/:slug/compose` and `/w/:slug/compose/:postId` (docs/frontend/areas/composer.md): write
 * once, tailor per network. Previews (P1-F3), the issues panel (P1-F4) and saving (P1-F5) join
 * this screen next.
 */
export function ComposerPage({ postId }: { postId?: string | undefined }) {
  const { t } = useTranslation('composer');
  const { workspace } = useWorkspace();
  const accounts = useQuery(accountsQuery(workspace.id));
  const networks = useQuery(networksQuery);
  const post = useQuery({
    ...postQuery(workspace.id, postId ?? ''),
    enabled: postId !== undefined,
  });

  const title = postId ? t('editTitle') : t('newTitle');
  let body: ReactNode;
  if (accounts.isPending || networks.isPending || (postId && post.isPending)) {
    body = (
      <div className="flex flex-col gap-5" aria-hidden="true">
        <Skeleton className="rounded-control h-24" />
        <Skeleton className="rounded-control h-72" />
      </div>
    );
  } else if (postId && post.isError) {
    const gone = post.error instanceof ApiError && post.error.status === 404;
    body = (
      <EmptyState
        title={gone ? t('notFound') : t('loadError')}
        action={
          gone ? (
            <Button asChild>
              <Link to="/w/$slug/calendar" params={{ slug: workspace.slug }}>
                {t('backToCalendar')}
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
        // A different post (or new) starts from its own content.
        key={postId ?? 'new'}
        post={post.data}
        accounts={accounts.data}
        networks={networks.data}
      />
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title={title} />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-5 sm:px-6">{body}</div>
      </div>
    </div>
  );
}

function Composer({
  post,
  accounts,
  networks,
}: {
  post: Post | undefined;
  accounts: SocialAccount[];
  networks: Network[];
}) {
  const { t } = useTranslation('composer');
  const { me, workspace } = useWorkspace();
  const can = useCan();
  const [draft, dispatch] = useReducer(draftReducer, post, (p) => (p ? fromPost(p) : emptyDraft()));
  const [tab, setTab] = useState<NetworkId | null>(null);
  const panelId = useId();

  const networkOf = (id: string) => accounts.find((a) => a.id === id)?.network;
  const selected = selectedNetworks(draft, networkOf);
  // A tab whose network was just deselected falls back to the shared content.
  const active = tab !== null && selected.includes(tab) ? tab : null;
  const customised = new Set(selected.filter((n) => draft.overrides[n] !== undefined));
  const rulesOf = (n: NetworkId) => networks.find((x) => x.id === n);

  const locked = post?.targets.some((x) => LOCKED.has(x.status)) ?? false;
  const mayEdit =
    !post || post.author?.id === me.user.id ? can('posts:create') : can('posts:approve');
  const readOnly = locked || !mayEdit;

  const pickerAccounts: PickerAccount[] = accounts.map((a) => ({
    id: a.id,
    name: a.displayName,
    username: a.username,
    avatarUrl: a.avatarUrl,
    network: a.network,
    status: a.status,
    loginName: a.connection?.displayName ?? null,
  }));

  return (
    <>
      {locked && <Banner tone="warning">{t('locked')}</Banner>}
      {!locked && !mayEdit && <Banner tone="warning">{t('notYours')}</Banner>}
      <fieldset disabled={readOnly} className="flex min-w-0 flex-col gap-5">
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
            <AccountPicker
              accounts={pickerAccounts}
              value={draft.accountIds}
              onChange={(accountIds) => {
                if (!readOnly) dispatch({ type: 'accounts', accountIds });
              }}
              labels={{ group: t('accountsLabel') }}
            />
          )}
        </Section>

        <section className="glass-chip rounded-pane flex flex-col gap-4 p-4 sm:p-5">
          <NetworkTabs
            networks={selected}
            active={active}
            customised={customised}
            onChange={setTab}
            panelId={panelId}
          />
          <div
            role="tabpanel"
            id={panelId}
            aria-labelledby={`${panelId}-tab-${active ?? 'all'}`}
            className="flex flex-col gap-5"
          >
            <TextBlock
              draft={draft}
              network={active}
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
              onAttach={(mediaIds) => {
                dispatch({ type: 'attach', network: active, mediaIds });
              }}
              onReset={() => {
                if (active) dispatch({ type: 'reset', network: active, part: 'media' });
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
              </>
            )}
            {active === 'instagram' && (
              <InstagramFormat
                value={contentFor(draft, 'instagram').format}
                onChange={(format) => {
                  dispatch({ type: 'format', format });
                }}
              />
            )}
          </div>
        </section>
      </fieldset>
    </>
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
  selected,
  maxOf,
  onText,
  onReset,
}: {
  draft: Draft;
  network: NetworkId | null;
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
}: {
  workspaceId: string;
  draft: Draft;
  network: NetworkId | null;
  canUpload: boolean;
  readOnly: boolean;
  onMedia: (mediaIds: string[]) => void;
  onAttach: (mediaIds: string[]) => void;
  onReset: () => void;
}) {
  const { t } = useTranslation('composer');
  const content = contentFor(draft, network);
  const name = network ? networkName(network) : '';
  const shared = network !== null && !content.mediaOverridden;
  const label = network ? t('media.labelFor', { network: name }) : t('media.label');
  return (
    <div className="flex flex-col gap-2">
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

/** http(s) addresses only, as the API accepts. */
function isWebAddress(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
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

type Format = 'feed' | 'reel' | 'story';

function InstagramFormat({ value, onChange }: { value: Format; onChange: (f: Format) => void }) {
  const { t } = useTranslation('composer');
  const id = useId();
  return (
    <div className="flex flex-col gap-2">
      <span id={id} className="text-ink text-[13px] font-medium">
        {t('instagram.format')}
      </span>
      <RadioGroup
        aria-labelledby={id}
        value={value}
        onValueChange={(v) => {
          onChange(v as Format);
        }}
        className="grid gap-2 sm:grid-cols-3"
      >
        {(['feed', 'reel', 'story'] as const).map((f) => (
          <RadioCard
            key={f}
            value={f}
            label={t(`instagram.${f}`)}
            description={t(`instagram.${f}Hint`)}
          />
        ))}
      </RadioGroup>
    </div>
  );
}
