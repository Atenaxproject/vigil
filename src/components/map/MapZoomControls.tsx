'use client'

import { useMap } from 'react-leaflet'
import { Minus, Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function MapZoomControls() {
  const map = useMap()
  const t = useTranslations('map')

  return (
    <div className="absolute bottom-3 left-3 z-10 flex flex-col overflow-hidden rounded-input border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => map.zoomIn()}
        aria-label={t('zoomIn')}
        className="flex h-9 w-9 items-center justify-center border-b border-slate-200 text-slate-700 hover:bg-vigil-cloud focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-vigil-blue/40"
      >
        <Plus className="h-4 w-4" aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => map.zoomOut()}
        aria-label={t('zoomOut')}
        className="flex h-9 w-9 items-center justify-center text-slate-700 hover:bg-vigil-cloud focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-vigil-blue/40"
      >
        <Minus className="h-4 w-4" aria-hidden />
      </button>
    </div>
  )
}
