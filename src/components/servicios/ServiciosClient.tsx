'use client'

import { useCallback, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

const ZONES = [
  'La Guaira',
  'Distrito Capital',
  'Miranda',
  'Yaracuy',
  'Carabobo',
  'Aragua',
  'Falcón',
  'Zulia',
] as const

const SERVICES = [
  { id: 'electricidad', label_es: 'Luz', label_en: 'Power', emoji: '⚡' },
  { id: 'agua', label_es: 'Agua', label_en: 'Water', emoji: '💧' },
  { id: 'gasolina', label_es: 'Gasolina', label_en: 'Gasoline', emoji: '⛽' },
  { id: 'gas', label_es: 'Gas', label_en: 'Gas', emoji: '🔥' },
  { id: 'senal', label_es: 'Señal', label_en: 'Signal', emoji: '📶' },
] as const

const STATUSES = [
  { id: 'disponible', label_es: 'Disponible', label_en: 'Available' },
  { id: 'intermitente', label_es: 'Intermitente', label_en: 'Intermittent' },
  { id: 'sin_servicio', label_es: 'Sin servicio', label_en: 'No service' },
] as const

const ZONE_KEY = 'vigil-servicios-zone'

type ZoneStatus = {
  zone_id: string
  services: Array<{
    service_type: string
    status: string
    report_count: number
    last_report: string | null
  }>
}

export function ServiciosClient() {
  const t = useTranslations('servicios')
  const [locale, setLocale] = useState('es')
  const [zone, setZone] = useState<string>('La Guaira')
  const [zones, setZones] = useState<ZoneStatus[]>([])
  const [enabled, setEnabled] = useState(true)
  const [step, setStep] = useState<'idle' | 'service' | 'status' | 'done'>('idle')
  const [pickedService, setPickedService] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLocale(document.documentElement.lang || 'es')
    const saved = localStorage.getItem(ZONE_KEY)
    if (saved && ZONES.includes(saved as (typeof ZONES)[number])) setZone(saved)
  }, [])

  const load = useCallback(() => {
    void fetch('/api/servicios')
      .then((r) => r.json())
      .then((data: { enabled?: boolean; zones?: ZoneStatus[] }) => {
        setEnabled(data.enabled !== false)
        setZones(data.zones ?? [])
      })
      .catch(() => {
        /* ignore */
      })
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const current = zones.find((z) => z.zone_id === zone)

  async function submitStatus(status: string) {
    if (!pickedService) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/servicios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zone_id: zone, service_type: pickedService, status }),
      })
      if (!res.ok) {
        setError(t('error'))
        return
      }
      setStep('done')
      load()
    } catch {
      setError(t('error'))
    } finally {
      setSubmitting(false)
    }
  }

  if (!enabled) {
    return (
      <div className="mx-auto max-w-lg p-4 pb-24">
        <h1 className="font-display text-[26px] font-semibold text-vigil-ink">{t('title')}</h1>
        <p className="mt-4 text-[16px] text-vigil-muted">{t('disabled')}</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg p-4 pb-24">
      <h1 className="font-display text-[26px] font-semibold text-vigil-ink">{t('title')}</h1>
      <p className="mt-1 text-[16px] text-vigil-muted">{t('subtitle')}</p>

      <label htmlFor="servicios-zone" className="mt-6 block text-[13px] text-vigil-muted">
        {t('zoneLabel')}
      </label>
      <select
        id="servicios-zone"
        value={zone}
        onChange={(e) => {
          setZone(e.target.value)
          localStorage.setItem(ZONE_KEY, e.target.value)
          setStep('idle')
        }}
        className="mt-1 w-full rounded-input border border-slate-200 bg-white px-3 py-2 text-[16px]"
      >
        {ZONES.map((z) => (
          <option key={z} value={z}>
            {z}
          </option>
        ))}
      </select>

      <div className="mt-6 grid grid-cols-1 gap-3">
        {SERVICES.map((s) => {
          const st = current?.services.find((x) => x.service_type === s.id)
          const statusLabel =
            !st || st.status === 'sin_datos'
              ? t('noRecent')
              : locale === 'en'
                ? STATUSES.find((x) => x.id === st.status)?.label_en ?? st.status
                : STATUSES.find((x) => x.id === st.status)?.label_es ?? st.status
          return (
            <div
              key={s.id}
              className="flex items-center gap-3 rounded-card border border-slate-200 bg-white p-4"
            >
              <span className="text-2xl" aria-hidden>
                {s.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[16px] font-medium text-vigil-ink">
                  {locale === 'en' ? s.label_en : s.label_es}
                </p>
                <p className="text-[13px] text-vigil-muted" aria-label={statusLabel}>
                  {statusLabel}
                  {st?.last_report
                    ? ` · ${new Date(st.last_report).toLocaleString(locale === 'en' ? 'en-US' : 'es-VE')}`
                    : ''}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      <section className="mt-8">
        <h2 className="text-[17px] font-semibold text-vigil-ink">{t('reportTitle')}</h2>
        <p className="mt-1 text-[13px] text-vigil-muted">{t('reportHint')}</p>

        {step === 'idle' && (
          <button
            type="button"
            onClick={() => setStep('service')}
            className="mt-3 min-h-[44px] w-full rounded-input bg-vigil-blue px-4 text-[16px] font-medium text-white"
          >
            {t('reportCta')}
          </button>
        )}

        {step === 'service' && (
          <div className="mt-3 grid gap-2">
            {SERVICES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setPickedService(s.id)
                  setStep('status')
                }}
                className="min-h-[44px] rounded-input border border-slate-200 bg-white px-4 text-left text-[16px]"
              >
                <span aria-hidden>{s.emoji} </span>
                {locale === 'en' ? s.label_en : s.label_es}
              </button>
            ))}
          </div>
        )}

        {step === 'status' && (
          <div className="mt-3 grid gap-2">
            {STATUSES.map((s) => (
              <button
                key={s.id}
                type="button"
                disabled={submitting}
                onClick={() => void submitStatus(s.id)}
                className="min-h-[44px] rounded-input border border-slate-200 bg-white px-4 text-left text-[16px] disabled:opacity-50"
              >
                {locale === 'en' ? s.label_en : s.label_es}
              </button>
            ))}
          </div>
        )}

        {step === 'done' && (
          <p className="mt-3 rounded-card border border-status-alive/30 bg-status-alive-bg p-3 text-[16px] text-status-alive">
            {t('thanks')}
          </p>
        )}
        {error && <p className="mt-2 text-[13px] text-status-missing">{error}</p>}
      </section>
    </div>
  )
}
