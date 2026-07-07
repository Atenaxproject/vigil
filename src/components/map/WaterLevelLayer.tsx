'use client'

import { CircleMarker, Popup } from 'react-leaflet'
import type { WaterGauge } from '@/lib/feeds/usgs-water'

interface WaterLevelLayerProps {
  gauges: WaterGauge[]
}

/** USGS river gauges (00065 gauge height). Flood archetype only — never
 *  rendered for the Venezuela deployment. Flood-stage coloring is P1 (the
 *  IV service does not return flood-stage thresholds directly). */
export function WaterLevelLayer({ gauges }: WaterLevelLayerProps) {
  return (
    <>
      {gauges.map((gauge) => (
        <CircleMarker
          key={gauge.siteCode}
          center={[gauge.lat, gauge.lng]}
          radius={6}
          pathOptions={{ color: '#2563EB', fillColor: '#2563EB', fillOpacity: 0.4, weight: 2 }}
        >
          <Popup>
            <div className="max-w-[220px] text-[13px]">
              <p className="font-semibold">{gauge.siteName}</p>
              <p className="mt-1 font-mono text-[11px]">
                {gauge.gaugeHeightFt != null ? `${gauge.gaugeHeightFt} ft` : 'fuente no disponible'}
                {gauge.observedAt ? ` · ${gauge.observedAt}` : ''}
              </p>
              <p className="mt-1 text-[11px] text-slate-500">Fuente: USGS Water Services</p>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </>
  )
}
