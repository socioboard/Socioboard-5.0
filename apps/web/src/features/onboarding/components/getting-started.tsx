import { Button, cn } from '@socioboard/ui';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Check, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { useCan } from '../../../lib/permissions';
import { useWorkspace } from '../../../lib/workspace';
import { accountsQuery } from '../../accounts';
import { hasPostsQuery } from '../../posts';

const hiddenKey = (workspaceId: string) => `sb-getting-started-hidden:${workspaceId}`;

function readHidden(workspaceId: string): boolean {
  try {
    return localStorage.getItem(hiddenKey(workspaceId)) === '1';
  } catch {
    return false;
  }
}

/**
 * The calendar's getting-started card (docs/frontend/areas/auth-onboarding.md): onboarding steps
 * skipped at first, to pick up later. Shown to people who set the workspace up (they can connect
 * accounts) until every step is done or they hide it (remembered in this browser).
 */
export function GettingStarted() {
  const { t } = useTranslation('onboarding');
  const { workspace } = useWorkspace();
  const can = useCan();
  const relevant = can('accounts:connect');
  const accounts = useQuery({ ...accountsQuery(workspace.id), enabled: relevant });
  const hasPosts = useQuery({ ...hasPostsQuery(workspace.id), enabled: relevant });
  const [hidden, setHidden] = useState(() => readHidden(workspace.id));

  if (!relevant || hidden || !accounts.data || hasPosts.data === undefined) return null;
  const connected = accounts.data.some((a) => a.status !== 'disconnected');
  const steps = [
    { id: 'workspace', done: true, action: null },
    {
      id: 'connect',
      done: connected,
      action: (
        <Link to="/w/$slug/welcome" params={{ slug: workspace.slug }} search={{ step: 'connect' }}>
          {t('checklist.connectAction')}
        </Link>
      ),
    },
    {
      id: 'post',
      done: hasPosts.data,
      action: (
        <Link to="/w/$slug/compose/{-$postId}" params={{ slug: workspace.slug, postId: undefined }}>
          {t('checklist.postAction')}
        </Link>
      ),
    },
  ] as const satisfies readonly { id: string; done: boolean; action: ReactNode }[];
  const done = steps.filter((s) => s.done).length;
  if (done === steps.length) return null;

  const hide = () => {
    try {
      localStorage.setItem(hiddenKey(workspace.id), '1');
    } catch {
      // Not remembered: it comes back next visit.
    }
    setHidden(true);
  };

  return (
    <section
      aria-labelledby="getting-started"
      className="glass-chip rounded-pane stagger-children flex w-full max-w-xl flex-col gap-4 p-5"
    >
      <div className="flex items-start gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h2 id="getting-started" className="text-ink text-[15px] font-semibold tracking-tight">
            {t('checklist.title')}
          </h2>
          <p className="text-ink-3 text-xs">{t('checklist.progress', { done })}</p>
        </div>
        <Button variant="ghost" size="icon-sm" aria-label={t('checklist.hide')} onClick={hide}>
          <X aria-hidden="true" />
        </Button>
      </div>
      <ol className="flex flex-col gap-1">
        {steps.map((s, i) => (
          <li key={s.id} className="flex min-h-10 items-center gap-3">
            <span
              className={cn(
                'flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                'transition-colors duration-300',
                s.done ? 'bg-success text-white' : 'border-hair-strong text-ink-3 border',
              )}
              aria-hidden="true"
            >
              {s.done ? <Check className="animate-scale-in size-3.5" /> : i + 1}
            </span>
            <span
              className={cn(
                'min-w-0 flex-1 text-sm',
                s.done ? 'text-ink-3 line-through decoration-current/40' : 'text-ink font-medium',
              )}
            >
              {t(`checklist.${s.id}`)}
              {s.done && <span className="sr-only"> ({t('welcome.done')})</span>}
            </span>
            {!s.done && (
              <Button asChild size="sm">
                {s.action}
              </Button>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
