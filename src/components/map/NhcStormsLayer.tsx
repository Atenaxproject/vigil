'use client'

import { CircleMarker, Popup } from 'react-leaflet'
import type { NhcActiveStorm } from '@/lib/feeds/nhc'

interface NhcStormsLayerProps {
  storms: NhcActiveStorm[]
}

function stormColor(classification: string): string {
  if (classification === 'MH') return '#7C3AED' // major — seismic-major purple
  if (classification === 'HU') return '#DC2626'
  return '#D97706' // named TS/STS/SS
}

/** NHC storm positions; popups link to the official advisory. Hurricane
 *  archetype only — never rendered for the Venezuela deployment. */
export function NhcStormsLayer({ storms }: NhcStormsLayerProps) {
  return (
    <>
      {storms.map((storm) => (
        <CircleMarker
          key={storm.id}
          center={[storm.lat, storm.lng]}
          radius={10}
          pathOptions={{
            color: stormColor(storm.classification),
            fillColor: stormColor(storm.classification),
            fillOpacity: 0.5,
            weight: 2,
          }}
        >
          <Popup>
            <div className="max-w-[240px] text-[13px]">
              <p className="font-semibold">
                {storm.classification} {storm.name}
              </p>
              <p className="mt-1 font-mono text-[11px]">
                {storm.intensityKt != null ? `${storm.intensityKt} kt` : 'intensidad —'}
                {storm.movement ? ` · ${storm.movement}` : ''}
              </p>
              <a
                href={storm.advisoryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block text-vigil-blue underline"
              >
                Aviso oficial NHC
              </a>
              <p className="mt-1 text-[11px] text-slate-500">Fuente: National Hurricane Center</p>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </>
  )
}
