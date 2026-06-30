'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ArrowLeft, Package, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'
import { CRISIS_CONFIG } from '@/config/crisis.config'
import { isWithinBounds } from '@/lib/security/validate'
import { cn } from '@/lib/utils'

const ACCEPTS_OPTIONS = [
  { value: 'food', labelKey: 'accepts.food' },
  { value: 'water', labelKey: 'accepts.water' },
  { value: 'clothing', labelKey: 'accepts.clothing' },
  { value: 'medicine', labelKey: 'accepts.medicine' },
  { value: 'hygiene', labelKey: 'accepts.hygiene' },
  { value: 'tools', labelKey: 'accepts.tools' },
  { value: 'other', labelKey: 'accepts.other' },
] as const

export function CollectionPointForm() {
  const t = useTranslations('collectionPoint')
  const [submitting, setSubmitting] = useState(false)
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [selected, setSelected] = useState<string[]>([])

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

  function toggleCategory(value: string) {
    setSelected((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (lat === null || lng === null) {
      toast.error(t('form.gpsRequired'))
      return
    }
    if (selected.length === 0) {
      toast.error(t('form.categoriesRequired'))
      return
    }

    setSubmitting(true)
    const form = new FormData(e.currentTarget)
    try {
      const res = await fetch('/api/collection-points/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.get('title'),
          organizer_name: form.get('organizer_name'),
          location_description: form.get('location_description'),
          lat,
          lng,
          accepts_categories: selected,
          hours_schedule: form.get('hours_schedule'),
          contact: form.get('contact'),
        }),
      })
      if (!res.ok) throw new Error()
      toast.success(t('form.success'))
      e.currentTarget.reset()
      setSelected([])
    } catch {
      toast.error(t('form.error'))
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'mt-1 w-full min-h-[44px] rounded-input border border-slate-200 bg-vigil-cloud px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-vigil-blue/20'

  return (
    <div className="mx-auto max-w-xl p-4 pb-24">
      <Link href="/" className="inline-flex items-center gap-1 text-[13px] text-vigil-blue">
        <ArrowLeft className="h-4 w-4" />
        {t('backToMap')}
      </Link>
      <div className="mt-4 flex items-center gap-2">
        <Package className="h-6 w-6 text-amber-600" aria-hidden />
        <h1 className="font-display text-2xl font-semibold text-vigil-ink">{t('title')}</h1>
      </div>
      <p className="mt-2 text-[13px] text-vigil-muted">{t('subtitle')}</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="cp-title" className="block text-[11px] font-medium text-slate-600">
            {t('form.title')} *
          </label>
          <input id="cp-title" name="title" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="cp-organizer" className="block text-[11px] font-medium text-slate-600">
            {t('form.organizer')} *
          </label>
          <input id="cp-organizer" name="organizer_name" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="cp-location" className="block text-[11px] font-medium text-slate-600">
            {t('form.location')} *
          </label>
          <input id="cp-location" name="location_description" required className={inputClass} />
          <p className="mt-1 flex items-center gap-1 text-[11px] text-vigil-muted">
            <MapPin className="h-3 w-3" />
            {lat !== null ? t('form.gpsOk') : t('form.gpsPending')}
          </p>
        </div>
        <fieldset>
          <legend className="text-[11px] font-medium text-slate-600">{t('form.accepts')} *</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {ACCEPTS_OPTIONS.map(({ value, labelKey }) => (
              <button
                key={value}
                type="button"
                onClick={() => toggleCategory(value)}
                className={cn(
                  'rounded-badge border px-3 py-1.5 text-[11px] font-medium',
                  selected.includes(value)
                    ? 'border-amber-500 bg-amber-50 text-amber-800'
                    : 'border-slate-200 bg-white text-slate-600'
                )}
              >
                {t(labelKey)}
              </button>
            ))}
          </div>
        </fieldset>
        <div>
          <label htmlFor="cp-hours" className="block text-[11px] font-medium text-slate-600">
            {t('form.hours')} *
          </label>
          <input
            id="cp-hours"
            name="hours_schedule"
            required
            placeholder={t('form.hoursPlaceholder')}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="cp-contact" className="block text-[11px] font-medium text-slate-600">
            {t('form.contact')} *
          </label>
          <input id="cp-contact" name="contact" type="tel" required className={inputClass} />
          <p className="mt-1 text-[11px] text-vigil-muted">{t('form.contactNote')}</p>
        </div>
        <button
          type="submit"
          disabled={submitting || lat === null}
          className="min-h-[44px] w-full rounded-input bg-vigil-blue text-[13px] font-medium text-white disabled:opacity-50"
        >
          {submitting ? t('form.submitting') : t('form.submit')}
        </button>
      </form>

      <p className="mt-4 text-[11px] text-vigil-muted">
        {t('boundsNote', { country: CRISIS_CONFIG.country })}
      </p>
    </div>
  )
}
