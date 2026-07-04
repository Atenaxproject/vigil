'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { VIEW_MODES, type ViewModeId } from '@/config/viewMode.config'

interface ModePickerProps {
  open: boolean
  onSelect: (mode: ViewModeId) => void
  onClose: () => void
}

export function ModePicker({ open, onSelect, onClose }: ModePickerProps) {
  const t = useTranslations('viewMode')
  const tCommon = useTranslations('common')
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  const handleSelect = useCallback(
    (mode: ViewModeId) => {
      onSelect(mode)
      onClose()
    },
    [onSelect, onClose]
  )

  useEffect(() => {
    if (!open) return

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    closeRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = originalOverflow
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
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-vigil-muted hover:bg-vigil-cloud focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vigil-blue/40"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <ul className="space-y-2 p-4">
          {VIEW_MODES.map((modeDef) => (
            <li key={modeDef.id}>
              <button
                type="button"
                onClick={() => handleSelect(modeDef.id)}
                className="flex w-full min-h-[44px] flex-col rounded-input border border-slate-200 px-4 py-3 text-left transition-colors hover:border-vigil-blue hover:bg-vigil-blue-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vigil-blue/40"
              >
                <span className="text-[16px] font-medium text-vigil-ink">{t(`modes.${modeDef.id}.label`)}</span>
                <span className="mt-0.5 text-[13px] text-vigil-muted">{t(`modes.${modeDef.id}.description`)}</span>
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={() => handleSelect('ver_todo')}
              className="flex w-full min-h-[44px] flex-col rounded-input border-2 border-vigil-blue bg-vigil-blue-light px-4 py-3 text-left transition-colors hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vigil-blue/40"
            >
              <span className="text-[16px] font-medium text-vigil-blue">{t('modes.ver_todo.label')}</span>
              <span className="mt-0.5 text-[13px] text-vigil-muted">{t('modes.ver_todo.description')}</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  )
}
