import {
  Avatar,
  Button,
  cn,
  NetworkIcon,
  networkName,
  PageHeader,
  Skeleton,
  staggerStyle,
  Swap,
} from '@socioboard/ui';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Check, Plus, SquarePen } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { useCan } from '../../../lib/permissions';
import { useWorkspace } from '../../../lib/workspace';
import { accountsQuery, ConnectDialog } from '../../accounts';

export type WelcomeStep = 'connect' | 'post';

/**
 * `/w/:slug/welcome`: onboarding steps 2 and 3 (docs/frontend/areas/auth-onboarding.md), right
 * after the workspace is created (step 1). Step 2 connects a first social account; connecting
 * comes back to step 3, writing a first post. Both can be skipped; the calendar's getting-started
 * card picks them up later.
 */
export function WelcomePage({ step }: { step: WelcomeStep }) {
  const { t } = useTranslation('onboarding');
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title={t('welcome.title')} />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="stagger-children relative mx-auto flex w-full max-w-xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12">
          <Steps current={step} />
          <Swap id={step} direction={1}>
            {step === 'connect' ? <ConnectStep /> : <PostStep />}
          </Swap>
        </div>
      </div>
    </div>
  );
}

/** Where the user is in the three steps; the workspace (step 1) is always done here. */
function Steps({ current }: { current: WelcomeStep }) {
  const { t } = useTranslation('onboarding');
  const steps = [
    { id: 'workspace', done: true },
    { id: 'connect', done: current === 'post' },
    { id: 'post', done: false },
  ] as const;
  return (
    <ol aria-label={t('welcome.steps')} className="flex items-center gap-2">
      {steps.map((s, i) => {
        const active = s.id === current;
        return (
          <li
            key={s.id}
            aria-current={active ? 'step' : undefined}
            className="flex min-w-0 flex-1 flex-col gap-2"
          >
            <span className="bg-hair-strong h-1 overflow-hidden rounded-full" aria-hidden="true">
              <span
                className={cn(
                  'bg-accent block h-full origin-left rounded-full transition-[scale,opacity] duration-700 ease-out-soft motion-reduce:transition-none',
                  s.done || active ? 'scale-x-100' : 'scale-x-0',
                  active && 'opacity-60',
                )}
              />
            </span>
            <span
              className={cn(
                'flex items-center gap-1 truncate text-xs font-medium',
                active ? 'text-ink' : 'text-ink-3',
              )}
            >
              {s.done && (
                <Check
                  className="text-success animate-scale-in size-3.5 shrink-0 motion-reduce:animate-none"
                  aria-hidden="true"
                />
              )}
              <span className="sr-only">{t('welcome.stepOf', { n: i + 1 })}: </span>
              {t(`welcome.step.${s.id}`)}
              {s.done && <span className="sr-only"> ({t('welcome.done')})</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function StepBody({
  n,
  title,
  body,
  children,
}: {
  n: number;
  title: string;
  body: ReactNode;
  children: ReactNode;
}) {
  const { t } = useTranslation('onboarding');
  return (
    <section aria-labelledby="welcome-step" className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-ink-3 text-xs font-medium">{t('welcome.stepOf', { n })}</p>
        <h2 id="welcome-step" className="text-ink text-2xl font-semibold tracking-tight">
          {title}
        </h2>
        <p className="text-ink-2 max-w-prose text-sm leading-relaxed">{body}</p>
      </div>
      {children}
    </section>
  );
}

const nextStep = '/w/$slug/welcome' as const;

function ConnectStep() {
  const { t } = useTranslation('onboarding');
  const { workspace } = useWorkspace();
  const can = useCan();
  const accounts = useQuery(accountsQuery(workspace.id));
  const [connecting, setConnecting] = useState(false);
  const canConnect = can('accounts:connect');
  const connected = accounts.data?.filter((a) => a.status !== 'disconnected') ?? [];
  const toPost = (
    <Link to={nextStep} params={{ slug: workspace.slug }} search={{ step: 'post' }}>
      {connected.length > 0 ? t('welcome.continue') : t('welcome.skip')}
    </Link>
  );

  let content: ReactNode;
  if (accounts.isPending) {
    content = <Skeleton className="rounded-control h-24" />;
  } else if (connected.length > 0) {
    content = (
      <div className="flex flex-col gap-3">
        <p className="text-ink flex items-center gap-1.5 text-sm font-semibold">
          <Check className="text-success size-4" aria-hidden="true" />
          {t('welcome.connect.connected', { count: connected.length })}
        </p>
        <ul className="glass-chip rounded-control flex flex-col divide-y divide-[var(--color-hair)]">
          {connected.map((a, i) => (
            <li
              key={a.id}
              className="animate-enter flex items-center gap-3 px-3 py-2.5"
              style={staggerStyle(i)}
            >
              <span className="relative inline-flex">
                <Avatar name={a.displayName} src={a.avatarUrl} size="md" decorative />
                <NetworkIcon
                  network={a.network}
                  variant="tile"
                  size="xs"
                  decorative
                  className="ring-canvas absolute -right-1 -bottom-1 ring-2"
                />
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="text-ink truncate text-sm font-medium">{a.displayName}</span>
                <span className="text-ink-3 text-xs">{networkName(a.network)}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  } else {
    content = (
      <div className="flex items-center gap-2" aria-hidden="true">
        <NetworkIcon network="facebook_page" variant="tile" size="lg" decorative />
        <NetworkIcon network="instagram" variant="tile" size="lg" decorative />
      </div>
    );
  }

  return (
    <StepBody
      n={2}
      title={t('welcome.connect.title')}
      body={canConnect ? t('welcome.connect.body') : t('welcome.connect.readOnly')}
    >
      {content}
      <div className="flex flex-wrap items-center gap-2">
        {connected.length > 0 || !canConnect ? (
          <>
            <Button asChild variant="primary" size="lg">
              {toPost}
            </Button>
            {canConnect && (
              <Button
                size="lg"
                variant="ghost"
                onClick={() => {
                  setConnecting(true);
                }}
              >
                <Plus aria-hidden="true" />
                {t('welcome.connect.another')}
              </Button>
            )}
          </>
        ) : (
          <>
            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                setConnecting(true);
              }}
            >
              {t('welcome.connect.action')}
            </Button>
            <Button asChild variant="ghost" size="lg">
              {toPost}
            </Button>
          </>
        )}
      </div>
      {canConnect && (
        <ConnectDialog
          open={connecting}
          onOpenChange={setConnecting}
          existingProviders={
            new Set(connected.flatMap((a) => (a.connection ? [a.connection.provider] : [])))
          }
          // Adding the accounts ends on step 3.
          returnTo={`/w/${encodeURIComponent(workspace.slug)}/welcome?step=post`}
        />
      )}
    </StepBody>
  );
}

function PostStep() {
  const { t } = useTranslation('onboarding');
  const { workspace } = useWorkspace();
  const can = useCan();
  const accounts = useQuery(accountsQuery(workspace.id));
  const canWrite = can('posts:create');
  const hasAccounts = (accounts.data ?? []).some((a) => a.status !== 'disconnected');
  const calendar = (
    <Link to="/w/$slug/calendar" params={{ slug: workspace.slug }}>
      {canWrite ? t('welcome.skip') : t('welcome.finish')}
    </Link>
  );
  return (
    <StepBody
      n={3}
      title={t('welcome.post.title')}
      body={
        !canWrite
          ? t('welcome.post.readOnly')
          : hasAccounts || accounts.isPending
            ? t('welcome.post.body')
            : t('welcome.post.bodyNoAccounts')
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        {canWrite && (
          <Button asChild variant="primary" size="lg">
            <Link
              to="/w/$slug/compose/{-$postId}"
              params={{ slug: workspace.slug, postId: undefined }}
            >
              <SquarePen aria-hidden="true" />
              {t('welcome.post.action')}
            </Link>
          </Button>
        )}
        <Button asChild variant={canWrite ? 'ghost' : 'primary'} size="lg">
          {calendar}
        </Button>
      </div>
    </StepBody>
  );
}
