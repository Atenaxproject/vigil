'use client'

import { Download } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { usePwaInstall } from '@/hooks/usePwaInstall'
import { cn } from '@/lib/utils'

interface PwaInstallButtonProps {
  className?: string
  variant?: 'menu' | 'inline'
  onInstalled?: () => void
}

export function PwaInstallButton({ className, variant = 'menu', onInstalled }: PwaInstallButtonProps) {
  const t = useTranslations('pwa')
  const { canInstall, triggerInstall } = usePwaInstall()

  if (!canInstall) return null

  const handleClick = async () => {
    const accepted = await triggerInstall()
    if (accepted) onInstalled?.()
  }

  if (variant === 'menu') {
    return (
      <li>
        <button
          type="button"
          onClick={handleClick}
          className={cn(
            'flex min-h-[44px] w-full items-center gap-3 rounded-input px-3 text-[16px] text-slate-700 hover:bg-vigil-cloud focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vigil-blue/40',
            className
          )}
        >
          <Download className="h-5 w-5 shrink-0 text-vigil-blue" aria-hidden />
          {t('install')}
        </button>
      </li>
    )
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'inline-flex min-h-[44px] items-center gap-2 rounded-input border border-[color:var(--vigil-border)] bg-[color:var(--vigil-surface)] px-3 text-[13px] font-medium text-vigil-blue hover:bg-vigil-cloud focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vigil-blue/40',
        className
      )}
    >
      <Download className="h-4 w-4" aria-hidden />
      {t('install')}
    </button>
  )
}
