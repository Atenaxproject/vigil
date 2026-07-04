'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  parseStoredViewMode,
  VIEW_MODE_STORAGE_KEY,
  type ViewModeId,
} from '@/config/viewMode.config'

function readStoredMode(): ViewModeId | null {
  if (typeof window === 'undefined') return null
  try {
    return parseStoredViewMode(localStorage.getItem(VIEW_MODE_STORAGE_KEY))
  } catch {
    return null
  }
}

export function useViewMode() {
  const [mode, setModeState] = useState<ViewModeId | null>(readStoredMode)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setModeState(readStoredMode())
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
