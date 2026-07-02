'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ArrowLeft, MapPin, Wifi } from 'lucide-react'
import toast from 'react-hot-toast'
import { CRISIS_CONFIG } from '@/config/crisis.config'
import { isWithinBounds } from '@/lib/security/validate'
import { cn } from '@/lib/utils'

const CONNECTIVITY_TYPES = ['starlink', 'cell', 'wifi'] as const
const ACCESS_LEVELS = ['public', 'rescue_only', 'ngo_only'] as const

export function ConnectivityForm() {
  const t = useTranslations('connectivity')
  const [submitting, setSubmitting] = useState(false)
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [connectivityType, setConnectivityType] = useState<string>('starlink')
  const [accessLevel, setAccessLevel] = useState<string>('public')

  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        if (isWithinBounds(latitude, longitude)) {
          setLat(latitude)
          setLng(longitude)
        }
      },
      () => {},
      { enableHighAccuracy: false, timeout: 8000 }
    )
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (lat === null || lng === null) {
      toast.error(t('form.gpsRequired'))
      return
    }

    setSubmitting(true)
    const form = new FormData(e.currentTarget)
    try {
      const res = await fetch('/api/connectivity/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.get('title'),
          location_description: form.get('location_description'),
          connectivity_type: connectivityType,
          hours_schedule: form.get('hours_schedule'),
          access_level: accessLevel,
          lat,
          lng,
          contact: form.get('contact'),
        }),
      })
      if (!res.ok) throw new Error()
      toast.success(t('form.success'))
      e.currentTarget.reset()
      setConnectivityType('starlink')
      setAccessLevel('public')
    } catch {
      toast.error(t('form.error'))
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'mt-1 w-full min-h-[44px] rounded-input border border-slate-200 bg-vigil-cloud px-3 text-[16px] focus:outline-none focus:ring-2 focus:ring-vigil-blue/20'

  return (
    <div className="mx-auto max-w-xl p-4 pb-24">
      <Link href="/" className="inline-flex items-center gap-1 text-[16px] text-vigil-blue">
        <ArrowLeft className="h-4 w-4" />
        {t('backToMap')}
      </Link>
      <div className="mt-4 flex items-center gap-2">
        <Wifi className="h-6 w-6 text-amber-600" aria-hidden />
        <h1 className="font-display text-[26px] font-semibold text-vigil-ink">{t('title')}</h1>
      </div>
      <p className="mt-2 text-[16px] text-vigil-muted">{t('subtitle')}</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="conn-title" className="block text-[13px] font-medium text-slate-600">
            {t('form.title')} *
          </label>
          <input id="conn-title" name="title" required className={inputClass} />
        </div>
        <fieldset>
          <legend className="text-[13px] font-medium text-slate-600">{t('form.type')} *</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {CONNECTIVITY_TYPES.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setConnectivityType(value)}
                className={cn(
                  'rounded-badge border px-3 py-1.5 text-[13px] font-medium',
                  connectivityType === value
                    ? 'border-amber-500 bg-amber-50 text-amber-800'
                    : 'border-slate-200 bg-white text-slate-600'
                )}
              >
                {t(`types.${value}`)}
              </button>
            ))}
          </div>
        </fieldset>
        <div>
          <label htmlFor="conn-location" className="block text-[13px] font-medium text-slate-600">
            {t('form.location')} *
          </label>
          <input id="conn-location" name="location_description" required className={inputClass} />
          <p className="mt-1 flex items-center gap-1 text-[13px] text-vigil-muted">
            <MapPin className="h-3 w-3" />
            {lat !== null ? t('form.gpsOk') : t('form.gpsPending')}
          </p>
        </div>
        <div>
          <label htmlFor="conn-hours" className="block text-[13px] font-medium text-slate-600">
            {t('form.hours')} *
          </label>
          <input
            id="conn-hours"
            name="hours_schedule"
            required
            placeholder={t('form.hoursPlaceholder')}
            className={inputClass}
          />
        </div>
        <fieldset>
          <legend className="text-[13px] font-medium text-slate-600">{t('form.access')} *</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {ACCESS_LEVELS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setAccessLevel(value)}
                className={cn(
                  'rounded-badge border px-3 py-1.5 text-[13px] font-medium',
                  accessLevel === value
                    ? 'border-amber-500 bg-amber-50 text-amber-800'
                    : 'border-slate-200 bg-white text-slate-600'
                )}
              >
                {t(`access.${value}`)}
              </button>
            ))}
          </div>
        </fieldset>
        <div>
          <label htmlFor="conn-contact" className="block text-[13px] font-medium text-slate-600">
            {t('form.contact')} *
          </label>
          <input id="conn-contact" name="contact" type="tel" required className={inputClass} />
          <p className="mt-1 text-[13px] text-vigil-muted">{t('form.contactNote')}</p>
        </div>
        <button
          type="submit"
          disabled={submitting || lat === null}
          className="min-h-[44px] w-full rounded-input bg-vigil-blue text-[16px] font-medium text-white disabled:opacity-50"
        >
          {submitting ? t('form.submitting') : t('form.submit')}
        </button>
      </form>

      <p className="mt-4 text-[13px] text-vigil-muted">
        {t('boundsNote', { country: CRISIS_CONFIG.country })}
      </p>
    </div>
  )
}
