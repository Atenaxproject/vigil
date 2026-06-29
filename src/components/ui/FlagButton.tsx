'use client'

import { Flag } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface FlagButtonProps {
  onClick?: () => void
}

export function FlagButton({ onClick }: FlagButtonProps) {
  const t = useTranslations('common')
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-[36px] items-center gap-1 rounded-input px-2 text-[11px] text-vigil-muted hover:bg-vigil-cloud hover:text-slate-700"
    >
      <Flag className="h-3.5 w-3.5" aria-hidden />
      {t('flag')}
    </button>
  )
}
