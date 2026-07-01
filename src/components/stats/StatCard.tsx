interface StatCardProps {
  value: string
  label: string
  sublabel?: string
  source: 'dtv' | 'vigil'
}

export function StatCard({ value, label, sublabel, source }: StatCardProps) {
  const isDtv = source === 'dtv'

  return (
    <div
      className={`rounded-card border p-4 ${
        isDtv ? 'border-amber-200 bg-status-unverified-bg' : 'border-slate-200 bg-vigil-blue-light'
      }`}
    >
      <p
        className={`font-display text-[26px] font-semibold tracking-tight ${
          isDtv ? 'text-status-unverified' : 'text-vigil-blue'
        }`}
      >
        {value}
      </p>
      <p className="mt-1 text-[16px] font-medium text-vigil-ink">{label}</p>
      {sublabel && <p className="mt-0.5 text-[13px] text-vigil-muted">{sublabel}</p>}
    </div>
  )
}
