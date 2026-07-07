'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { X } from 'lucide-react'

const DISMISS_PREFIX = 'vigil_deployment_suggestion_dismissed_'

interface DeploymentSuggestionBannerProps {
  deploymentId: string
  label: string
  url: string
}

/**
 * One-line dismissible suggestion: "Vigil {label} está disponible → Ir".
 * Suggestion only — never redirects automatically. Dismissal persists per
 * deployment id in localStorage and is never re-shown after dismiss.
 */
export function DeploymentSuggestionBanner({
  deploymentId,
  label,
  url,
}: DeploymentSuggestionBannerProps) {
  const t = useTranslations('deploymentSuggestion')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem(DISMISS_PREFIX + deploymentId)) setVisible(true)
    } catch {
      /* private mode — stay hidden */
    }
  }, [deploymentId])

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_PREFIX + deploymentId, '1')
    } catch {
      /* ignore */
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="flex items-center gap-3 border-b border-slate-200 bg-vigil-blue-light px-4 py-2 text-[13px] text-vigil-body">
      <p className="min-w-0 flex-1">
        {t('question', { label })}{' '}
        <a
          href={url}
          className="font-medium text-vigil-blue underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vigil-blue/40"
        >
          {t('go')}
        </a>
      </p>
      <button
        type="button"
        onClick={dismiss}
        aria-label={t('dismiss')}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-vigil-muted hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vigil-blue/40"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
    </div>
  )
}
