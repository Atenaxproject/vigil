'use client'

import { GeoJSON, Popup } from 'react-leaflet'
import type { NwsAlert } from '@/lib/feeds/nws'

// NWS severity → color. These mirror NWS's own tier semantics; the palette
// maps onto Vigil's status colors (never a new severity scale).
const SEVERITY_COLOR: Record<string, string> = {
  Extreme: '#DC2626', // status-missing red
  Severe: '#F97316',
  Moderate: '#D97706', // status-unverified amber
  Minor: '#64748B',
  Unknown: '#64748B',
}

interface NwsAlertsLayerProps {
  alerts: NwsAlert[]
}

/** Warning polygons colored by official NWS severity. Hurricane/flood
 *  archetype only — never rendered for the Venezuela deployment. */
export function NwsAlertsLayer({ alerts }: NwsAlertsLayerProps) {
  const withGeometry = alerts.filter(
    (a): a is NwsAlert & { geometry: NonNullable<NwsAlert['geometry']> } => a.geometry !== null
  )

  return (
    <>
      {withGeometry.map((alert) => (
          <GeoJSON
            key={alert.id}
            data={
              { type: 'Feature', geometry: alert.geometry, properties: {} } as GeoJSON.Feature
            }
            style={{
              color: SEVERITY_COLOR[alert.severity] ?? SEVERITY_COLOR.Unknown,
              weight: 2,
              fillOpacity: 0.15,
            }}
          >
            <Popup>
              <div className="max-w-[260px] text-[13px]">
                <p className="font-semibold">{alert.headline || alert.event}</p>
                {alert.instruction && <p className="mt-1">{alert.instruction}</p>}
                <p className="mt-1 font-mono text-[11px] text-slate-500">
                  {alert.severity} · expira {alert.expires}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">Fuente: National Weather Service</p>
              </div>
            </Popup>
          </GeoJSON>
        ))}
    </>
  )
}
