import { Locale } from './translations';

// Picks the German version of an API content field (topic/lesson titles, Dua
// translations) when locale is German and a translation exists, else English.
export function pick(locale: Locale, en: string, de?: string): string {
  return locale === 'de' && de ? de : en;
}
