import { Phone } from 'lucide-react'
import { CRISIS_CONFIG } from '@/config/crisis.config'

export function EmergencyButton() {
  return (
    <a
      href={`tel:${CRISIS_CONFIG.emergency.hotline}`}
      className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-input bg-status-missing px-4 text-[16px] font-medium text-white active:scale-[0.98]"
    >
      <Phone className="h-4 w-4" aria-hidden />
      {CRISIS_CONFIG.emergency.hotlineLabel}
    </a>
  )
}
