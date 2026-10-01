import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { browserTimezone, formatZoned, zoneCity, type ZonedStyle } from './time';
import { useWorkspace } from './workspace';

/**
 * Times as the workspace reads them: its timezone, not the browser's, so a team in several
 * countries sees one schedule (docs/frontend/README.md, "Dates").
 */
export function useWorkspaceTime() {
  const { t } = useTranslation('common');
  const { workspace } = useWorkspace();
  const timeZone = workspace.timezone;
  return useMemo(() => {
    const own = browserTimezone();
    return {
      timeZone,
      /** The timezone's name in a sentence: "Lisbon time", or "UTC". */
      zone: timeZone === 'UTC' ? 'UTC' : t('time.zone', { city: zoneCity(timeZone) }),
      /** The reader's clock is on another timezone. */
      differs: own !== timeZone,
      format: (iso: string | Date, style?: ZonedStyle) => formatZoned(iso, timeZone, style),
      /** The same instant on the reader's own clock. */
      own: (iso: string | Date, style?: ZonedStyle) => formatZoned(iso, own, style),
    };
  }, [timeZone, t]);
}
