'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { ExternalLink, Phone } from 'lucide-react'
import { diasporaSupportConfig } from '@/config/crisis.config'
import { CrisisMap } from '@/components/map/CrisisMap'
import { RegionScopeTabs } from '@/components/map/RegionScopeTabs'
import { MapAccessibleList } from '@/components/map/MapAccessibleList'
import type { MapMarker, Organization, VigilEvent } from '@/types/vigil.types'

interface ApoyoUsaHubProps {
  markers: MapMarker[]
  organizations: Organization[]
}

export function ApoyoUsaHub({ markers, organizations }: ApoyoUsaHubProps) {
  const t = useTranslations('diasporaHub')
  const locale = useLocale()
  const [events, setEvents] = useState<VigilEvent[]>([])
  const [exchangeCount, setExchangeCount] = useState(0)

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch('/api/events?upcoming=true&region_scope=usa_diaspora')
      const data = (await res.json()) as { events?: VigilEvent[] }
      setEvents(data.events ?? [])
    } catch {
      setEvents([])
    }
  }, [])

  useEffect(() => {
    void fetchEvents()
  }, [fetchEvents])

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch('/api/resource-exchange?region_scope=usa_diaspora')
        const data = (await res.json()) as { entries?: unknown[] }
        setExchangeCount(data.entries?.length ?? 0)
      } catch {
        setExchangeCount(0)
      }
    })()
  }, [])

  const legalNote =
    locale === 'en' ? diasporaSupportConfig.legal_note_en : diasporaSupportConfig.legal_note_es

  const orgPreview = useMemo(() => organizations.slice(0, 4), [organizations])

  return (
    <div className="mx-auto max-w-5xl p-4 pb-24">
      <RegionScopeTabs />

      <h1 className="mt-4 font-display text-[26px] font-semibold text-vigil-ink">{t('title')}</h1>
      <p className="mt-1 text-[16px] text-vigil-muted">{t('subtitle')}</p>

      <section className="mt-4 rounded-card border border-slate-200 bg-vigil-blue-light p-4">
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-vigil-blue" aria-hidden />
          <p className="text-[16px] font-medium text-vigil-ink">{t('emergency.title')}</p>
        </div>
        <a
          href={`tel:${diasporaSupportConfig.emergency_number}`}
          className="mt-2 inline-block rounded bg-status-missing px-3 py-1 font-mono text-[17px] font-bold text-white"
        >
          {diasporaSupportConfig.emergency_number}
        </a>
        <p className="mt-2 text-[13px] text-vigil-muted">{legalNote}</p>
      </section>

      <div className="mt-6 h-[min(50vh,420px)] min-h-[280px]">
        <CrisisMap markers={markers} regionScope="usa_diaspora" />
      </div>
      <MapAccessibleList markers={markers} />

      <section className="mt-10">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-[20px] font-semibold text-vigil-ink">{t('orgs.title')}</h2>
          <Link href="/organizaciones?region=usa_diaspora" className="text-[13px] text-vigil-blue">
            {t('viewAll')} →
          </Link>
        </div>
        <p className="mt-1 text-[13px] text-status-unverified">{t('orgs.verifyNote')}</p>
        <div className="mt-4 space-y-3">
          {orgPreview.map((org) => (
            <article key={org.id} className="rounded-card border border-slate-200 bg-white p-4">
              <h3 className="text-[17px] font-medium text-vigil-ink">{org.name}</h3>
              {org.location_label && (
                <p className="mt-1 text-[13px] text-vigil-muted">{org.location_label}</p>
              )}
              {org.website && (
                <a
                  href={org.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-[16px] text-vigil-blue"
                >
                  {t('orgs.website')} <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </article>
          ))}
          {orgPreview.length === 0 && (
            <p className="text-[16px] text-vigil-muted">{t('orgs.empty')}</p>
          )}
        </div>
      </section>

      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        <Link
          href="/intercambio?region=usa_diaspora"
          className="rounded-card border border-slate-200 bg-white p-4 hover:border-vigil-blue"
        >
          <h2 className="text-[17px] font-medium text-vigil-ink">{t('exchange.title')}</h2>
          <p className="mt-1 text-[13px] text-vigil-muted">{t('exchange.desc')}</p>
          {exchangeCount > 0 && (
            <p className="mt-2 font-mono text-[13px] text-vigil-muted">
              {t('exchange.count', { count: exchangeCount })}
            </p>
          )}
        </Link>
        <Link
          href="/calendario?region=usa_diaspora"
          className="rounded-card border border-slate-200 bg-white p-4 hover:border-vigil-blue"
        >
          <h2 className="text-[17px] font-medium text-vigil-ink">{t('events.title')}</h2>
          <p className="mt-1 text-[13px] text-vigil-muted">{t('events.desc')}</p>
          {events.length > 0 && (
            <p className="mt-2 font-mono text-[13px] text-vigil-muted">
              {t('events.count', { count: events.length })}
            </p>
          )}
        </Link>
      </section>

      <Link href="/voluntarios" className="mt-8 inline-block text-[16px] text-vigil-blue underline">
        {t('volunteerLink')} →
      </Link>
    </div>
  )
}
