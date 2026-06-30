'use client'

import { useState } from 'react'
import { Layers, X } from 'lucide-react'
import { useTranslations } from 'next-intl'

export interface MapLayerState {
  aftershocks: boolean
  needs: boolean
  resources: boolean
  shelters: boolean
  hospitals: boolean
  activeTeams: boolean
  collection: boolean
}

interface MapLayersProps {
  layers: MapLayerState
  onChange: (layers: MapLayerState) => void
}

export function MapLayers({ layers, onChange }: MapLayersProps) {
  const t = useTranslations('map.layers')
  const tCommon = useTranslations('common')
  const [mobileOpen, setMobileOpen] = useState(false)

  const toggles: Array<{ key: keyof MapLayerState; label: string }> = [
    { key: 'aftershocks', label: t('aftershocks') },
    { key: 'needs', label: t('needs') },
    { key: 'resources', label: t('resources') },
    { key: 'activeTeams', label: t('activeTeams') },
    { key: 'collection', label: t('collection') },
    { key: 'shelters', label: t('shelters') },
    { key: 'hospitals', label: t('hospitals') },
  ]

  const checkboxes = toggles.map(({ key, label }) => (
    <label key={key} className="flex min-h-[36px] cursor-pointer items-center gap-2 px-2 text-[13px]">
      <input
        type="checkbox"
        checked={layers[key]}
        onChange={(e) => onChange({ ...layers, [key]: e.target.checked })}
        className="h-4 w-4 shrink-0 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vigil-blue/40"
      />
      {label}
    </label>
  ))

  return (
    <>
      {/* Desktop: always-visible floating panel (lg and above) */}
      <div className="absolute right-3 top-3 z-10 hidden w-[min(280px,calc(100vw-24px))] rounded-card border border-slate-200 bg-white/95 p-2 shadow-sm backdrop-blur lg:block">
        {checkboxes}
      </div>

      {/* Mobile: floating trigger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/95 shadow-sm backdrop-blur focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vigil-blue/40 lg:hidden"
        aria-label={t('toggleLayers')}
      >
        <Layers className="h-5 w-5 text-slate-600" />
      </button>

      {/* Mobile: bottom-sheet overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setMobileOpen(false)}>
          {/* backdrop */}
          <div className="absolute inset-0 bg-black/30" />
          {/* sheet */}
          <div
            className="absolute bottom-0 left-0 right-0 rounded-t-card border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-[16px] font-semibold text-slate-700">{t('title')}</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vigil-blue/40"
                aria-label={tCommon('close')}
              >
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>
            <div className="px-2 pb-4">{checkboxes}</div>
          </div>
        </div>
      )}
    </>
  )
}
