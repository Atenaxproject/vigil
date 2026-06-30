'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

export function NetworkStatusBanner() {
  const t = useTranslations('common')
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
    <div
      role="status"
      className="border-b border-amber-200 bg-status-unverified-bg px-4 py-2 text-center text-[11px] text-amber-900"
    >
      {t('cachedData')}
    </div>
  )
}
