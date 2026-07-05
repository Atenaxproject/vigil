'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import {
  Building2,
  HardHat,
  HeartHandshake,
  Info,
  LayoutGrid,
  LifeBuoy,
  Search,
  X,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { type ViewModeId } from '@/config/viewMode.config'

interface ModePickerProps {
  open: boolean
  onSelect: (mode: ViewModeId) => void
  onClose: () => void
}

const MODE_ICONS: Record<Exclude<ViewModeId, 'ver_todo'>, LucideIcon> = {
  busco_a_alguien: Search,
  necesito_ayuda: LifeBuoy,
  equipo_rescate: HardHat,
  quiero_ayudar: HeartHandshake,
  soy_organizacion: Building2,
  solo_informacion: Info,
}

// Two-tier triage: crisis-urgent situations get large cards on top so an
// anxious user finds their path first; planning situations compress below.
const URGENT_MODES = ['busco_a_alguien', 'necesito_ayuda', 'equipo_rescate'] as const
const PLANNING_MODES = ['quiero_ayudar', 'soy_organizacion', 'solo_informacion'] as const

export function ModePicker({ open, onSelect, onClose }: ModePickerProps) {
  const t = useTranslations('viewMode')
  const tCommon = useTranslations('common')
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  // Only onSelect here — the provider dismisses the picker itself. Calling
  // onClose() after onSelect() let the close handler's stale rawMode === null
  // check overwrite the just-chosen mode with ver_todo.
  const handleSelect = useCallback(
    (mode: ViewModeId) => {
      onSelect(mode)
    },
    [onSelect]
  )

  useEffect(() => {
    if (!open) return

    const previouslyFocused = document.activeElement as HTMLElement | null
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab' || !dialogRef.current) return
      const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = originalOverflow
      previouslyFocused?.focus()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center lg:items-center" role="presentation">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mode-picker-title"
        className={cn(
          'relative z-[91] w-full max-w-lg border border-slate-200 bg-white shadow-lg',
          'max-h-[85vh] overflow-y-auto rounded-t-card pb-[env(safe-area-inset-bottom)] lg:rounded-card lg:pb-4'
        )}
      >
        <div className="sticky top-0 flex items-start justify-between border-b border-slate-200 bg-white px-4 py-4">
          <div>
            <h2 id="mode-picker-title" className="text-[20px] font-semibold text-vigil-ink">
              {t('pickerTitle')}
            </h2>
            <p className="mt-1 text-[13px] text-vigil-muted">{t('pickerSubtitle')}</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={tCommon('close')}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-vigil-muted hover:bg-vigil-cloud focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vigil-blue/40"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-vigil-muted">
            {t('tierUrgent')}
          </p>
          <ul className="mt-2 space-y-2">
            {URGENT_MODES.map((id) => {
              const Icon = MODE_ICONS[id]
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(id)}
                    className="flex w-full min-h-[64px] items-center gap-3.5 rounded-card border border-slate-200 bg-vigil-cloud px-4 py-2.5 text-left transition-colors hover:border-vigil-blue hover:bg-vigil-blue-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vigil-blue/40"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-input border border-slate-200 bg-white text-vigil-blue">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[17px] font-semibold leading-snug text-vigil-ink">
                        {t(`modes.${id}.label`)}
                      </span>
                      <span className="mt-0.5 block text-[13px] leading-snug text-vigil-muted">
                        {t(`modes.${id}.description`)}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>

          <p className="mt-5 text-[11px] font-semibold uppercase tracking-wider text-vigil-muted">
            {t('tierPlanning')}
          </p>
          <ul className="mt-2 space-y-1.5">
            {PLANNING_MODES.map((id) => {
              const Icon = MODE_ICONS[id]
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(id)}
                    className="flex w-full min-h-[44px] items-center gap-3 rounded-input border border-slate-200 px-4 py-2 text-left text-[15px] font-medium text-vigil-ink transition-colors hover:border-vigil-blue hover:bg-vigil-blue-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vigil-blue/40"
                  >
                    <Icon className="h-[17px] w-[17px] shrink-0 text-vigil-muted" aria-hidden />
                    {t(`modes.${id}.label`)}
                  </button>
                </li>
              )
            })}
          </ul>

          <button
            type="button"
            onClick={() => handleSelect('ver_todo')}
            className="mt-4 flex w-full min-h-[48px] items-center justify-center gap-2 rounded-input border border-slate-200 text-[15px] font-medium text-vigil-blue transition-colors hover:border-vigil-blue hover:bg-vigil-blue-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vigil-blue/40"
          >
            <LayoutGrid className="h-[17px] w-[17px]" aria-hidden />
            {t('modes.ver_todo.label')}
          </button>
        </div>
      </div>
    </div>
  )
}
