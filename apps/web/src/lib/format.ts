// Dates for people: short, in their language (docs/frontend/README.md: dates follow the workspace
// time zone once scheduling exists; account and membership dates are shown in the browser's zone).

/** "28 Sep 2026". */
export function formatDate(iso: string, locale?: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(iso));
}

/** "28 Sep 2026, 14:05". */
export function formatDateTime(iso: string, locale?: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(iso),
  );
}
