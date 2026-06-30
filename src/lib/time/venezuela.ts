const VENEZUELA_TZ = 'America/Caracas'

export function formatVenezuelaTime(
  date: Date | string,
  locale = 'es',
  options: Intl.DateTimeFormatOptions = {}
): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString(locale === 'es' ? 'es-VE' : 'en-US', {
    timeZone: VENEZUELA_TZ,
    ...options,
  })
}

export function formatVenezuelaDateTime(date: Date | string, locale = 'es'): string {
  const formatted = formatVenezuelaTime(date, locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
  return formatted
}

export function formatVenezuelaClock(now = new Date(), locale = 'es'): string {
  return formatVenezuelaTime(now, locale, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export function formatVenezuelaDateKey(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-CA', { timeZone: VENEZUELA_TZ })
}

export const VENEZUELA_TZ_LABEL = {
  es: 'hora de Venezuela',
  en: 'Venezuela time',
} as const
