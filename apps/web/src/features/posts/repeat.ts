import type { RecurrenceRuleInput } from '@socioboard/contracts';
import { useTranslation } from 'react-i18next';

import { formatLocalDate, formatTimeOfDay } from '../../lib/time';

/** A weekday's name (0 = Sunday), in the reader's language. */
export function weekdayName(weekday: number, style: 'long' | 'short' | 'narrow', locale?: string) {
  // 1 January 2023 was a Sunday.
  return new Intl.DateTimeFormat(locale, { weekday: style, timeZone: 'UTC' }).format(
    Date.UTC(2023, 0, 1 + weekday),
  );
}

/** Weekdays in the order people list them: Monday first. */
export const mondayFirst = (days: readonly number[]) =>
  [...days].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7));

/**
 * How a post repeats, in a sentence: "Every 2 weeks on Monday and Thursday at 09:00, until
 * 31 Dec 2026". Used by the composer, the schedule dialog and the post's page.
 */
export function useRepeatWording() {
  const { t, i18n } = useTranslation('posts');
  return (rule: RecurrenceRuleInput): string => {
    const locale = i18n.language;
    const count = rule.interval ?? 1;
    let every: string;
    if (rule.frequency === 'daily') {
      every = t('repeat.daily', { count });
    } else if (rule.frequency === 'weekly') {
      const days = new Intl.ListFormat(locale, { type: 'conjunction' }).format(
        mondayFirst(rule.weekdays ?? []).map((d) => weekdayName(d, 'long', locale)),
      );
      every = t('repeat.weekly', { count, days });
    } else {
      every =
        rule.monthDay === -1
          ? t('repeat.monthlyLast', { count })
          : t('repeat.monthly', { count, day: rule.monthDay ?? 1 });
    }
    const timed = t('repeat.at', { rule: every, time: formatTimeOfDay(rule.time, locale) });
    const ends = rule.ends ?? { type: 'never' };
    if (ends.type === 'on') {
      return t('repeat.until', { rule: timed, date: formatLocalDate(ends.date, locale) });
    }
    if (ends.type === 'after') return t('repeat.times', { rule: timed, count: ends.count });
    return timed;
  };
}
