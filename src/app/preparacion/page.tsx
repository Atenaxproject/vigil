import Link from 'next/link'
import { getLocale, getTranslations } from 'next-intl/server'
import { ChevronRight } from 'lucide-react'
import { getGuideIndex } from '@/content/preparedness'

export async function generateMetadata() {
  const t = await getTranslations('prep')
  return {
    title: `${t('title')} — Vigil`,
    description: t('subtitle'),
  }
}

export default async function PreparacionPage() {
  const locale = await getLocale()
  const t = await getTranslations('prep')
  const guides = getGuideIndex(locale)
  const current = guides.filter((g) => g.currentDeployment)
  const others = guides.filter((g) => !g.currentDeployment)

  const card = (guide: (typeof guides)[number]) => (
    <Link
      key={guide.archetype}
      href={`/preparacion/${guide.archetype}`}
      className="flex items-center gap-3 rounded-card border border-slate-200 bg-white p-4 hover:border-vigil-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vigil-blue/40"
    >
      <span className="min-w-0 flex-1">
        <span className="block text-[17px] font-semibold text-vigil-ink">{guide.title}</span>
        <span className="mt-1 block text-[13px] leading-snug text-vigil-muted">{guide.summary}</span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-vigil-muted" aria-hidden />
    </Link>
  )

  return (
    <div className="mx-auto max-w-2xl p-4 pb-24">
      <h1 className="font-display text-[26px] font-semibold text-vigil-ink">{t('title')}</h1>
      <p className="mt-1 text-[16px] text-vigil-muted">{t('subtitle')}</p>
      <p className="mt-2 text-[13px] text-vigil-muted">{t('offlineHint')}</p>

      <div className="mt-6 space-y-3">{current.map(card)}</div>

      {others.length > 0 && (
        <>
          <h2 className="mt-8 text-[20px] font-semibold text-vigil-ink">{t('otherEmergencies')}</h2>
          <div className="mt-3 space-y-3">{others.map(card)}</div>
        </>
      )}
    </div>
  )
}
