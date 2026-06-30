'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { AlertTriangle, Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'

interface ClaimLinkSuccessProps {
  claimUrl: string
  title?: string
  subtitle?: string
  onDismiss?: () => void
}

export function ClaimLinkSuccess({ claimUrl, title, subtitle, onDismiss }: ClaimLinkSuccessProps) {
  const t = useTranslations('claim')
  const [copied, setCopied] = useState(false)

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(claimUrl)
      setCopied(true)
      toast.success(t('linkCopied'))
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error(t('copyError'))
    }
  }

  return (
    <div className="mx-auto max-w-xl rounded-card border border-green-200 bg-status-alive-bg p-6">
      <h2 className="font-display text-xl font-semibold text-vigil-ink">
        {title ?? t('successTitle')}
      </h2>
      {subtitle && <p className="mt-2 text-[16px] text-slate-600">{subtitle}</p>}
      <p className="mt-4 text-[16px] text-slate-700">{t('saveLink')}</p>
      <div className="mt-3 break-all rounded-input border border-slate-200 bg-white p-3 font-mono text-[13px] text-vigil-blue">
        {claimUrl}
      </div>
      <button
        type="button"
        onClick={copyLink}
        className="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-input bg-vigil-blue px-4 text-[16px] font-medium text-white"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {t('copyLink')}
      </button>
      <p className="mt-4 flex items-start gap-2 text-[13px] text-amber-800">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
        {t('privateWarning')}
      </p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="mt-4 text-[16px] text-vigil-blue underline"
        >
          {t('dismiss')}
        </button>
      )}
    </div>
  )
}
