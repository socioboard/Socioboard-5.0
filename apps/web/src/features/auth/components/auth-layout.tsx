import { cn } from '@socioboard/ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

/** Centered glass card for every sign-in screen. */
export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  const { t } = useTranslation();
  return (
    <main className="grid min-h-dvh place-items-center p-4">
      <div className="flex w-full max-w-[26rem] flex-col gap-4">
        <div
          className={cn(
            'glass rounded-pane animate-settle stagger-children flex flex-col gap-6 p-6 [--stagger-base:180ms] sm:p-8',
            className,
          )}
        >
          <img src="/sb-mark.svg" alt={t('app.name')} width={28} height={32} />
          <div className="flex flex-col gap-1.5">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            {subtitle && <p className="text-ink-2 text-sm leading-relaxed">{subtitle}</p>}
          </div>
          {children}
        </div>
        {footer && <p className="text-ink-2 text-center text-sm">{footer}</p>}
      </div>
    </main>
  );
}

/** A form-level error (wrong password, expired link): announced, with the reason in words. */
export function FormError({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <p
      role="alert"
      className="bg-danger-tint text-danger rounded-control animate-enter px-3 py-2.5 text-sm leading-relaxed"
    >
      {children}
    </p>
  );
}

/** A success note (link sent, password changed). */
export function FormNotice({ children }: { children: ReactNode }) {
  return (
    <p
      role="status"
      className="glass-chip text-ink-2 rounded-control animate-enter px-3 py-2.5 text-sm leading-relaxed"
    >
      {children}
    </p>
  );
}
