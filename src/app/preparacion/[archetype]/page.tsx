import { notFound } from 'next/navigation'
import { getLocale, getTranslations } from 'next-intl/server'
import { ExternalLink } from 'lucide-react'
import { getPreparednessGuide, PREPAREDNESS_ARCHETYPES } from '@/content/preparedness'
import { GuideSections } from '@/components/preparedness/GuideSections'
import { SupplyChecklist } from '@/components/preparedness/SupplyChecklist'
import { FamilyPlanBuilder } from '@/components/preparedness/FamilyPlanBuilder'
import { OfflineNote } from '@/components/preparedness/OfflineNote'

interface GuidePageProps {
  params: Promise<{ archetype: string }>
}

export function generateStaticParams() {
  return PREPAREDNESS_ARCHETYPES.map((archetype) => ({ archetype }))
}

export async function generateMetadata(props: GuidePageProps) {
  const params = await props.params
  const locale = await getLocale()
  const guide = getPreparednessGuide(params.archetype, locale)
  if (!guide) return {}
  return {
    title: `${guide.title} — Vigil`,
    description: guide.summary,
    openGraph: { title: guide.title, description: guide.summary },
  }
}

export default async function GuidePage(props: GuidePageProps) {
  const params = await props.params
  const locale = await getLocale()
  const guide = getPreparednessGuide(params.archetype, locale)
  if (!guide) notFound()

  const t = await getTranslations('prep')

  return (
    <div className="prep-guide mx-auto max-w-2xl p-4 pb-24">
      <OfflineNote />
      <h1 className="font-display text-[26px] font-semibold text-vigil-ink">{guide.title}</h1>
      <p className="mt-2 text-[16px] leading-relaxed text-vigil-body">{guide.summary}</p>
      <p className="mt-1 font-mono text-[13px] text-vigil-muted">
        {t('lastReviewed', { date: guide.lastReviewed })}
      </p>

      <GuideSections sections={guide.sections} />

      <SupplyChecklist archetype={guide.archetype} items={guide.supplyChecklist} />

      <FamilyPlanBuilder archetype={guide.archetype} prompts={guide.familyPlanPrompts} />

      <section className="mt-10 border-t border-slate-200 pt-6 print:border-black">
        <h2 className="text-[20px] font-semibold text-vigil-ink">{t('sourcesTitle')}</h2>
        <p className="mt-1 text-[13px] text-vigil-muted">{t('sourcesNote')}</p>
        <ul className="mt-3 space-y-2">
          {guide.sources.map((source) => (
            <li key={source.url}>
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center gap-1.5 text-[16px] text-vigil-blue hover:underline"
              >
                {source.label}
                <ExternalLink className="h-3.5 w-3.5 shrink-0 print:hidden" aria-hidden />
              </a>
              <span className="hidden font-mono text-[11px] text-slate-600 print:inline"> — {source.url}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
