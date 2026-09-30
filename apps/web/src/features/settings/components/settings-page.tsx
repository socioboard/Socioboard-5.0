import { cn, NavTabs, PageHeader } from '@socioboard/ui';
import type { ReactNode } from 'react';

/**
 * A settings-style page: the page header, tabs that are links, and a scrolling column of sections.
 * Used by workspace settings and the account pages.
 */
export function SettingsPage({
  title,
  tabs,
  children,
}: {
  title: ReactNode;
  tabs: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      <PageHeader title={title} />
      <NavTabs>{tabs}</NavTabs>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="stagger-children mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </div>
      </div>
    </>
  );
}

/** One block of settings: a heading and explanation on the left, the controls on the right. */
export function SettingsSection({
  title,
  description,
  children,
  tone = 'default',
  className,
  headingId,
}: {
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  tone?: 'default' | 'danger';
  className?: string;
  headingId?: string;
}) {
  return (
    <section
      {...(headingId ? { 'aria-labelledby': headingId } : {})}
      className={cn(
        'grid gap-4 md:grid-cols-[14rem_1fr] md:gap-8',
        tone === 'danger' && 'border-danger/30 rounded-pane border p-4 sm:p-5',
        className,
      )}
    >
      <div className="flex flex-col gap-1">
        <h2
          id={headingId}
          className={cn('text-sm font-semibold', tone === 'danger' ? 'text-danger' : 'text-ink')}
        >
          {title}
        </h2>
        {description && <p className="text-ink-3 text-[13px] leading-relaxed">{description}</p>}
      </div>
      <div className="flex min-w-0 flex-col gap-4">{children}</div>
    </section>
  );
}
