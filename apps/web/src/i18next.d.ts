// Typed translation keys: t('app.name') is checked against locales/en.
import 'i18next';

import type { resources } from './lib/i18n';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: (typeof resources)['en'];
  }
}
