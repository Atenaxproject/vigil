'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { ModePicker } from '@/components/onboarding/ModePicker'
import { ModeMiniGuide } from '@/components/onboarding/ModeMiniGuide'
import { useViewMode } from '@/hooks/useViewMode'
import { type ViewModeId } from '@/config/viewMode.config'

interface ViewModeContextValue {
  mode: ViewModeId
  setMode: (mode: ViewModeId) => void
  ready: boolean
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
    () => ({ mode, setMode, ready }),
    [mode, setMode, ready]
  )

  return (
    <ViewModeContext.Provider value={value}>
      <ModePicker open={showPicker} onSelect={handleSelect} onClose={handlePickerClose} />
      {ready && mode !== 'ver_todo' && <ModeMiniGuide mode={mode} />}
      {children}
    </ViewModeContext.Provider>
  )
}
