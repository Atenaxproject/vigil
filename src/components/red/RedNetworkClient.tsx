'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ExternalLink } from 'lucide-react'
import { CRISIS_CONFIG } from '@/config/crisis.config'

const DTV_PLATFORM_URL = 'https://desaparecidosterremotovenezuela.com'

export function RedNetworkClient() {
  const t = useTranslations('red')
  const sisterPlatforms = CRISIS_CONFIG.partnerLinks.filter((p) => p.type === 'sister-platform')
  const dtv = sisterPlatforms.find((p) => 'integrated' in p && p.integrated)
  const others = sisterPlatforms.filter((p) => !('integrated' in p && p.integrated))

  return (
    <div className="mx-auto max-w-2xl p-4 pb-24">
      <h1 className="font-display text-[26px] font-semibold text-vigil-ink">{t('title')}</h1>
      <p className="mt-1 text-[16px] text-vigil-muted">{t('subtitle')}</p>

      {dtv && (
        <section className="mt-8 rounded-card border border-amber-200 bg-status-unverified-bg p-5">
          <span className="inline-flex rounded-full border border-amber-300 bg-white px-3 py-1 text-[13px] font-medium text-status-unverified">
            {t('featured.badge')}
          </span>
          <h2 className="mt-3 text-[20px] font-semibold text-vigil-ink">{dtv.name}</h2>
          <p className="mt-2 text-[16px] leading-relaxed text-vigil-body">{t('featured.description')}</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {(['federated', 'facial', 'centers', 'refresh'] as const).map((key) => (
              <li
                key={key}
                className="rounded-full border border-amber-200 bg-white px-3 py-1 text-[13px] text-vigil-body"
              >
                {t(`featured.capabilities.${key}`)}
              </li>
            ))}
          </ul>
          <a
            href={DTV_PLATFORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex min-h-[44px] items-center gap-2 text-[16px] font-medium text-vigil-blue hover:underline"
          >
            {t('featured.visit')}
            <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
          </a>
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-[20px] font-semibold text-vigil-ink">{t('othersTitle')}</h2>
        <div className="mt-4 space-y-3">
          {others.map((platform) => {
            const slug =
              'slug' in platform && platform.slug ? platform.slug : 'venezuelaTeBusca'
            const descriptionKey = `platforms.${slug}` as
              | 'platforms.venezuelaTeBusca'
              | 'platforms.desaparecidosTerremoto'
              | 'platforms.redQuipu'
              | 'platforms.mapaDanosVenezuela'
            return (
              <a
                key={platform.url}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-card border border-slate-200 bg-white p-4 hover:border-vigil-blue"
              >
                <p className="flex items-center gap-1 text-[16px] font-medium text-vigil-blue">
                  {platform.name}
                  <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
                </p>
                <p className="mt-1 text-[16px] text-vigil-body">{t(descriptionKey)}</p>
              </a>
            )
          })}
        </div>
      </section>

      <p className="mt-8 text-[16px] text-vigil-muted">
        {t('reportHint')}{' '}
        <Link href="/reportar" className="font-medium text-vigil-blue hover:underline">
          {t('reportLink')}
        </Link>
      </p>
    </div>
  )
}
