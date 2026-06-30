'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslations } from 'next-intl'
import toast from 'react-hot-toast'
import { CRISIS_CONFIG } from '@/config/crisis.config'
import { queueSubmission } from '@/lib/offline-queue'

const schema = z.object({
  type: z.enum(['need', 'resource']),
  category: z.enum(['food', 'water', 'medical', 'rescue', 'shelter', 'clothing', 'comms', 'power', 'transport', 'other']),
  title: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  lat: z.number(),
  lng: z.number(),
  contact: z.string().max(100).optional(),
  urgent: z.boolean().optional(),
})

type FormValues = z.infer<typeof schema>

export default function NecesitoAyudaPage() {
  const t = useTranslations('map')
  const [submitting, setSubmitting] = useState(false)

  const { register, handleSubmit, setValue } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'need',
      category: 'water',
      lat: CRISIS_CONFIG.mapBounds.centerLat,
      lng: CRISIS_CONFIG.mapBounds.centerLng,
      urgent: true,
    },
  })

  function useMyLocation() {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition((pos) => {
      setValue('lat', pos.coords.latitude)
      setValue('lng', pos.coords.longitude)
    })
  }

  async function onSubmit(data: FormValues) {
    setSubmitting(true)
    try {
      if (!navigator.onLine) {
        queueSubmission('map-marker', data)
        toast.success(t('queuedOffline'))
        return
      }

      const res = await fetch('/api/map-markers/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('fail')
      toast.success('Marcador enviado')
    } catch {
      toast.error('Error al enviar')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'mt-1 w-full min-h-[44px] rounded-input border border-slate-200 bg-vigil-cloud px-3 text-[16px]'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-xl space-y-4 p-4">
      <h1 className="font-display text-[26px] font-semibold text-vigil-ink">{t('markerTypes.need')}</h1>

      <div>
        <label htmlFor="title" className="text-[13px] font-medium text-slate-600">
          Título *
        </label>
        <input id="title" {...register('title')} className={inputClass} required />
      </div>

      <div>
        <label htmlFor="category" className="text-[13px] font-medium text-slate-600">
          Categoría
        </label>
        <select id="category" {...register('category')} className={inputClass}>
          {Object.keys(t.raw('categories') as Record<string, string>).map((key) => (
            <option key={key} value={key}>
              {t(`categories.${key as 'food'}`)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="description" className="text-[13px] font-medium text-slate-600">
          Descripción
        </label>
        <textarea id="description" rows={3} {...register('description')} className={inputClass} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="lat" className="text-[13px] font-medium text-slate-600">
            Lat
          </label>
          <input id="lat" type="number" step="any" {...register('lat', { valueAsNumber: true })} className={inputClass} />
        </div>
        <div>
          <label htmlFor="lng" className="text-[13px] font-medium text-slate-600">
            Lng
          </label>
          <input id="lng" type="number" step="any" {...register('lng', { valueAsNumber: true })} className={inputClass} />
        </div>
      </div>

      <button type="button" onClick={useMyLocation} className="text-[16px] text-vigil-blue underline">
        Usar mi ubicación
      </button>

      <label className="flex items-center gap-2 text-[16px]">
        <input type="checkbox" {...register('urgent')} />
        {t('urgent')}
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="w-full min-h-[44px] rounded-input bg-vigil-blue text-white disabled:opacity-50"
      >
        {t('addMarker')}
      </button>
    </form>
  )
}
