'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import toast from 'react-hot-toast'
import { StatusBadge } from '@/components/missing/StatusBadge'
import { MissingPersonNotes } from '@/components/missing/MissingPersonNotes'
import type { MissingPersonStatus, PublicMissingPerson } from '@/types/vigil.types'

interface ClaimManageClientProps {
  token: string
}

interface ClaimData {
  person: PublicMissingPerson & {
    contact_name: string
    contact_phone: string | null
    contact_whatsapp: string | null
    contact_email: string | null
  }
  notes: Array<{ id: string; author_name: string; note_type: string; message: string; created_at: string }>
  contactRequests: Array<{
    id: string
    requester_name: string
    requester_phone: string
    requester_relationship: string
    message: string | null
    viewed: boolean
    created_at: string
  }>
}

export function ClaimManageClient({ token }: ClaimManageClientProps) {
  const t = useTranslations('claim')
  const tm = useTranslations('missing')
  const [data, setData] = useState<ClaimData | null>(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<MissingPersonStatus>('missing')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/missing-persons/claim?token=${token}`)
      if (!res.ok) throw new Error()
      const json = (await res.json()) as ClaimData
      setData(json)
      setStatus(json.person.status)
      setNotes(json.person.notes ?? '')
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void load()
  }, [load])

  async function saveUpdates() {
    setSaving(true)
    try {
      const res = await fetch('/api/missing-persons/claim', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, status, notes }),
      })
      if (!res.ok) throw new Error()
      toast.success(t('saved'))
      void load()
    } catch {
      toast.error(t('saveError'))
    } finally {
      setSaving(false)
    }
  }

  async function markViewed(ids: string[]) {
    try {
      await fetch('/api/missing-persons/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, request_ids: ids }),
      })
      void load()
    } catch {
      toast.error(t('saveError'))
    }
  }

  if (loading) return <div className="skeleton mx-auto mt-8 h-48 max-w-2xl rounded-card" />
  if (!data) {
    return (
      <div className="mx-auto max-w-xl p-8 text-center">
        <p className="text-[16px] text-vigil-muted">{t('notFound')}</p>
        <Link href="/buscar" className="mt-4 inline-block text-vigil-blue underline">
          {t('backToSearch')}
        </Link>
      </div>
    )
  }

  const unviewedIds = data.contactRequests.filter((r) => !r.viewed).map((r) => r.id)

  return (
    <div className="mx-auto max-w-2xl p-4 pb-24">
      <p className="text-[13px] text-vigil-muted">{t('privatePage')}</p>
      <div className="mt-4 rounded-card border border-slate-200 bg-white p-4">
        <div className="flex items-start justify-between gap-4">
          <h1 className="font-display text-xl font-semibold text-vigil-ink">{data.person.full_name}</h1>
          <StatusBadge status={data.person.status} label={tm(`status.${data.person.status}`)} />
        </div>
        <p className="mt-2 text-[16px] text-slate-600">{data.person.last_seen_location}</p>

        <div className="mt-6 space-y-4 border-t border-slate-100 pt-4">
          <div>
            <label htmlFor="claim-status" className="block text-[13px] font-medium text-slate-600">
              {t('updateStatus')}
            </label>
            <select
              id="claim-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as MissingPersonStatus)}
              className="mt-1 w-full min-h-[44px] rounded-input border border-slate-200 bg-vigil-cloud px-3 text-[16px]"
            >
              <option value="missing">{tm('status.missing')}</option>
              <option value="found_alive">{tm('status.found_alive')}</option>
              <option value="found_deceased">{tm('status.found_deceased')}</option>
              <option value="unverified">{tm('status.unverified')}</option>
            </select>
          </div>
          <div>
            <label htmlFor="claim-notes" className="block text-[13px] font-medium text-slate-600">
              {t('updateNotes')}
            </label>
            <textarea
              id="claim-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 w-full rounded-input border border-slate-200 bg-vigil-cloud px-3 py-2 text-[16px]"
            />
          </div>
          <button
            type="button"
            onClick={saveUpdates}
            disabled={saving}
            className="min-h-[44px] rounded-input bg-vigil-blue px-4 text-[16px] font-medium text-white disabled:opacity-50"
          >
            {saving ? t('saving') : t('saveChanges')}
          </button>
        </div>
      </div>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-[20px] font-semibold text-vigil-ink">{t('contactInbox')}</h2>
          {unviewedIds.length > 0 && (
            <button
              type="button"
              onClick={() => markViewed(unviewedIds)}
              className="text-[13px] text-vigil-blue underline"
            >
              {t('markAllViewed')}
            </button>
          )}
        </div>
        {data.contactRequests.length === 0 ? (
          <p className="mt-3 text-[16px] text-vigil-muted">{t('noContactRequests')}</p>
        ) : (
          <div className="mt-3 space-y-3">
            {data.contactRequests.map((req) => (
              <article
                key={req.id}
                className={`rounded-card border p-3 ${req.viewed ? 'border-slate-200 bg-white' : 'border-blue-200 bg-blue-50'}`}
              >
                <p className="text-[16px] font-medium text-vigil-ink">{req.requester_name}</p>
                <p className="text-[13px] text-vigil-muted">
                  {req.requester_relationship} · {req.requester_phone}
                </p>
                {req.message && <p className="mt-2 text-[16px] text-slate-600">{req.message}</p>}
              </article>
            ))}
          </div>
        )}
      </section>

      <MissingPersonNotes personId={data.person.id} />
    </div>
  )
}
