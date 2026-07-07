import { getTranslations } from 'next-intl/server'
import { ExternalLink } from 'lucide-react'
import { DEPLOYMENTS } from '@/config/deployments/registry'

export const metadata = {
  title: 'Regiones — Vigil',
  description: 'Despliegues activos de Vigil por región.',
}

export default async function RegionesPage() {
  const t = await getTranslations('deploymentSuggestion')
  const live = DEPLOYMENTS.filter((d) => d.status === 'live')

  return (
    <div className="mx-auto max-w-2xl p-4 pb-24">
      <h1 className="font-display text-[26px] font-semibold text-vigil-ink">{t('regionsTitle')}</h1>
      <p className="mt-1 text-[16px] text-vigil-muted">{t('regionsSubtitle')}</p>

      <div className="mt-6 space-y-3">
        {live.map((d) => (
          <a
            key={d.id}
            href={d.url ?? '#'}
            className="flex min-h-[56px] items-center justify-between rounded-card border border-slate-200 bg-white px-4 py-3 hover:border-vigil-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vigil-blue/40"
          >
            <span className="text-[16px] font-medium text-vigil-ink">{d.label}</span>
            <ExternalLink className="h-4 w-4 shrink-0 text-vigil-blue" aria-hidden />
          </a>
        ))}
      </div>

      <p className="mt-6 text-[13px] leading-relaxed text-vigil-muted">{t('regionsPrivacyNote')}</p>
    </div>
  )
}
