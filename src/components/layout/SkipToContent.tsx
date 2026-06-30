import { getTranslations } from 'next-intl/server'

export async function SkipToContent() {
  const t = await getTranslations('a11y')

  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[9999] focus:rounded-input focus:bg-vigil-blue focus:px-4 focus:py-2 focus:text-white"
    >
      {t('skipToContent')}
    </a>
  )
}
