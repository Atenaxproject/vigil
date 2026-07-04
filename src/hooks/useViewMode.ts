'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  parseStoredViewMode,
  VIEW_MODE_STORAGE_KEY,
  type ViewModeId,
} from '@/config/viewMode.config'

export function useViewMode() {
  const [mode, setModeState] = useState<ViewModeId | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(VIEW_MODE_STORAGE_KEY)
      setModeState(parseStoredViewMode(stored))
    } catch {
      setModeState(null)
    }
    setReady(true)
  }, [])

  const setMode = useCallback((next: ViewModeId) => {
    setModeState(next)
    try {
      localStorage.setItem(VIEW_MODE_STORAGE_KEY, next)
    } catch {
      /* ignore quota / private mode */
    }
  }, [])

  const isFirstVisit = ready && mode === null

  return {
    mode: mode ?? 'ver_todo',
    rawMode: mode,
    ready,
    isFirstVisit,
    setMode,
  }
}
