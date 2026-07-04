'use client'

import { useCallback, useEffect, useId, useState } from 'react'
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
  propertyAssessments: boolean
  missingPersons: boolean
}

interface MapLayersProps {
  layers: MapLayerState
  onChange: (layers: MapLayerState) => void
}

const LAYERS_STORAGE_KEY = 'vigil-map-layers-open'

function readDesktopLayersOpen(): boolean {
  if (typeof window === 'undefined') return true
  const stored = localStorage.getItem(LAYERS_STORAGE_KEY)
  if (stored === null) return true
  return stored === 'true'
}

export function MapLayers({ layers, onChange }: MapLayersProps) {
  const t = useTranslations('map.layers')
  const panelId = useId()
  const [desktopOpen, setDesktopOpen] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setDesktopOpen(readDesktopLayersOpen())
    setHydrated(true)
  }, [])

  const setDesktopPanelOpen = useCallback((open: boolean) => {
    setDesktopOpen(open)
    localStorage.setItem(LAYERS_STORAGE_KEY, String(open))
  }, [])

  const toggles: Array<{ key: keyof MapLayerState; label: string }> = [
    { key: 'aftershocks', label: t('aftershocks') },
    { key: 'needs', label: t('needs') },
    { key: 'resources', label: t('resources') },
    { key: 'activeTeams', label: t('activeTeams') },
    { key: 'collection', label: t('collection') },
    { key: 'propertyAssessments', label: t('propertyAssessments') },
    { key: 'missingPersons', label: t('missingPersons') },
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
      {/* Desktop: floating panel when open */}
      {hydrated && desktopOpen && (
        <div
          id={panelId}
          className="absolute right-3 top-3 z-10 hidden w-[min(280px,calc(100vw-24px))] rounded-card border border-slate-200 bg-white/95 shadow-sm backdrop-blur motion-safe:transition-opacity motion-safe:duration-200 lg:block"
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-2 py-2">
            <span className="px-2 text-[16px] font-semibold text-slate-700">{t('title')}</span>
            <button
              type="button"
              onClick={() => setDesktopPanelOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vigil-blue/40"
              aria-label={t('hideLayers')}
            >
              <X className="h-4 w-4 text-slate-500" aria-hidden />
            </button>
          </div>
          <div className="p-2">{checkboxes}</div>
        </div>
      )}

      {/* Desktop: reopen trigger when panel closed */}
      {hydrated && !desktopOpen && (
        <button
          type="button"
          onClick={() => setDesktopPanelOpen(true)}
          aria-expanded={false}
          aria-controls={panelId}
          aria-label={t('showLayers')}
          className="absolute right-3 top-3 z-10 hidden h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/95 shadow-sm backdrop-blur focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vigil-blue/40 motion-safe:transition-transform motion-safe:duration-200 hover:scale-105 motion-reduce:transition-none lg:flex"
        >
          <Layers className="h-5 w-5 text-slate-600" aria-hidden />
        </button>
      )}

      {/* Mobile: floating trigger */}
      {!mobileOpen && (
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-expanded={false}
          aria-controls={`${panelId}-mobile`}
          aria-label={t('showLayers')}
          className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/95 shadow-sm backdrop-blur focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vigil-blue/40 lg:hidden"
        >
          <Layers className="h-5 w-5 text-slate-600" aria-hidden />
        </button>
      )}

      {/* Mobile: bottom-sheet overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setMobileOpen(false)} role="presentation">
          <div className="absolute inset-0 bg-black/30" />
          <div
            id={`${panelId}-mobile`}
            role="dialog"
            aria-modal="true"
            aria-label={t('title')}
            className="absolute bottom-0 left-0 right-0 rounded-t-card border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] motion-safe:transition-transform motion-safe:duration-200 motion-reduce:transition-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-[16px] font-semibold text-slate-700">{t('title')}</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-expanded={true}
                aria-controls={`${panelId}-mobile`}
                aria-label={t('hideLayers')}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vigil-blue/40"
              >
                <X className="h-4 w-4 text-slate-500" aria-hidden />
              </button>
            </div>
            <div className="px-2 pb-4">{checkboxes}</div>
          </div>
        </div>
      )}
    </>
  )
}
