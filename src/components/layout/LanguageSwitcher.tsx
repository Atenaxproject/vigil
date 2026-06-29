'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { Globe } from 'lucide-react'
import { CRISIS_CONFIG, type SupportedLang } from '@/config/crisis.config'

const localeLabels: Record<SupportedLang, string> = {
  es: 'ES',
  en: 'EN',
  pt: 'PT',
  fr: 'FR',
  it: 'IT',
  zh: 'ZH',
  de: 'DE',
  ru: 'RU',
}

export function LanguageSwitcher() {
  const t = useTranslations('common')
  const locale = useLocale() as SupportedLang
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function setLocale(next: SupportedLang) {
    document.cookie = `NEXT_LOCALE=${next};path=/;max-age=31536000`
    startTransition(() => router.refresh())
  }

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-vigil-muted" aria-hidden />
      <label htmlFor="locale-select" className="sr-only">
        {t('language')}
      </label>
      <select
        id="locale-select"
        value={locale}
        disabled={isPending}
        onChange={(e) => setLocale(e.target.value as SupportedLang)}
        className="rounded-input border border-slate-200 bg-white px-2 py-1 text-[13px] focus:outline-none focus:ring-2 focus:ring-vigil-blue/20"
      >
        {CRISIS_CONFIG.supportedLangs.map((code) => (
          <option key={code} value={code}>
            {localeLabels[code]}
          </option>
        ))}
      </select>
    </div>
  )
}
