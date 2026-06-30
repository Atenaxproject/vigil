import type { MissingPersonStatus } from '@/types/vigil.types'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: MissingPersonStatus
  className?: string
  label?: string
}

export function StatusBadge({ status, className, label }: StatusBadgeProps) {
  return (
    <div className={cn('relative flex items-center gap-2', className)} role="status" aria-label={label}>
      {status === 'missing' && (
        <span className="relative flex h-2 w-2">
          <span className="status-pulse-ring absolute inline-flex h-full w-full rounded-full bg-status-missing opacity-75" />
          <span className="status-pulse-ring-delayed absolute inline-flex h-full w-full rounded-full bg-status-missing opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-status-missing" />
        </span>
      )}
      {status === 'found_alive' && (
        <span className="inline-flex h-2 w-2 rounded-full bg-status-alive shadow-[0_0_0_2px_#dcfce7]" />
      )}
      {status === 'found_deceased' && (
        <span className="inline-flex h-2 w-2 rounded-full bg-status-deceased opacity-70" />
      )}
      {status === 'unverified' && (
        <svg className="h-3 w-3" viewBox="0 0 12 12" aria-hidden>
          <circle
            cx="6"
            cy="6"
            r="4"
            fill="none"
            stroke="#D97706"
            strokeWidth="1.5"
            strokeDasharray="4 2"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 6 6"
              to="360 6 6"
              dur="3s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>
      )}
      {label && <span className="text-[13px] font-medium text-slate-600">{label}</span>}
    </div>
  )
}
