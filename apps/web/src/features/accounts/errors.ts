import { ConnectErrorCode } from '@socioboard/contracts';

import i18n from '../../lib/i18n';

/**
 * A connect's `?error=` / `?connectError=` code as a readable sentence. Anything unknown (an old
 * link, a hand-edited URL) reads as the network failing, never as raw text from the URL.
 */
export function connectErrorText(code: string): string {
  const parsed = ConnectErrorCode.safeParse(code);
  const known = parsed.success ? parsed.data : 'NETWORK_ERROR';
  return i18n.getFixedT(null, 'accounts')(`connectError.${known}`);
}
