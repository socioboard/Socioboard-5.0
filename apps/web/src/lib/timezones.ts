import type { ComboboxOption } from '@socioboard/ui';

import { RENAMED_CITIES } from './time';

export { browserTimezone } from './time';

function zoneName(timeZone: string, style: 'shortOffset' | 'long', at: Date): string {
  return (
    new Intl.DateTimeFormat('en', { timeZone, timeZoneName: style })
      .formatToParts(at)
      .find((part) => part.type === 'timeZoneName')?.value ?? ''
  );
}

/** "GMT+5:30" → minutes east of UTC, for sorting. */
function offsetMinutes(offset: string): number {
  const match = /GMT([+-])(\d{1,2})(?::(\d{2}))?/.exec(offset);
  if (!match) return 0;
  const minutes = Number(match[2]) * 60 + Number(match[3] ?? 0);
  return match[1] === '-' ? -minutes : minutes;
}

/**
 * Every IANA time zone this browser knows, labelled by city with its current UTC offset, sorted
 * west to east. Search also matches the region, the full ID and the zone's long name ("India
 * Standard Time", "Eastern Daylight Time"). `include` is always listed, even when the browser's
 * list omits it (UTC, or a legacy ID it reports for itself). About 60 ms; build it once per page.
 */
export function timezoneOptions(include: readonly string[] = [], at = new Date()) {
  const ids = new Set(['UTC', ...include, ...Intl.supportedValuesOf('timeZone')]);
  const options: (ComboboxOption & { minutes: number })[] = [];
  for (const id of ids) {
    let offset: string;
    let long: string;
    try {
      offset = zoneName(id, 'shortOffset', at);
      long = zoneName(id, 'long', at);
    } catch {
      continue; // an ID this browser can't format isn't one the server would accept either
    }
    const parts = id.split('/');
    const last = parts.at(-1) ?? id;
    const city = (RENAMED_CITIES[last] ?? last).replaceAll('_', ' ');
    options.push({
      value: id,
      label: id === 'UTC' ? 'UTC' : city,
      hint: offset === 'GMT' ? 'GMT+0' : offset,
      keywords: [...parts, last, long].join(' ').replaceAll('_', ' '),
      minutes: offsetMinutes(offset),
    });
  }
  options.sort((a, b) => a.minutes - b.minutes || a.label.localeCompare(b.label));
  return options.map(({ minutes: _minutes, ...option }) => option);
}
