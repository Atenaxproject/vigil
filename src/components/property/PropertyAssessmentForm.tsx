'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { AlertTriangle, ArrowLeft, Home } from 'lucide-react'
import toast from 'react-hot-toast'
import { CRISIS_CONFIG } from '@/config/crisis.config'
import { PinDropMap } from '@/components/map/PinDropMap'
import { ClaimLinkSuccess } from '@/components/ui/ClaimLinkSuccess'
import { GeoSelect } from '@/components/missing/GeoSelect'
import { DANGER_INDICATORS } from '@/lib/property-assessment'
import { cn } from '@/lib/utils'

const REQUEST_TYPES = ['inspection', 'relocation_assistance', 'both'] as const

interface PropertyAssessmentFormProps {
  stats: { assessedThisWeek: number; activeProfessionals: number }
}

export function PropertyAssessmentForm({ stats }: PropertyAssessmentFormProps) {
  const t = useTranslations('propertyAssessment')
  const [lat, setLat] = useState<number>(CRISIS_CONFIG.mapBounds.centerLat)
  const [lng, setLng] = useState<number>(CRISIS_CONFIG.mapBounds.centerLng)
  const [estado, setEstado] = useState('')
  const [municipio, setMunicipio] = useState('')
  const [requestType, setRequestType] = useState<string>('inspection')
  const [indicators, setIndicators] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [claimUrl, setClaimUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude)
        setLng(pos.coords.longitude)
      },
      () => {},
      { enableHighAccuracy: false, timeout: 8000 }
    )
  }, [])

  function toggleIndicator(value: string) {
    setIndicators((prev) =>
      prev.includes(value) ? prev.filter((i) => i !== value) : [...prev, value]
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    const form = new FormData(e.currentTarget)

    const payload = {
      estado,
      municipio: municipio || undefined,
      exact_address: form.get('exact_address'),
      exact_lat: lat,
      exact_lng: lng,
      request_type: requestType,
      danger_indicators: indicators,
      description: form.get('description'),
      contact_name: form.get('contact_name'),
      contact_phone: form.get('contact_phone') || undefined,
      contact_whatsapp: form.get('contact_whatsapp') || undefined,
      consent_given: true as const,
      data_accuracy_confirmed: true as const,
    }

    const body = new FormData()
    body.append('payload', JSON.stringify(payload))
    const photo = form.get('photo')
    if (photo instanceof File && photo.size > 0) {
      body.append('photo', photo)
    }

    try {
      const res = await fetch('/api/property-assessments/submit', { method: 'POST', body })
      const json = (await res.json()) as { claimUrl?: string }
      if (!res.ok) throw new Error()
      if (json.claimUrl) setClaimUrl(json.claimUrl)
      else toast.success(t('form.success'))
      e.currentTarget.reset()
      setIndicators([])
    } catch {
      toast.error(t('form.error'))
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'mt-1 w-full min-h-[44px] rounded-input border border-slate-200 bg-vigil-cloud px-3 text-[16px] focus:outline-none focus:ring-2 focus:ring-vigil-blue/20'

  if (claimUrl) {
    return (
      <ClaimLinkSuccess
        claimUrl={claimUrl}
        subtitle={t('form.success')}
        onDismiss={() => setClaimUrl(null)}
      />
    )
  }

  return (
    <div className="mx-auto max-w-xl p-4 pb-24">
      <Link href="/" className="inline-flex items-center gap-1 text-[16px] text-vigil-blue">
        <ArrowLeft className="h-4 w-4" />
        {t('backToMap')}
      </Link>

      <div className="mt-4 flex items-center gap-2">
        <Home className="h-6 w-6 text-vigil-blue" aria-hidden />
        <h1 className="font-display text-[26px] font-semibold text-vigil-ink">{t('title')}</h1>
      </div>
      <p className="mt-2 text-[16px] text-vigil-muted">{t('subtitle')}</p>

      <div className="mt-4 grid grid-cols-2 gap-3 rounded-card border border-slate-200 bg-white p-4 text-center">
        <div>
          <p className="font-mono text-[22px] font-semibold text-vigil-ink">{stats.assessedThisWeek}</p>
          <p className="text-[13px] text-vigil-muted">{t('stats.assessedWeek')}</p>
        </div>
        <div>
          <p className="font-mono text-[22px] font-semibold text-vigil-ink">{stats.activeProfessionals}</p>
          <p className="text-[13px] text-vigil-muted">{t('stats.professionals')}</p>
        </div>
      </div>

      <div className="mt-4 flex gap-2 rounded-card border border-amber-200 bg-status-unverified-bg p-4 text-[15px] text-amber-900">
        <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden />
        <p>{t('disclaimer')}</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <GeoSelect
          estado={estado}
          municipio={municipio}
          parroquia=""
          onEstadoChange={setEstado}
          onMunicipioChange={setMunicipio}
          onParroquiaChange={() => {}}
        />

        <div>
          <label htmlFor="pa-address" className="block text-[13px] font-medium text-slate-600">
            {t('form.address')} *
          </label>
          <input id="pa-address" name="exact_address" required className={inputClass} />
        </div>

        <div>
          <p className="text-[13px] font-medium text-slate-600">{t('form.mapPin')} *</p>
          <div className="mt-2">
            <PinDropMap
              lat={lat}
              lng={lng}
              onChange={(newLat, newLng) => {
                setLat(newLat)
                setLng(newLng)
              }}
              ariaLabel={t('form.mapPin')}
            />
          </div>
        </div>

        <fieldset>
          <legend className="text-[13px] font-medium text-slate-600">{t('form.requestType')} *</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {REQUEST_TYPES.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRequestType(value)}
                className={cn(
                  'rounded-badge border px-3 py-1.5 text-[13px] font-medium',
                  requestType === value
                    ? 'border-vigil-blue bg-vigil-blue-light text-vigil-blue'
                    : 'border-slate-200 bg-white text-slate-600'
                )}
              >
                {t(`form.requestTypes.${value}`)}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-[13px] font-medium text-slate-600">{t('form.indicators')}</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {DANGER_INDICATORS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => toggleIndicator(value)}
                className={cn(
                  'rounded-badge border px-3 py-1.5 text-[13px] font-medium',
                  indicators.includes(value)
                    ? 'border-vigil-red bg-red-50 text-vigil-red'
                    : 'border-slate-200 bg-white text-slate-600'
                )}
              >
                {t(`form.dangerIndicators.${value}`)}
              </button>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="pa-description" className="block text-[13px] font-medium text-slate-600">
            {t('form.description')} *
          </label>
          <textarea
            id="pa-description"
            name="description"
            required
            rows={4}
            className={inputClass}
            placeholder={t('form.descriptionPlaceholder')}
          />
        </div>

        <div>
          <label htmlFor="pa-photo" className="block text-[13px] font-medium text-slate-600">
            {t('form.photo')}
          </label>
          <input
            id="pa-photo"
            name="photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="mt-1 block w-full text-[14px]"
          />
          <p className="mt-1 text-[13px] text-vigil-muted">{t('form.photoNote')}</p>
        </div>

        <div>
          <label htmlFor="pa-contact" className="block text-[13px] font-medium text-slate-600">
            {t('form.contactName')} *
          </label>
          <input id="pa-contact" name="contact_name" required className={inputClass} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="pa-phone" className="block text-[13px] font-medium text-slate-600">
              {t('form.phone')}
            </label>
            <input id="pa-phone" name="contact_phone" className={inputClass} />
          </div>
          <div>
            <label htmlFor="pa-wa" className="block text-[13px] font-medium text-slate-600">
              WhatsApp
            </label>
            <input id="pa-wa" name="contact_whatsapp" className={inputClass} />
          </div>
        </div>

        <label className="flex min-h-[44px] cursor-pointer items-start gap-2 text-[15px]">
          <input type="checkbox" name="consent" required className="mt-1 h-4 w-4" />
          <span>{t('form.consent')}</span>
        </label>
        <label className="flex min-h-[44px] cursor-pointer items-start gap-2 text-[15px]">
          <input type="checkbox" name="accuracy" required className="mt-1 h-4 w-4" />
          <span>{t('form.accuracy')}</span>
        </label>

        <button
          type="submit"
          disabled={submitting || !estado}
          className="w-full min-h-[48px] rounded-input bg-vigil-blue text-[16px] font-medium text-white disabled:opacity-50"
        >
          {submitting ? t('form.submitting') : t('form.submit')}
        </button>
      </form>
    </div>
  )
}
