'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { ModePicker } from '@/components/onboarding/ModePicker'
import { ModeMiniGuide } from '@/components/onboarding/ModeMiniGuide'
import { useViewMode } from '@/hooks/useViewMode'
import { type ViewModeId } from '@/config/viewMode.config'

const SIDEBAR_STORAGE_KEY = 'vigil-sidebar-collapsed'

interface ViewModeContextValue {
  mode: ViewModeId
  setMode: (mode: ViewModeId) => void
  ready: boolean
  /** Desktop rail collapsed to icon-only. Shared so the header can expose the
   *  grouped menu exactly when the rail can't (R1: one grouped nav at a time). */
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  sidebarReady: boolean
}

const ViewModeContext = createContext<ViewModeContextValue | null>(null)

export function useViewModeContext(): ViewModeContextValue {
  const ctx = useContext(ViewModeContext)
  if (!ctx) throw new Error('useViewModeContext must be used within ViewModeProvider')
  return ctx
}

export function ViewModeProvider({ children }: { children: React.ReactNode }) {
  const { mode, rawMode, ready, isFirstVisit, setMode } = useViewMode()
  const [pickerDismissed, setPickerDismissed] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarReady, setSidebarReady] = useState(false)

  useEffect(() => {
    try {
      if (localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true') setSidebarCollapsed(true)
    } catch {
      /* ignore */
    }
    setSidebarReady(true)
  }, [])

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next))
      } catch {
        /* ignore quota / private mode */
      }
      return next
    })
  }, [])

  const showPicker = ready && isFirstVisit && !pickerDismissed

  const handleSelect = useCallback(
    (next: ViewModeId) => {
      setMode(next)
      setPickerDismissed(true)
    },
    [setMode]
  )

  const handlePickerClose = useCallback(() => {
    if (rawMode === null) setMode('ver_todo')
    setPickerDismissed(true)
  }, [rawMode, setMode])

  const value = useMemo(
    () => ({ mode, setMode, ready, sidebarCollapsed, toggleSidebar, sidebarReady }),
    [mode, setMode, ready, sidebarCollapsed, toggleSidebar, sidebarReady]
  )

  return (
    <ViewModeContext.Provider value={value}>
      <ModePicker open={showPicker} onSelect={handleSelect} onClose={handlePickerClose} />
      {ready && mode !== 'ver_todo' && <ModeMiniGuide mode={mode} />}
      {children}
    </ViewModeContext.Provider>
  )
}
