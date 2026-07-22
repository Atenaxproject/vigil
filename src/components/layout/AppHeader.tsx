'use client'

import { CRISIS_CONFIG } from '@/config/crisis.config'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'
import { ModeSwitcher } from '@/components/onboarding/ModeSwitcher'
import { useViewModeContext } from '@/components/onboarding/ViewModeProvider'
import { AccessibilityControls } from '@/components/a11y/AccessibilityControls'
import { Menu } from 'lucide-react'

export function AppHeader() {
  const { mode, setMode, ready } = useViewModeContext()

  return (
    <header className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 md:px-6">
      <button
        type="button"
        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-input border border-slate-200 text-vigil-ink lg:hidden"
        aria-label="Menú"
        onClick={() => {
          document.getElementById('vigil-open-nav-menu')?.click()
        }}
      >
        <Menu className="h-5 w-5" aria-hidden />
      </button>
      <p className="hidden min-w-0 truncate text-[13px] text-vigil-muted md:block">
        {CRISIS_CONFIG.crisis} · {CRISIS_CONFIG.country}
      </p>
      <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
        <AccessibilityControls compact />
        {ready && <ModeSwitcher mode={mode} onChange={setMode} />}
        <LanguageSwitcher />
        <button
          type="button"
          className="hidden min-h-[44px] items-center gap-2 rounded-input border border-slate-200 px-3 text-[16px] lg:inline-flex"
          aria-label="Menú"
          onClick={() => {
            document.getElementById('vigil-open-nav-menu')?.click()
          }}
        >
          <Menu className="h-5 w-5" aria-hidden />
          Menú
        </button>
      </div>
    </header>
  )
}
