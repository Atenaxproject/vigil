'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Printer } from 'lucide-react'
import type { PreparednessGuide } from '@/content/preparedness/_schema'

interface SupplyChecklistProps {
  archetype: string
  items: PreparednessGuide['supplyChecklist']
}

/** Checkable supply list; state persists in localStorage on this device only. */
export function SupplyChecklist({ archetype, items }: SupplyChecklistProps) {
  const t = useTranslations('prep')
  const storageKey = `vigil_prep_checklist_${archetype}`
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) setChecked(JSON.parse(raw) as Record<string, boolean>)
    } catch {
      /* ignore */
    }
  }, [storageKey])

  const toggle = (item: string) => {
    setChecked((prev) => {
      const next = { ...prev, [item]: !prev[item] }
      try {
        localStorage.setItem(storageKey, JSON.stringify(next))
      } catch {
        /* ignore */
      }
      return next
    })
  }

  return (
    <section className="mt-10 print:break-before-page">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-[20px] font-semibold text-vigil-ink">{t('checklistTitle')}</h2>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-input border border-slate-200 px-3 text-[13px] font-medium text-vigil-blue hover:border-vigil-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vigil-blue/40 print:hidden"
        >
          <Printer className="h-4 w-4" aria-hidden />
          {t('print')}
        </button>
      </div>
      <ul className="mt-3 space-y-1.5">
        {items.map((entry) => (
          <li key={entry.item}>
            <label className="flex min-h-[44px] cursor-pointer items-start gap-3 rounded-input border border-slate-200 bg-white px-3 py-2 print:break-inside-avoid print:border-black">
              <input
                type="checkbox"
                checked={Boolean(checked[entry.item])}
                onChange={() => toggle(entry.item)}
                className="mt-1 h-5 w-5 shrink-0 accent-[color:var(--vigil-blue)]"
              />
              <span className="min-w-0">
                <span className="block text-[16px] text-vigil-ink">
                  {entry.item}
                  {entry.qty && <span className="font-medium text-vigil-muted"> — {entry.qty}</span>}
                </span>
                {entry.note && <span className="block text-[13px] text-vigil-muted">{entry.note}</span>}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </section>
  )
}
