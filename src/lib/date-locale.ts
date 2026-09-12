/**
 * date-fns locale map for Vigil's 8 next-intl languages, plus Haitian Creole
 * ('ht') ahead of Florida activation — required in florida.config.ts's
 * supportedLangs, so this must exist before Florida's supportedLangs is ever
 * wired in, or relative timestamps would silently fall back to Spanish on a
 * Haitian Creole UI. Falls back to Spanish only for a truly unexpected locale
 * string.
 */
import type { Locale } from 'date-fns'
import { de, enUS, es, fr, ht, it, pt, ru, zhCN } from 'date-fns/locale'

const LOCALE_MAP: Record<string, Locale> = {
  es,
  en: enUS,
  pt,
  fr,
  it,
  de,
  ru,
  zh: zhCN,
  ht,
}

export function getDateFnsLocale(locale: string): Locale {
  return LOCALE_MAP[locale] ?? es
}
