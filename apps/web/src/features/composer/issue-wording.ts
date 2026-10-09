import { networkName } from '@socioboard/ui';
import { useTranslation } from 'react-i18next';

import { formatBytes } from '../../lib/format';
import { formatRatio, type ComposerIssue } from './validation';

/** "3 seconds", "2 minutes", "90 seconds": in the reader's language (Intl units). */
function duration(sec: number, locale: string): string {
  const whole = sec >= 60 && sec % 60 === 0;
  return new Intl.NumberFormat(locale, {
    style: 'unit',
    unit: whole ? 'minute' : 'second',
    unitDisplay: 'long',
  }).format(whole ? sec / 60 : Math.round(sec));
}

/**
 * An issue in the composer's words, from its code and details, naming the network, account or
 * file it's about. Codes the composer has no words for fall back to the server's text.
 */
export function useIssueWording(names: {
  account: (id: string) => string | undefined;
  file: (id: string) => string | undefined;
}) {
  const { t, i18n } = useTranslation('composer');
  const locale = i18n.language;
  const number = (n: string | number | undefined) =>
    typeof n === 'number' ? new Intl.NumberFormat(locale).format(n) : (n ?? '');
  return (issue: ComposerIssue): string => {
    const key = `issues.codes.${issue.code}`;
    if (!i18n.exists(key, { ns: 'composer' })) return issue.fallback || issue.code;
    const p = issue.params;
    const num = (k: string) => Number(p[k]);
    const values: Record<string, string> = {
      network: issue.network ? networkName(issue.network) : '',
      account: (issue.accountId && names.account(issue.accountId)) ?? '',
      file: (issue.mediaId && names.file(issue.mediaId)) ?? t('issues.aFile'),
      max: number(p.max),
      actual: number(p.actual),
      min: number(p.min),
    };
    switch (issue.code) {
      case 'TEXT_TOO_LONG':
        values.over = number(num('actual') - num('max'));
        break;
      case 'IMAGE_TOO_LARGE':
      case 'VIDEO_TOO_LARGE':
        values.max = formatBytes(num('maxBytes'), locale);
        break;
      case 'ASPECT_RATIO':
        values.min = formatRatio(num('min'));
        values.max = formatRatio(num('max'));
        values.actual = formatRatio(num('actual'));
        break;
      case 'VIDEO_TOO_SHORT':
        values.min = duration(num('minSec'), locale);
        break;
      case 'VIDEO_TOO_LONG':
        values.max = duration(num('maxSec'), locale);
        break;
      case 'MEDIA_REQUIRED':
        if (issue.network === 'youtube') {
          return (i18n.getFixedT(null, 'composer') as (k: string, o: object) => string)(
            'issues.codes.MEDIA_REQUIRED_VIDEO',
            values,
          );
        }
        break;
      case 'MEDIA_KIND_NOT_SUPPORTED':
        values.kind = t(`issues.kinds.${String(p.kind)}` as 'issues.kinds.gif');
        break;
    }
    // The key is built from the code, so it's looked up untyped (checked with exists above).
    return (i18n.getFixedT(null, 'composer') as (k: string, o: object) => string)(key, values);
  };
}
