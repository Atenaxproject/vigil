'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import toast from 'react-hot-toast'
import { flushQueue } from '@/lib/offline-queue'

export function OfflineQueueProvider() {
  const t = useTranslations('common')

  useEffect(() => {
    async function handleOnline() {
      const flushed = await flushQueue()
      if (flushed > 0) {
        toast.success(t('queueSynced', { count: flushed }))
      }
    }

    window.addEventListener('online', handleOnline)
    if (navigator.onLine) {
      void handleOnline()
    }

    return () => window.removeEventListener('online', handleOnline)
  }, [t])

  return null
}
