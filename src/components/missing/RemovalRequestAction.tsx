'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import toast from 'react-hot-toast'
import { CRISIS_CONFIG } from '@/config/crisis.config'
import { cn } from '@/lib/utils'

interface RemovalRequestActionProps {
  personId: string
  /** Public heuristic only — age is published; is_minor is not exposed by the public view (76 §5). */
  likelyMinor: boolean
}

export function RemovalRequestAction({ personId, likelyMinor }: RemovalRequestActionProps) {
  const t = useTranslations('removalRequest')
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [relationship, setRelationship] = useState('')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/removal-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          missing_person_id: personId,
          requester_name: name.trim(),
          requester_contact: contact.trim(),
          requester_relationship: relationship.trim(),
          message: message.trim(),
          is_minor_record: likelyMinor,
        }),
      })
      if (!res.ok) throw new Error('fail')
      setSent(true)
      setName('')
      setContact('')
      setRelationship('')
      setMessage('')
      toast.success(t('success'))
    } catch {
      toast.error(t('error'))
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'mt-1 w-full min-h-[44px] rounded-input border border-slate-200 bg-vigil-cloud px-3 text-[16px] focus:outline-none focus:ring-2 focus:ring-vigil-blue/20'

  return (
    <section
      className={cn(
        'mt-6 rounded-card border p-4',
        likelyMinor
          ? 'border-amber-300 bg-amber-50'
          : 'border-slate-200 bg-white'
      )}
    >
      <h2 className="font-display text-[17px] font-semibold text-vigil-ink">
        {likelyMinor ? t('titleMinor') : t('title')}
      </h2>
      <p className="mt-2 text-[16px] leading-relaxed text-vigil-body">
        {likelyMinor ? t('introMinor') : t('intro')}
      </p>

      {!open && !sent && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            'mt-4 min-h-[44px] w-full rounded-input px-4 text-[16px] font-medium text-white',
            likelyMinor ? 'bg-amber-700 hover:bg-amber-800' : 'bg-vigil-blue hover:bg-blue-700'
          )}
        >
          {t('action')}
        </button>
      )}

      {sent && <p className="mt-4 text-[16px] text-slate-700">{t('success')}</p>}

      {open && !sent && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3" noValidate>
          <div>
            <label htmlFor="removal-name" className="block text-[13px] font-medium text-slate-600">
              {t('name')} *
            </label>
            <input
              id="removal-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="removal-relationship" className="block text-[13px] font-medium text-slate-600">
              {t('relationship')} *
            </label>
            <input
              id="removal-relationship"
              required
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              placeholder={likelyMinor ? t('relationshipPlaceholderMinor') : t('relationshipPlaceholder')}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="removal-contact" className="block text-[13px] font-medium text-slate-600">
              {t('contact')} *
            </label>
            <input
              id="removal-contact"
              required
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="removal-message" className="block text-[13px] font-medium text-slate-600">
              {t('message')} *
            </label>
            <textarea
              id="removal-message"
              required
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={inputClass}
            />
          </div>
          <p className="text-[13px] text-vigil-muted">{t('reviewedNote')}</p>
          <p className="text-[13px] text-vigil-muted">
            {t('emailAlternative')}{' '}
            <a
              href={`mailto:${CRISIS_CONFIG.legal.contactEmail}?subject=${encodeURIComponent(
                t('emailSubject')
              )}`}
              className="font-medium text-vigil-blue underline"
            >
              {CRISIS_CONFIG.legal.contactEmail}
            </a>
          </p>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="min-h-[44px] flex-1 rounded-input bg-vigil-blue text-[16px] font-medium text-white disabled:opacity-50"
            >
              {submitting ? t('submitting') : t('submit')}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="min-h-[44px] rounded-input border border-slate-200 px-4 text-[16px] text-slate-600"
            >
              {t('cancel')}
            </button>
          </div>
        </form>
      )}
    </section>
  )
}
