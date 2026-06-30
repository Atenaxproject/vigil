'use client'

import { useTranslations } from 'next-intl'

export interface MapLayerState {
  aftershocks: boolean
  needs: boolean
  resources: boolean
  shelters: boolean
  hospitals: boolean
  activeTeams: boolean
}

interface MapLayersProps {
  layers: MapLayerState
  onChange: (layers: MapLayerState) => void
}

export function MapLayers({ layers, onChange }: MapLayersProps) {
  const t = useTranslations('map.layers')

  const toggles: Array<{ key: keyof MapLayerState; label: string }> = [
    { key: 'aftershocks', label: t('aftershocks') },
    { key: 'needs', label: t('needs') },
    { key: 'resources', label: t('resources') },
    { key: 'activeTeams', label: t('activeTeams') },
    { key: 'shelters', label: t('shelters') },
    { key: 'hospitals', label: t('hospitals') },
  ]

  return (
    <div className="absolute right-3 top-3 z-[1000] max-w-[200px] rounded-card border border-slate-200 bg-white/95 p-2 shadow-sm backdrop-blur">
      {toggles.map(({ key, label }) => (
        <label key={key} className="flex min-h-[36px] cursor-pointer items-center gap-2 px-2 text-[11px]">
          <input
            type="checkbox"
            checked={layers[key]}
            onChange={(e) => onChange({ ...layers, [key]: e.target.checked })}
            className="rounded"
          />
          {label}
        </label>
      ))}
    </div>
  )
}
