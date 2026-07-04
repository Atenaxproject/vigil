'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { ExternalLink } from 'lucide-react'
import type { Organization, RegionScope } from '@/types/vigil.types'
import { VerifiedBadge } from '@/components/ui/VerifiedBadge'
import { cn } from '@/lib/utils'

const ORG_TYPES = [
  'rescue',
  'medical',
  'food',
  'shelter',
  'child_protection',
  'translation',
  'tech',
  'government',
  'diaspora',
  'donation',
  'legal',
] as const

interface OrganizacionesDirectoryProps {
  organizations: Organization[]
  regionScope?: RegionScope
}

export function OrganizacionesDirectory({
  organizations,
  regionScope = 'venezuela',
}: OrganizacionesDirectoryProps) {
  const t = useTranslations('organizations')
  const locale = useLocale()
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const filtered = useMemo(() => {
    if (typeFilter === 'all') return organizations
    return organizations.filter((org) => org.type === typeFilter)
  }, [organizations, typeFilter])

  return (
    <div className="mx-auto max-w-3xl p-4 pb-24">
      <h1 className="font-display text-[26px] font-semibold text-vigil-ink">{t('title')}</h1>
      <p className="mt-1 text-[16px] text-vigil-muted">{t('subtitle')}</p>
      {regionScope === 'usa_diaspora' && (
        <p className="mt-2 text-[13px] text-status-unverified">{t('usaVerifyNote')}</p>
      )}

      <div className="mt-4 rounded-card border border-amber-200 bg-status-unverified-bg p-4 text-[16px] text-amber-900">
        {t('fraudWarning')}
      </div>

      <p className="mt-4 text-[16px] text-vigil-muted">{t('registerNote')}</p>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label={t('filterLabel')}>
        <button
          type="button"
          onClick={() => setTypeFilter('all')}
          className={cn(
            'min-h-[36px] rounded-badge border px-3 text-[13px] font-medium',
            typeFilter === 'all'
              ? 'border-vigil-blue bg-vigil-blue-light text-vigil-blue'
              : 'border-slate-200 bg-white text-vigil-muted'
          )}
        >
          {t('filterAll')}
        </button>
        {ORG_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setTypeFilter(type)}
            className={cn(
              'min-h-[36px] rounded-badge border px-3 text-[13px] font-medium',
              typeFilter === type
                ? 'border-vigil-blue bg-vigil-blue-light text-vigil-blue'
                : 'border-slate-200 bg-white text-vigil-muted'
            )}
          >
            {t(`types.${type}`)}
          </button>
        ))}
      </div>

      <p className="mt-4 font-mono text-[13px] text-vigil-muted">
        {t('count', { count: filtered.length })}
      </p>

      <div className="mt-4 space-y-3">
        {filtered.length === 0 && (
          <p className="py-8 text-center text-[16px] text-vigil-muted">{t('empty')}</p>
        )}
        {filtered.map((org) => {
          const desc =
            locale === 'en' && org.description_en ? org.description_en : org.description_es
          return (
            <article
              key={org.id}
              className="rounded-card border border-slate-200 bg-white p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="text-[17px] font-medium text-vigil-ink">{org.name}</h2>
                  {org.type && (
                    <p className="mt-0.5 text-[13px] text-vigil-muted">
                      {t(`types.${org.type as 'rescue'}`)}
                    </p>
                  )}
                </div>
                {org.verified && <VerifiedBadge />}
              </div>
              {desc && <p className="mt-2 text-[16px] text-vigil-body">{desc}</p>}
              {org.location_label && (
                <p className="mt-1 text-[13px] text-vigil-muted">{org.location_label}</p>
              )}
              <div className="mt-3 flex flex-wrap gap-3">
                {org.website && (
                  <a
                    href={org.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[16px] text-vigil-blue"
                  >
                    {t('website')}
                    <ExternalLink className="h-3 w-3" aria-hidden />
                  </a>
                )}
                {org.donation_link && (
                  <a
                    href={org.donation_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[44px] items-center rounded-input bg-vigil-blue px-4 text-[16px] font-medium text-white"
                  >
                    {t('donate')}
                  </a>
                )}
              </div>
            </article>
          )
        })}
      </div>

      <Link href="/como-ayudar" className="mt-8 inline-block text-[16px] text-vigil-blue underline">
        {t('howToHelpLink')} →
      </Link>
    </div>
  )
}
