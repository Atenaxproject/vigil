import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export const metadata = {
  title: 'Sin conexión — Vigil',
}

export default async function OfflinePage() {
  const t = await getTranslations('offline')

  return (
    <main className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center px-4 py-12 text-center">
      <h1 className="font-display text-2xl font-semibold text-vigil-ink">{t('title')}</h1>
      <p className="mt-4 text-[13px] leading-relaxed text-slate-600">{t('message')}</p>
      <Link
        href="/"
        className="mt-8 min-h-[44px] rounded-input bg-vigil-blue px-6 py-2.5 text-[13px] font-medium text-white"
      >
        {t('retry')}
      </Link>
    </main>
  )
}
