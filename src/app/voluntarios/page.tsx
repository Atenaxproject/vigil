'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import toast from 'react-hot-toast'

export default function VoluntariosPage() {
  const t = useTranslations('volunteers')
  const tf = useTranslations('volunteers.form')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 500))
    toast.success(tf('success'))
    setSubmitting(false)
  }

  const inputClass =
    'mt-1 w-full min-h-[44px] rounded-input border border-slate-200 bg-vigil-cloud px-3 text-[13px]'

  return (
    <div className="mx-auto max-w-xl p-4">
      <h1 className="font-display text-2xl font-semibold text-vigil-ink">{t('title')}</h1>
      <p className="mt-1 text-[13px] text-vigil-muted">{t('subtitle')}</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="name" className="text-[11px] font-medium">
            {tf('name')} *
          </label>
          <input id="name" name="name" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="location" className="text-[11px] font-medium">
            {tf('location')}
          </label>
          <input id="location" name="location" className={inputClass} />
        </div>
        <p className="text-[11px] text-amber-800">{tf('privacyNote')}</p>
        <button
          type="submit"
          disabled={submitting}
          className="w-full min-h-[44px] rounded-input bg-vigil-blue text-white"
        >
          {tf('submit')}
        </button>
      </form>
    </div>
  )
}
