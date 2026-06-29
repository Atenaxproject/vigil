import { ShieldCheck } from 'lucide-react'

export function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-badge bg-status-alive-bg px-2 py-0.5 text-[11px] font-medium text-status-alive">
      <ShieldCheck className="h-3 w-3" aria-hidden />
      Verificado
    </span>
  )
}
