'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Lock, Printer } from 'lucide-react'
import type { PreparednessGuide } from '@/content/preparedness/_schema'

interface FamilyPlanBuilderProps {
  archetype: string
  prompts: PreparednessGuide['familyPlanPrompts']
}

/** Family emergency plan. Data lives in localStorage on the user's device
 *  ONLY — never sent to Supabase or any server (stated on the page). */
export function FamilyPlanBuilder({ archetype, prompts }: FamilyPlanBuilderProps) {
  const t = useTranslations('prep')
  const storageKey = `vigil_prep_family_plan_${archetype}`
  const [values, setValues] = useState<Record<string, string>>({})

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) setValues(JSON.parse(raw) as Record<string, string>)
    } catch {
      /* ignore */
    }
  }, [storageKey])

  const update = (id: string, value: string) => {
    setValues((prev) => {
      const next = { ...prev, [id]: value }
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
        <h2 className="text-[20px] font-semibold text-vigil-ink">{t('planTitle')}</h2>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-input border border-slate-200 px-3 text-[13px] font-medium text-vigil-blue hover:border-vigil-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vigil-blue/40 print:hidden"
        >
          <Printer className="h-4 w-4" aria-hidden />
          {t('printPlan')}
        </button>
      </div>
      <p className="mt-2 flex items-start gap-2 rounded-input bg-vigil-blue-light p-3 text-[13px] text-vigil-body print:hidden">
        <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-vigil-blue" aria-hidden />
        {t('planLocalNote')}
      </p>
      <div className="mt-4 space-y-4">
        {prompts.map((prompt) => (
          <div key={prompt.id} className="print:break-inside-avoid">
            <label
              htmlFor={`plan-${archetype}-${prompt.id}`}
              className="block text-[13px] font-medium text-slate-600"
            >
              {prompt.label}
            </label>
            <textarea
              id={`plan-${archetype}-${prompt.id}`}
              rows={2}
              value={values[prompt.id] ?? ''}
              onChange={(e) => update(prompt.id, e.target.value)}
              placeholder={prompt.placeholder}
              className="mt-1 w-full rounded-input border border-slate-200 bg-vigil-cloud px-3 py-2 text-[16px] focus:outline-none focus:ring-2 focus:ring-vigil-blue/20 print:border-black print:bg-white"
            />
          </div>
        ))}
      </div>
    </section>
  )
}
