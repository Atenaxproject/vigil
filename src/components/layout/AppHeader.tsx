'use client'

import { CRISIS_CONFIG } from '@/config/crisis.config'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'
import { ModeSwitcher } from '@/components/onboarding/ModeSwitcher'
import { useViewModeContext } from '@/components/onboarding/ViewModeProvider'

export function AppHeader() {
  const { mode, setMode, ready } = useViewModeContext()

  return (
    <header className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 md:px-6">
      <p className="hidden min-w-0 truncate text-[13px] text-vigil-muted md:block">
        {CRISIS_CONFIG.crisis} · {CRISIS_CONFIG.country}
      </p>
      <div className="ml-auto flex items-center gap-2">
        {ready && <ModeSwitcher mode={mode} onChange={setMode} />}
        <LanguageSwitcher />
      </div>
    </header>
  )
}
