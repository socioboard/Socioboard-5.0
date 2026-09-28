// First match wins, so the order matters: Edge and Opera also claim Chrome, Chrome also claims
// Safari, and iPhones and Android phones also claim Mac OS X and Linux.
const BROWSERS: [needle: string, name: string][] = [
  ['Edg/', 'Edge'],
  ['OPR/', 'Opera'],
  ['Firefox/', 'Firefox'],
  ['Chrome/', 'Chrome'],
  ['Safari/', 'Safari'],
];
const SYSTEMS: [needle: string, name: string][] = [
  ['iPhone', 'iOS'],
  ['iPad', 'iOS'],
  ['Android', 'Android'],
  ['CrOS', 'ChromeOS'],
  ['Windows', 'Windows'],
  ['Mac OS X', 'macOS'],
  ['Linux', 'Linux'],
];

const find = (ua: string, table: [string, string][]) =>
  table.find(([needle]) => ua.includes(needle))?.[1];

/** A readable device ("Chrome on Windows") from a User-Agent, good enough to recognise a session. */
export function describeUserAgent(ua: string | null): { browser: string; os: string } | null {
  if (!ua) return null;
  const browser = find(ua, BROWSERS);
  const os = find(ua, SYSTEMS);
  return browser && os ? { browser, os } : null;
}

/**
 * An IP address as people write it. Better Auth stores IPv6 cut to its /64 network and spelled out
 * in full ("2001:0db8:0000:0000:0000:0000:0000:0000"); show it short ("2001:db8::"), and nothing
 * for the all-zero address (a local connection).
 */
export function formatIp(ip: string | null): string | null {
  if (!ip?.includes(':')) return ip;
  const groups = ip.split(':').map((g) => g.replace(/^0+(?=.)/, ''));
  if (groups.length !== 8) return ip; // already short, or not an address we recognise
  // The longest run of zero groups becomes "::".
  let best = { start: -1, length: 0 };
  for (let i = 0; i < 8;) {
    if (groups[i] !== '0') {
      i += 1;
      continue;
    }
    let j = i;
    while (j < 8 && groups[j] === '0') j += 1;
    if (j - i > best.length) best = { start: i, length: j - i };
    i = j;
  }
  if (best.length === 8) return null;
  if (best.length < 2) return groups.join(':');
  const head = groups.slice(0, best.start).join(':');
  const tail = groups.slice(best.start + best.length).join(':');
  return `${head}::${tail}`;
}
