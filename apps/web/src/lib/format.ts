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

/** "312 KB", "1.1 MB", "1 GB": binary units, as file managers show them. */
export function formatBytes(bytes: number, locale?: string): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const digits = value < 10 && unit > 0 ? 1 : 0;
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: digits }).format(value)} ${units[unit] ?? 'B'}`;
}

/** "0:42", "12:05", "1:02:09". */
export function formatDuration(seconds: number): string {
  const total = Math.round(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = String(total % 60).padStart(2, '0');
  return h > 0 ? `${String(h)}:${String(m).padStart(2, '0')}:${s}` : `${String(m)}:${s}`;
}
