// Translations (docs/frontend/README.md): English at launch, every string translatable. Namespaces
// map to files in locales/<lang>/.
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import account from '../locales/en/account.json';
import auth from '../locales/en/auth.json';
import common from '../locales/en/common.json';
import errors from '../locales/en/errors.json';
import onboarding from '../locales/en/onboarding.json';
import settings from '../locales/en/settings.json';
import shell from '../locales/en/shell.json';
import { ApiError } from './api';

export const resources = {
  en: { common, errors, auth, onboarding, shell, settings, account },
} as const;

void i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  ns: ['common', 'errors', 'auth', 'onboarding', 'shell', 'settings', 'account'],
  defaultNS: 'common',
  interpolation: { escapeValue: false }, // React already escapes
  returnNull: false,
});

export default i18n;

/**
 * The message to show for a failed request: a translated message for known error codes, else a
 * generic message with the request ID so support can find the failure in the logs.
 */
export function errorMessage(error: unknown): string {
  const t = i18n.getFixedT(null, 'errors');
  if (error instanceof ApiError) {
    if (i18n.exists(`codes.${error.code}`, { ns: 'errors' })) {
      return t(`codes.${error.code}` as 'codes.NETWORK_ERROR');
    }
    if (error.requestId) return t('genericWithId', { requestId: error.requestId });
  }
  return t('generic');
}

/** An `?error=CODE` from an emailed link (verification, magic link, reset) as a message. */
export function linkErrorMessage(code: string): string {
  // Social sign-in errors are lowercase OAuth codes; some share a name with an API code
  // (invalid_code vs a wrong 2FA code), so they have their own section.
  if (i18n.exists(`providers.${code}`, { ns: 'errors' })) {
    return i18n.getFixedT(null, 'errors')(`providers.${code}` as 'providers.access_denied');
  }
  return errorMessage(new ApiError(400, code.toUpperCase(), '', undefined));
}
