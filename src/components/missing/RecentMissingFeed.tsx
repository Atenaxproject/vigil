'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import type { PublicMissingPerson } from '@/types/vigil.types'
import { MissingPersonCard } from '@/components/missing/MissingPersonCard'
import { useTranslations } from 'next-intl'

interface RecentFeedProps {
  initialRecords?: PublicMissingPerson[]
}

export function RecentMissingFeed({ initialRecords = [] }: RecentFeedProps) {
  const t = useTranslations('missing')
  const [records, setRecords] = useState<PublicMissingPerson[]>(initialRecords)

  useEffect(() => {
    // Skip the realtime websocket entirely when Supabase is not configured
    // (e.g. placeholder env vars in production) to avoid an unhandled
    // client-side exception when the socket is blocked or fails to connect.
    if (!isSupabaseConfigured()) return

    const supabase = createClient()
    const channel = supabase
      .channel('missing-persons-feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'missing_persons' },
        (payload) => {
          const row = payload.new as PublicMissingPerson
          setRecords((prev) => [row, ...prev].slice(0, 20))
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'missing_persons' },
        (payload) => {
          const row = payload.new as PublicMissingPerson & { flagged?: boolean }
          if (row.flagged) {
            setRecords((prev) => prev.filter((r) => r.id !== row.id))
            return
          }
          setRecords((prev) => prev.map((r) => (r.id === row.id ? { ...r, ...row } : r)))
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [])

  if (records.length === 0) {
    return (
      <div className="border-t border-slate-200 p-4">
        <h3 className="text-[16px] font-medium text-vigil-ink">Recientes</h3>
        <p className="mt-2 text-[13px] text-vigil-muted">{t('search.noResults')}</p>
      </div>
    )
  }

  return (
    <div className="border-t border-slate-200 p-4">
      <h3 className="mb-3 text-[16px] font-medium text-vigil-ink">Recientes</h3>
      <div className="space-y-3">
        {records.map((person) => (
          <MissingPersonCard key={person.id} person={person} />
        ))}
      </div>
    </div>
  )
}
