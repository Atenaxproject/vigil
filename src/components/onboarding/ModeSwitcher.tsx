'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { ChevronDown, LayoutGrid } from 'lucide-react'
import { cn } from '@/lib/utils'
import { VIEW_MODES, type ViewModeId } from '@/config/viewMode.config'

interface ModeSwitcherProps {
  mode: ViewModeId
  onChange: (mode: ViewModeId) => void
}

const ALL_MODES: ViewModeId[] = [...VIEW_MODES.map((m) => m.id), 'ver_todo']

export function ModeSwitcher({ mode, onChange }: ModeSwitcherProps) {
  const t = useTranslations('viewMode')
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) close()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, close])

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex min-h-[36px] items-center gap-1.5 rounded-input border border-slate-200 bg-vigil-cloud px-3 py-1.5 text-[13px] font-medium text-vigil-ink hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vigil-blue/40"
      >
        <LayoutGrid className="h-4 w-4 shrink-0 text-vigil-muted" aria-hidden />
        <span className="hidden sm:inline">{t('switcherPrefix')}</span>
        <span>{t(`modes.${mode}.short`)}</span>
        <ChevronDown className={cn('h-4 w-4 text-vigil-muted transition-transform', open && 'rotate-180')} aria-hidden />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t('switcherPrefix')}
          className="absolute right-0 top-full z-50 mt-1 max-h-[70vh] w-64 overflow-y-auto rounded-input border border-slate-200 bg-white py-1 shadow-lg"
        >
          {ALL_MODES.map((id) => (
            <li key={id} role="option" aria-selected={id === mode}>
              <button
                type="button"
                onClick={() => {
                  onChange(id)
                  close()
                }}
                className={cn(
                  'flex w-full min-h-[44px] flex-col px-3 py-2 text-left hover:bg-vigil-cloud focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-vigil-blue/40',
                  id === mode && 'bg-vigil-blue-light font-medium text-vigil-blue'
                )}
              >
                <span className="text-[13px]">{t(`modes.${id}.label`)}</span>
                <span className="text-[13px] text-vigil-muted">{t(`modes.${id}.description`)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
