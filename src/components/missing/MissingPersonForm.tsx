'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslations } from 'next-intl'
import toast from 'react-hot-toast'
import { Lock } from 'lucide-react'
import { ClaimLinkSuccess } from '@/components/ui/ClaimLinkSuccess'
import { queueSubmission } from '@/lib/offline-queue'

const formSchema = z.object({
  full_name: z.string().min(2).max(200),
  age: z.number().min(0).max(150).optional(),
  gender: z.enum(['male', 'female', 'other', 'unknown']).optional(),
  last_seen_location: z.string().min(2).max(500),
  last_seen_at: z.string().optional(),
  notes: z.string().max(2000).optional(),
  contact_name: z.string().min(2).max(200),
  contact_phone: z.string().max(25).optional(),
  contact_whatsapp: z.string().max(25).optional(),
  contact_email: z.string().email().max(200).optional().or(z.literal('')),
  consent_given: z.literal(true),
  data_accuracy_confirmed: z.literal(true),
})

type FormValues = z.infer<typeof formSchema>

export function MissingPersonForm() {
  const t = useTranslations('missing.form')
  const [submitting, setSubmitting] = useState(false)
  const [claimUrl, setClaimUrl] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  })

  async function onSubmit(data: FormValues) {
    setSubmitting(true)
    try {
      if (!navigator.onLine) {
        queueSubmission('missing-person', data)
        toast.success(t('queuedOffline'))
        reset()
        return
      }

      const res = await fetch('/api/missing-persons/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = (await res.json()) as { claimUrl?: string }
      if (!res.ok) throw new Error('submit failed')
      if (json.claimUrl) {
        setClaimUrl(json.claimUrl)
      } else {
        toast.success(t('success'))
        reset()
      }
    } catch {
      toast.error(t('error'))
    } finally {
      setSubmitting(false)
    }
  }

  if (claimUrl) {
    return (
      <ClaimLinkSuccess
        claimUrl={claimUrl}
        subtitle={t('success')}
        onDismiss={() => {
          setClaimUrl(null)
          reset()
        }}
      />
    )
  }

  const inputClass =
    'mt-1 w-full min-h-[44px] rounded-input border border-slate-200 bg-vigil-cloud px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-vigil-blue/20'
  const labelClass = 'block text-[11px] font-medium text-slate-600'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-xl space-y-4 p-4">
      <h1 className="font-display text-2xl font-semibold text-vigil-ink">{t('title')}</h1>

      <div>
        <label htmlFor="full_name" className={labelClass}>
          {t('name')} *
        </label>
        <input id="full_name" {...register('full_name')} className={inputClass} placeholder={t('namePlaceholder')} />
        {errors.full_name && <p className="mt-1 text-[11px] text-status-missing">Required</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="age" className={labelClass}>
            {t('age')}
          </label>
          <input id="age" type="number" {...register('age', { valueAsNumber: true })} className={inputClass} />
        </div>
        <div>
          <label htmlFor="gender" className={labelClass}>
            {t('gender')}
          </label>
          <select id="gender" {...register('gender')} className={inputClass}>
            <option value="">—</option>
            <option value="male">{t('genderOptions.male')}</option>
            <option value="female">{t('genderOptions.female')}</option>
            <option value="other">{t('genderOptions.other')}</option>
            <option value="unknown">{t('genderOptions.unknown')}</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="last_seen_location" className={labelClass}>
          {t('lastSeen')} *
        </label>
        <input
          id="last_seen_location"
          {...register('last_seen_location')}
          className={inputClass}
          placeholder={t('lastSeenPlaceholder')}
        />
      </div>

      <div>
        <label htmlFor="last_seen_at" className={labelClass}>
          {t('lastSeenDate')}
        </label>
        <input id="last_seen_at" type="datetime-local" {...register('last_seen_at')} className={inputClass} />
      </div>

      <div>
        <label htmlFor="notes" className={labelClass}>
          {t('notes')}
        </label>
        <textarea id="notes" rows={3} {...register('notes')} className={inputClass} placeholder={t('notesPlaceholder')} />
      </div>

      <div>
        <label htmlFor="contact_name" className={labelClass}>
          {t('contactName')} *
        </label>
        <input id="contact_name" {...register('contact_name')} className={inputClass} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact_phone" className={labelClass}>
            {t('contactPhone')}
          </label>
          <input id="contact_phone" type="tel" {...register('contact_phone')} className={inputClass} />
        </div>
        <div>
          <label htmlFor="contact_whatsapp" className={labelClass}>
            {t('contactWhatsApp')}
          </label>
          <input id="contact_whatsapp" type="tel" {...register('contact_whatsapp')} className={inputClass} />
        </div>
      </div>

      <div>
        <label htmlFor="contact_email" className={labelClass}>
          {t('contactEmail')}
        </label>
        <input id="contact_email" type="email" {...register('contact_email')} className={inputClass} />
        <p className="mt-1 text-[11px] text-vigil-muted">{t('contactEmailHelp')}</p>
      </div>

      <p className="flex items-start gap-2 rounded-input bg-status-unverified-bg p-3 text-[11px] text-amber-800">
        <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
        {t('contactPrivacyNote')}
      </p>

      <label className="flex items-start gap-2 text-[13px]">
        <input type="checkbox" {...register('consent_given')} className="mt-1" />
        {t('consent')} *
      </label>
      <label className="flex items-start gap-2 text-[13px]">
        <input type="checkbox" {...register('data_accuracy_confirmed')} className="mt-1" />
        {t('accuracy')} *
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="w-full min-h-[44px] rounded-input bg-vigil-blue text-[13px] font-medium text-white disabled:opacity-50"
      >
        {submitting ? t('submitting') : t('submit')}
      </button>
    </form>
  )
}
