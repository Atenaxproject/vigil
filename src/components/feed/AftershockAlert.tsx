'use client'

import { AlertTriangle } from 'lucide-react'
import type { SeismicEvent } from '@/types/vigil.types'
import { CRISIS_CONFIG } from '@/config/crisis.config'

interface AftershockAlertProps {
  events: SeismicEvent[]
}

export function AftershockAlert({ events }: AftershockAlertProps) {
  const alerts = events.filter((e) => e.magnitude >= CRISIS_CONFIG.seismic.alertThresholdMag)
  if (alerts.length === 0) return null

  const latest = alerts[0]
  return (
    <div
      className="flex items-center gap-2 rounded-card border border-amber-200 bg-status-unverified-bg px-4 py-3 text-[16px] text-amber-900"
      role="alert"
    >
      <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
      <span>
        Réplica M{latest.magnitude.toFixed(1)} — {latest.place}
      </span>
    </div>
  )
}
