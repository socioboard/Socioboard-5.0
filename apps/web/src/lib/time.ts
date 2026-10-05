// Times in a named timezone (docs/frontend/README.md, "Dates": posts' times are shown in the
// workspace's timezone, with the reader's own time on hover when it differs).

/** The browser's time zone, the default for a new workspace. */
export function browserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

/**
 * Cities renamed since the IANA ID was made. Browsers still report some old IDs (Chrome gives
 * "Asia/Calcutta"), so labels use today's name.
 */
export const RENAMED_CITIES: Record<string, string> = {
  Calcutta: 'Kolkata',
  Saigon: 'Ho Chi Minh City',
  Katmandu: 'Kathmandu',
  Rangoon: 'Yangon',
  Kiev: 'Kyiv',
  Godthab: 'Nuuk',
  Ulan_Bator: 'Ulaanbaatar',
  Faeroe: 'Faroe',
};

/** The city a timezone is named after ("Europe/Lisbon" → "Lisbon"), or "UTC". */
export function zoneCity(timeZone: string): string {
  if (timeZone === 'UTC') return 'UTC';
  const last = timeZone.split('/').at(-1) ?? timeZone;
  return (RENAMED_CITIES[last] ?? last).replaceAll('_', ' ');
}

const STYLES = {
  /** "6 Oct 2026, 09:00". */
  dateTime: { dateStyle: 'medium', timeStyle: 'short' },
  /** "Tue, 6 Oct 2026, 09:00": for a time someone is choosing or was just given. */
  long: {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  },
  /** "6 Oct 2026". */
  date: { dateStyle: 'medium' },
  /** "Tuesday, 6 October": a day in a list of the coming days. */
  day: { weekday: 'long', day: 'numeric', month: 'long' },
  /** "09:00". */
  time: { timeStyle: 'short' },
} as const satisfies Record<string, Intl.DateTimeFormatOptions>;
export type ZonedStyle = keyof typeof STYLES;

/** An instant as people in `timeZone` read it. */
export function formatZoned(
  iso: string | Date,
  timeZone: string,
  style: ZonedStyle = 'dateTime',
  locale?: string,
): string {
  return new Intl.DateTimeFormat(locale, { ...STYLES[style], timeZone }).format(new Date(iso));
}

/** A wall-clock time ("09:00") in the reader's clock style ("9:00 AM" where that's the custom). */
export function formatTimeOfDay(hhmm: string, locale?: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  return new Intl.DateTimeFormat(locale, { timeStyle: 'short', timeZone: 'UTC' }).format(
    Date.UTC(2000, 0, 1, h ?? 0, m ?? 0),
  );
}

/** A calendar day (`YYYY-MM-DD`) as "6 Oct 2026". */
export function formatLocalDate(date: string, locale?: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' }).format(
    new Date(`${date}T00:00:00Z`),
  );
}
