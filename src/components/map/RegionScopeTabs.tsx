'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

export function RegionScopeTabs() {
  const pathname = usePathname()
  const t = useTranslations('regionScope')
  const isUsa = pathname === '/apoyo-usa'

  return (
    <nav
      className="flex gap-2 rounded-card border border-slate-200 bg-white p-1"
      aria-label={t('label')}
    >
      <Link
        href="/"
        className={cn(
          'flex min-h-[44px] flex-1 items-center justify-center rounded-input px-3 text-[13px] font-medium transition-colors',
          !isUsa
            ? 'bg-vigil-blue text-white'
            : 'text-vigil-muted hover:bg-vigil-cloud'
        )}
        aria-current={!isUsa ? 'page' : undefined}
      >
        {t('venezuela')}
      </Link>
      <Link
        href="/apoyo-usa"
        className={cn(
          'flex min-h-[44px] flex-1 items-center justify-center rounded-input px-3 text-[13px] font-medium transition-colors',
          isUsa
            ? 'bg-vigil-blue text-white'
            : 'text-vigil-muted hover:bg-vigil-cloud'
        )}
        aria-current={isUsa ? 'page' : undefined}
      >
        {t('usaDiaspora')}
      </Link>
    </nav>
  )
}
