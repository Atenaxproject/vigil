'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

export function ReportBadNumberButton({ entryId }: { entryId: string }) {
  const t = useTranslations('crisisInfo.directory')
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')

  async function report() {
    if (status === 'sending' || status === 'done') return
    setStatus('sending')
    try {
      const res = await fetch('/api/directory/bad-number', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entry_id: entryId }),
      })
      if (!res.ok) throw new Error('fail')
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  return (
    <button
      type="button"
      onClick={() => void report()}
      disabled={status === 'sending' || status === 'done'}
      className="min-h-[44px] shrink-0 rounded-input border border-slate-200 px-3 text-[13px] text-vigil-muted hover:border-vigil-blue hover:text-vigil-blue disabled:opacity-60"
    >
      {status === 'done'
        ? t('reportThanks')
        : status === 'error'
          ? t('reportError')
          : status === 'sending'
            ? '…'
            : t('reportBad')}
    </button>
  )
}
