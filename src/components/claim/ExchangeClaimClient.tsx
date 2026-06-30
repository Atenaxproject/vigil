'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import toast from 'react-hot-toast'

interface ExchangeClaimClientProps {
  token: string
}

interface ExchangeClaimData {
  entry: {
    id: string
    entry_type: string
    category: string
    title: string
    description: string
    location: string
    status: string
  }
  contactRequests: Array<{
    id: string
    requester_name: string
    requester_phone: string
    message: string | null
    viewed: boolean
    created_at: string
  }>
}

export function ExchangeClaimClient({ token }: ExchangeClaimClientProps) {
  const t = useTranslations('claim')
  const te = useTranslations('exchange')
  const [data, setData] = useState<ExchangeClaimData | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/resource-exchange/claim?token=${token}`)
      if (!res.ok) throw new Error()
      setData((await res.json()) as ExchangeClaimData)
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void refresh()
  }, [refresh])

  async function markViewed(ids: string[]) {
    try {
      await fetch('/api/resource-exchange/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, request_ids: ids }),
      })
      void refresh()
    } catch {
      toast.error(t('saveError'))
    }
  }

  if (loading) return <div className="skeleton mx-auto mt-8 h-48 max-w-2xl rounded-card" />
  if (!data) {
    return (
      <div className="mx-auto max-w-xl p-8 text-center">
        <p className="text-[16px] text-vigil-muted">{t('exchangeNotFound')}</p>
        <Link href="/intercambio" className="mt-4 inline-block text-vigil-blue underline">
          {t('backToExchange')}
        </Link>
      </div>
    )
  }

  const unviewedIds = data.contactRequests.filter((r) => !r.viewed).map((r) => r.id)

  return (
    <div className="mx-auto max-w-2xl p-4 pb-24">
      <p className="text-[13px] text-vigil-muted">{t('privatePage')}</p>
      <article className="mt-4 rounded-card border border-slate-200 bg-white p-4">
        <h1 className="font-display text-xl font-semibold text-vigil-ink">{data.entry.title}</h1>
        <p className="mt-1 text-[13px] text-vigil-muted">
          {te(`tabs.${data.entry.entry_type as 'offering' | 'requesting'}`)} ·{' '}
          {te(`categories.${data.entry.category as 'goods'}`)}
        </p>
        <p className="mt-2 text-[16px] text-slate-600">{data.entry.description}</p>
        <p className="mt-1 text-[13px] text-vigil-muted">{data.entry.location}</p>
      </article>

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
                <p className="text-[13px] text-vigil-muted">{req.requester_phone}</p>
                {req.message && <p className="mt-2 text-[16px] text-slate-600">{req.message}</p>}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
