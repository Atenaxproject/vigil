'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { CRISIS_CONFIG } from '@/config/crisis.config'
import { ReportBadNumberButton } from '@/components/directory/ReportBadNumberButton'

type ServiceType = 'publico' | 'privado'

interface DirectoryEntry {
  id: string
  label: string
  numbers: readonly string[]
  service_type: ServiceType
  carrierAccess?: string
  label_short?: string
  source: string
  verified_at?: string
  note?: string
  states: readonly string[]
}

const ALL_STATES = [
  ...CRISIS_CONFIG.directoryStatePriority,
  'Zulia',
  'Guárico',
  'Trujillo',
  'Lara',
  'Anzoátegui',
  'Bolívar',
  'Otros',
] as const

function telHref(num: string): string {
  return `tel:${encodeURIComponent(num.replace(/[^\d*+#]/g, ''))}`
}

function mapContact(
  c: (typeof CRISIS_CONFIG.emergencyContacts)[number],
  locale: string
): DirectoryEntry {
  return {
    id: c.id,
    label: locale === 'en' ? c.label_en : c.label_es,
    numbers: c.numbers,
    service_type: c.service_type,
    carrierAccess: 'carrierAccess' in c ? c.carrierAccess : undefined,
    label_short: 'label_short' in c ? c.label_short : undefined,
    source: c.source,
    verified_at: 'verified_at' in c ? c.verified_at : undefined,
    note:
      locale === 'en'
        ? 'note_en' in c
          ? c.note_en
          : undefined
        : 'note_es' in c
          ? c.note_es
          : undefined,
    states: c.states,
  }
}

export function EmergencyDirectory({ locale = 'es' }: { locale?: string }) {
  const t = useTranslations('crisisInfo.directory')
  const [selectedState, setSelectedState] = useState<string>('La Guaira')
  const [reportCounts, setReportCounts] = useState<Record<string, number>>({})
  const [threshold, setThreshold] = useState<number>(CRISIS_CONFIG.directoryBadNumberThreshold)

  useEffect(() => {
    void fetch('/api/directory/report-counts')
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { counts?: Record<string, number>; threshold?: number } | null) => {
        if (data?.counts) setReportCounts(data.counts)
        if (typeof data?.threshold === 'number') setThreshold(data.threshold)
      })
      .catch(() => {
        /* ignore */
      })
  }, [])

  const national = useMemo(() => {
    return CRISIS_CONFIG.emergencyContacts
      .filter((c) => (c.states as readonly string[]).includes('nacional'))
      .map((c) => mapContact(c, locale))
  }, [locale])

  const stateLocal = useMemo(() => {
    return CRISIS_CONFIG.emergencyContacts
      .filter((c) => (c.states as readonly string[]).includes(selectedState))
      .filter((c) => !(c.states as readonly string[]).includes('nacional') || c.states.length > 1)
      .map((c) => mapContact(c, locale))
  }, [locale, selectedState])

  const stateOnly = stateLocal.filter((e) => !national.some((n) => n.id === e.id))

  const renderEntry = useCallback(
    (entry: DirectoryEntry) => {
      const reports = reportCounts[entry.id] ?? 0
      const marked = reports >= threshold
      const isPrivate = entry.service_type === 'privado'

      return (
        <div
          key={entry.id}
          className={`rounded-card border p-4 ${
            isPrivate ? 'border-status-unverified bg-status-unverified-bg' : 'border-slate-200 bg-white'
          }`}
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-[16px] font-medium text-vigil-ink">{entry.label}</p>
              {entry.label_short && (
                <p className="mt-0.5 font-mono text-[13px] text-vigil-muted">{entry.label_short}</p>
              )}
              <p
                className={`mt-1 inline-block rounded-badge px-2 py-0.5 text-[13px] font-medium ${
                  isPrivate
                    ? 'bg-status-unverified/15 text-status-unverified'
                    : 'bg-status-alive-bg text-status-alive'
                }`}
              >
                {isPrivate ? t('servicePrivate') : t('servicePublic')}
              </p>
            </div>
            <ReportBadNumberButton entryId={entry.id} />
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {entry.numbers.map((num) => (
              <a
                key={num}
                href={telHref(num)}
                className="inline-flex min-h-[44px] items-center rounded-input border border-vigil-blue/30 bg-vigil-blue-light px-3 font-mono text-[17px] font-medium text-vigil-blue"
              >
                {num}
              </a>
            ))}
          </div>
          {entry.carrierAccess && (
            <p className="mt-2 text-[13px] text-vigil-muted">{entry.carrierAccess}</p>
          )}
          {entry.note && <p className="mt-1 text-[13px] text-vigil-muted">{entry.note}</p>}
          <p className="mt-1 font-mono text-[13px] text-vigil-muted">
            {t('source')}: {entry.source}
            {entry.verified_at ? ` · ${entry.verified_at}` : ''}
          </p>
          {marked && (
            <p className="mt-2 text-[13px] font-medium text-status-missing">{t('reportedUnavailable')}</p>
          )}
        </div>
      )
    },
    [reportCounts, t, threshold]
  )

  return (
    <div>
      <h2 className="text-[20px] font-semibold text-vigil-ink">{t('title')}</h2>
      <p className="mt-1 text-[16px] text-vigil-muted">{t('subtitle')}</p>
      <p className="mt-2 rounded-card border border-status-alive/30 bg-status-alive-bg px-3 py-2 text-[16px] text-status-alive">
        {t('offlineAvailable')}
      </p>

      <h3 className="mt-6 text-[17px] font-medium text-vigil-ink">{t('nationalTitle')}</h3>
      <div className="mt-3 space-y-3">{national.map(renderEntry)}</div>

      <h3 className="mt-8 text-[17px] font-medium text-vigil-ink">{t('byStateTitle')}</h3>
      <label className="mt-2 block text-[13px] text-vigil-muted" htmlFor="directory-state">
        {t('stateLabel')}
      </label>
      <select
        id="directory-state"
        value={selectedState}
        onChange={(e) => setSelectedState(e.target.value)}
        className="mt-1 w-full max-w-sm rounded-input border border-slate-200 bg-white px-3 py-2 text-[16px] text-vigil-ink"
      >
        {ALL_STATES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <div className="mt-3 space-y-3">
        {stateOnly.length === 0 ? (
          <p className="rounded-card border border-slate-200 bg-vigil-cloud p-4 text-[16px] text-vigil-body">
            {t('noLocalNumbers', { state: selectedState })}
          </p>
        ) : (
          stateOnly.map(renderEntry)
        )}
      </div>
    </div>
  )
}
