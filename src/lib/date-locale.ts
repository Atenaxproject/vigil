/**
 * date-fns locale map for Vigil's 8 next-intl languages.
 * Falls back to Spanish when an unexpected locale string appears.
 */
import type { Locale } from 'date-fns'
import { de, enUS, es, fr, it, pt, ru, zhCN } from 'date-fns/locale'

const LOCALE_MAP: Record<string, Locale> = {
  es,
  en: enUS,
  pt,
  fr,
  it,
  de,
  ru,
  zh: zhCN,
}

export function getDateFnsLocale(locale: string): Locale {
  return LOCALE_MAP[locale] ?? es
}
