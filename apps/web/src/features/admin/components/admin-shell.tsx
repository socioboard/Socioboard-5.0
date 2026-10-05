import { Button, cn, EmptyState, motion, springs, TooltipProvider } from '@socioboard/ui';
import { useQuery } from '@tanstack/react-query';
import { Link, Outlet } from '@tanstack/react-router';
import {
  ArrowLeft,
  Gauge,
  KeyRound,
  Layers,
  PlugZap,
  Send,
  ShieldAlert,
  type LucideIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { ApiError } from '../../../lib/api';
import { useMe } from '../../../lib/session';
import { useSignOut } from '../../auth';
import { overviewQuery } from '../api';

const PAGES = [
  { to: '/admin', icon: Gauge, label: 'nav.overview', exact: true },
  { to: '/admin/publishing', icon: Send, label: 'nav.publishing', exact: false },
  { to: '/admin/queues', icon: Layers, label: 'nav.queues', exact: false },
  { to: '/admin/accounts', icon: PlugZap, label: 'nav.accounts', exact: false },
] as const satisfies readonly {
  to: string;
  icon: LucideIcon;
  label: `nav.${string}`;
  exact: boolean;
}[];

/**
 * The platform admin console's frame (docs/frontend/areas/admin-console.md): its own pages and an
 * amber "Admin" band, so staff always know they're looking across every customer. Platform admins
 * only (the route checks); the API also wants 2FA verified in this session, which this explains
 * rather than showing errors.
 */
export function AdminShell() {
  const { t } = useTranslation('admin');
  const me = useMe().data;
  const probe = useQuery({ ...overviewQuery, enabled: Boolean(me?.user.twoFactorEnabled) });
  const gate: 'noTwoFactor' | 'verify' | 'notAdmin' | null = !me?.user.twoFactorEnabled
    ? 'noTwoFactor'
    : probe.error instanceof ApiError && probe.error.code === 'ADMIN_2FA_REQUIRED'
      ? 'verify'
      : probe.error instanceof ApiError && probe.error.code === 'NOT_PLATFORM_ADMIN'
        ? 'notAdmin'
        : null;

  return (
    <TooltipProvider>
      <div className="flex h-dvh flex-col gap-3 p-3 md:flex-row">
        <nav
          aria-label={t('nav.label')}
          className="glass rounded-pane animate-settle flex shrink-0 flex-col gap-1 p-3 md:w-[232px]"
        >
          <div className="mb-3 flex items-center gap-2.5 px-1.5">
            <span className="flex size-8 items-center justify-center rounded-[9px] bg-[linear-gradient(135deg,var(--sb-warning),var(--sb-accent))] text-white shadow-sm">
              <ShieldAlert className="size-4" aria-hidden="true" />
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="text-ink text-sm font-semibold">{t('title')}</span>
              <span className="text-ink-3 text-[11px]">{t('subtitle')}</span>
            </span>
            <Link
              to="/"
              aria-label={t('nav.back')}
              className="text-ink-2 hover:bg-chip hover:text-ink inline-flex size-8 items-center justify-center rounded-lg md:hidden"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <ul className="flex gap-0.5 overflow-x-auto md:flex-col">
            {PAGES.map((page) => (
              <li key={page.to} className="shrink-0">
                <Link
                  to={page.to}
                  activeOptions={{ exact: page.exact }}
                  className={cn(
                    'text-ink-2 hover:text-ink hover:bg-chip relative isolate flex h-[34px] items-center gap-2.5 rounded-control px-2.5 text-[13px] font-medium transition-colors duration-200',
                    'data-[status=active]:text-ink data-[status=active]:hover:bg-transparent',
                  )}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.span
                          layoutId="admin-nav-active"
                          aria-hidden="true"
                          className="bg-glass border-edge rounded-control absolute inset-0 -z-10 border shadow-[inset_0_1px_0_var(--sb-spec),0_1px_2px_rgb(0_0_0/0.06)]"
                          transition={springs.snappy}
                        />
                      )}
                      <page.icon className="size-4 shrink-0" aria-hidden="true" />
                      {t(page.label)}
                    </>
                  )}
                </Link>
              </li>
            ))}
          </ul>
          <div className="border-hair mt-auto hidden flex-col gap-0.5 border-t pt-2 md:flex">
            <Link
              to="/"
              className="text-ink-2 hover:text-ink hover:bg-chip flex h-8 items-center gap-2 rounded-control px-2.5 text-[13px] font-medium"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              {t('nav.back')}
            </Link>
          </div>
        </nav>
        <main className="glass rounded-pane animate-settle sb-page @container relative flex min-h-0 flex-1 flex-col overflow-hidden [animation-delay:60ms]">
          {/* The band that says "you're in the admin console", across the top of every page. */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,var(--sb-warning),var(--sb-accent))]"
          />
          {gate ? <Gate kind={gate} /> : <Outlet />}
        </main>
      </div>
    </TooltipProvider>
  );
}

/** Why the console can't open yet, and what to do about it. */
function Gate({ kind }: { kind: 'noTwoFactor' | 'verify' | 'notAdmin' }) {
  const { t } = useTranslation('admin');
  const signOut = useSignOut();
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <EmptyState
        icon={<KeyRound />}
        title={t(`gate.${kind}.title`)}
        description={t(`gate.${kind}.body`)}
        action={
          kind === 'noTwoFactor' ? (
            <Button asChild variant="primary">
              <Link to="/me/security">{t('gate.noTwoFactor.action')}</Link>
            </Button>
          ) : kind === 'verify' ? (
            <Button variant="primary" onClick={() => void signOut('/login?redirect=%2Fadmin')}>
              {t('gate.verify.action')}
            </Button>
          ) : (
            <Button asChild>
              <Link to="/">{t('nav.back')}</Link>
            </Button>
          )
        }
      />
    </div>
  );
}
