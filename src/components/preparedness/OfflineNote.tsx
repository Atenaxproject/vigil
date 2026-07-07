'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

/** Text-only offline indicator on guide pages — the guides work without
 *  internet once visited (content ships in the bundle + CacheFirst pages). */
export function OfflineNote() {
  const t = useTranslations('prep')
  const [offline, setOffline] = useState(false)

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine)
    update()
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [])

  if (!offline) return null

  return (
    <p className="mb-4 rounded-input border border-slate-200 bg-vigil-cloud px-3 py-2 text-[13px] text-vigil-body print:hidden">
      {t('offlineNote')}
    </p>
  )
}
