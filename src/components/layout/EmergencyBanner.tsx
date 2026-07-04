'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'
import { CRISIS_CONFIG } from '@/config/crisis.config'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface EmergencyBannerProps {
  aftershockCount?: number
}

export function EmergencyBanner({ aftershockCount = 0 }: EmergencyBannerProps) {
  const t = useTranslations('banner')
  const [expanded, setExpanded] = useState(false)
  const unverifiedContacts = CRISIS_CONFIG.emergencyContacts.filter((c) => !c.verified)
  const rescate = CRISIS_CONFIG.emergencyContacts.find((c) => c.id === 'rescate')
  const moreContacts = CRISIS_CONFIG.emergencyContacts.filter((c) => c.id !== 'rescate')

  return (
    <div
      className="sticky top-0 z-[100] border-b border-slate-800 bg-vigil-ink px-4 py-2 text-[13px] text-slate-200"
      role="banner"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" aria-hidden />
        <span className="shrink-0 font-medium">{t('emergency')} Venezuela</span>

        <a
          href="tel:911"
          className="shrink-0 rounded bg-status-missing px-3 py-1 font-mono text-[15px] font-bold text-white"
        >
          911
        </a>
        {rescate?.carrierAccess && (
          <span className="hidden shrink-0 text-[13px] text-slate-300 lg:inline">{rescate.carrierAccess}</span>
        )}

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="flex shrink-0 items-center gap-1 rounded border border-blue-700 px-2 py-0.5 text-blue-300 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vigil-blue/40"
        >
          {t('moreNumbers')}
          {expanded ? (
            <ChevronUp className="h-3.5 w-3.5" aria-hidden />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" aria-hidden />
          )}
        </button>

        <Link
          href="/informacion#emergency-contacts"
          className="shrink-0 rounded border border-blue-700 px-2 py-0.5 text-blue-300 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vigil-blue/40"
        >
          {t('fullDirectory')}
        </Link>

        {unverifiedContacts.length > 0 && (
          <span className="hidden shrink-0 text-[13px] text-amber-300 xl:inline">{t('verifyBeforeCalling')}</span>
        )}

        {aftershockCount > 0 && (
          <span className="ml-auto shrink-0 font-mono text-slate-400">
            {aftershockCount} réplicas M4.0+
          </span>
        )}
      </div>

      <div
        className={cn(
          'overflow-hidden transition-[max-height] duration-200 motion-reduce:transition-none',
          expanded ? 'max-h-96' : 'max-h-0'
        )}
        aria-hidden={!expanded}
      >
        <ul className="mt-2 space-y-2 border-t border-slate-700 pt-2">
          {rescate && (
            <li>
              <p className="font-medium text-slate-100">{rescate.label_es}</p>
              <p className="mt-0.5 flex flex-wrap gap-2 font-mono text-[13px]">
                {rescate.numbers.map((num) => (
                  <a key={num} href={`tel:${num.replace(/\*/g, '')}`} className="text-blue-300 hover:underline">
                    {num}
                  </a>
                ))}
              </p>
              {rescate.carrierAccess && (
                <p className="mt-0.5 text-[13px] text-slate-400 lg:hidden">{rescate.carrierAccess}</p>
              )}
            </li>
          )}
          {moreContacts.map((contact) => (
            <li key={contact.id}>
              <p className="font-medium text-slate-100">{contact.label_es}</p>
              <p className="mt-0.5 flex flex-wrap gap-2 font-mono text-[13px]">
                {contact.numbers.map((num) => (
                  <a key={num} href={`tel:${num.replace(/\*/g, '')}`} className="text-blue-300 hover:underline">
                    {num}
                  </a>
                ))}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
