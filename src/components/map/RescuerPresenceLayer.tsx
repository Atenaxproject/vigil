'use client'

import { CircleMarker, Popup } from 'react-leaflet'
import type { PublicRescuerPresence } from '@/types/vigil.types'

const TYPE_COLORS: Record<PublicRescuerPresence['presence_type'], string> = {
  rescue_team: '#f97316',
  medical: '#ec4899',
  volunteer: '#2563eb',
  individual: '#64748b',
}

interface RescuerPresenceLayerProps {
  presence: PublicRescuerPresence[]
}

export function RescuerPresenceLayer({ presence }: RescuerPresenceLayerProps) {
  const active = presence.filter(
    (p) => p.status === 'active' || p.status === 'checked_in' || p.status === 'needs_assistance'
  )

  return (
    <>
      {active.map((p) => {
        const isSos = p.status === 'needs_assistance'
        const color = isSos ? '#dc2626' : TYPE_COLORS[p.presence_type]
        return (
          <CircleMarker
            key={p.id}
            center={[p.lat, p.lng]}
            radius={isSos ? 14 : 10}
            pathOptions={{
              color,
              fillColor: color,
              fillOpacity: isSos ? 0.9 : 0.75,
              weight: isSos ? 3 : 2,
            }}
            className={isSos ? 'status-pulse-ring' : undefined}
          >
            <Popup>
              <strong>{p.display_name}</strong>
              {p.team_or_org && <p className="text-sm">{p.team_or_org}</p>}
              {p.notes && <p className="text-sm">{p.notes}</p>}
              {isSos && (
                <p className="text-sm font-bold text-red-600">⚠ NECESITA ASISTENCIA</p>
              )}
            </Popup>
          </CircleMarker>
        )
      })}
    </>
  )
}
