import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'
import { CRISIS_CONFIG, type SupportedLang } from '@/config/crisis.config'

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value as SupportedLang | undefined
  const locale =
    cookieLocale && CRISIS_CONFIG.supportedLangs.includes(cookieLocale)
      ? cookieLocale
      : CRISIS_CONFIG.defaultLang

  return {
    locale,
    messages: (await import(`./locales/${locale}.json`)).default,
  }
})
