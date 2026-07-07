'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import type { PreparednessGuide, PrepBlock } from '@/content/preparedness/_schema'

type DuranteContext = 'all' | 'interior' | 'exterior' | 'vehiculo'

interface GuideSectionsProps {
  sections: PreparednessGuide['sections']
}

function Block({ block }: { block: PrepBlock }) {
  return (
    <div
      className={cn(
        'rounded-card border border-slate-200 bg-white p-4 print:break-inside-avoid print:border-black',
        block.critical && 'border-l-[3px] border-l-status-missing'
      )}
    >
      <h3 className="text-[17px] font-semibold text-vigil-ink">{block.heading}</h3>
      <p className="mt-1.5 text-[16px] leading-relaxed text-vigil-body">{block.body}</p>
    </div>
  )
}

/** Antes / Durante / Después sections. Durante gets context chips
 *  (Interior / Exterior / Vehículo) that filter blocks — instant, no animation. */
export function GuideSections({ sections }: GuideSectionsProps) {
  const t = useTranslations('prep')
  const [context, setContext] = useState<DuranteContext>('all')

  const duranteVisible = sections.durante.filter(
    (b) => context === 'all' || !b.context || b.context === context
  )

  const chips: DuranteContext[] = ['all', 'interior', 'exterior', 'vehiculo']

  return (
    <>
      <section className="mt-8">
        <h2 className="text-[20px] font-semibold text-vigil-ink">{t('tabs.antes')}</h2>
        <div className="mt-3 space-y-3">
          {sections.antes.map((block) => (
            <Block key={block.heading} block={block} />
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-[20px] font-semibold text-vigil-ink">{t('tabs.durante')}</h2>
        <div className="mt-3 flex flex-wrap gap-2 print:hidden" role="group" aria-label={t('contextFilter')}>
          {chips.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => setContext(chip)}
              aria-pressed={context === chip}
              className={cn(
                'min-h-[44px] rounded-badge border px-4 text-[13px] font-medium',
                context === chip
                  ? 'border-vigil-blue bg-vigil-blue-light text-vigil-blue'
                  : 'border-slate-200 bg-white text-vigil-muted hover:border-slate-300'
              )}
            >
              {t(`contexts.${chip}`)}
            </button>
          ))}
        </div>
        <div className="mt-3 space-y-3">
          {duranteVisible.map((block) => (
            <Block key={block.heading} block={block} />
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-[20px] font-semibold text-vigil-ink">{t('tabs.despues')}</h2>
        <div className="mt-3 space-y-3">
          {sections.despues.map((block) => (
            <Block key={block.heading} block={block} />
          ))}
        </div>
      </section>
    </>
  )
}
