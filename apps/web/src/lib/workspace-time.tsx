import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import type { ZonedStyle } from './time';
import { useWorkspaceTime } from './use-workspace-time';

/**
 * An instant in the workspace's timezone. When the reader's clock is on another one, hovering
 * shows their own time.
 */
export function WorkspaceTime({
  iso,
  style,
  className,
  children,
}: {
  iso: string;
  style?: ZonedStyle;
  className?: string | undefined;
  /** Wraps the formatted time in a sentence ("Scheduled for …"). */
  children?: (time: string) => ReactNode;
}) {
  const { t } = useTranslation('common');
  const time = useWorkspaceTime();
  const text = time.format(iso, style);
  return (
    <time
      dateTime={iso}
      className={className}
      {...(time.differs ? { title: t('time.yours', { time: time.own(iso, style) }) } : {})}
    >
      {children ? children(text) : text}
    </time>
  );
}
