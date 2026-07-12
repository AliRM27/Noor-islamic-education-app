import { useUserStore } from '../store/userStore';
import { translations, TranslationKey } from './translations';

export type { Locale, TranslationKey } from './translations';

export function t(key: TranslationKey, params?: Record<string, string | number>): string {
  const locale = useUserStore.getState().locale;
  let text: string = translations[locale][key] ?? translations.en[key];
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(`{${k}}`, String(v));
    }
  }
  return text;
}
