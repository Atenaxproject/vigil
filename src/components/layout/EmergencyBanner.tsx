'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { AlertTriangle, ChevronRight, Phone, X } from 'lucide-react'
import { CRISIS_CONFIG } from '@/config/crisis.config'
import Link from 'next/link'

interface EmergencyBannerProps {
  aftershockCount?: number
}

// tel: URIs need * percent-encoded (Movilnet *1); stripping it dials the wrong number.
function telHref(num: string): string {
  return `tel:${encodeURIComponent(num.replace(/[^\d*+]/g, ''))}`
}

export function EmergencyBanner({ aftershockCount = 0 }: EmergencyBannerProps) {
  const t = useTranslations('banner')
  const tCommon = useTranslations('common')
  const [directoryOpen, setDirectoryOpen] = useState(false)
  const sheetRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const nacional = CRISIS_CONFIG.emergencyContacts.find((c) => c.id === 'nacional')
  const carrierCodes = nacional && 'carrierCodes' in nacional ? nacional.carrierCodes : []

  useEffect(() => {
    if (!directoryOpen) return

    const previouslyFocused = document.activeElement as HTMLElement | null
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDirectoryOpen(false)
        return
      }
      if (e.key !== 'Tab' || !sheetRef.current) return
      const focusables = sheetRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = originalOverflow
      previouslyFocused?.focus()
    }
  }, [directoryOpen])

  return (
    <>
      <div
        className="sticky top-0 z-[100] border-b border-slate-800 bg-vigil-ink px-3 py-1 text-[13px] text-slate-200 sm:px-4"
        role="banner"
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <AlertTriangle className="hidden h-4 w-4 shrink-0 text-amber-400 sm:block" aria-hidden />

          <a
            href="tel:911"
            className="inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-input bg-status-missing px-3 font-mono text-[15px] font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <Phone className="h-3.5 w-3.5" aria-hidden />
            911
          </a>

          <div
            className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="list"
            aria-label={t('carrierCodes')}
          >
            {carrierCodes.map(({ carrier, code }) => (
              <a
                key={carrier}
                role="listitem"
                href={telHref(code)}
                className="inline-flex min-h-[36px] shrink-0 items-center gap-1.5 rounded-badge border border-slate-700 bg-slate-800 px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vigil-blue/60"
              >
                <span className="text-[11px] text-slate-400">{carrier}</span>
                <span className="font-mono text-[13px] font-semibold text-slate-100">{code}</span>
              </a>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setDirectoryOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={directoryOpen}
            aria-controls="emergency-directory"
            className="inline-flex min-h-[44px] shrink-0 items-center gap-0.5 whitespace-nowrap px-1 font-medium text-blue-300 hover:text-blue-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vigil-blue/60"
          >
            {t('directory')}
            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          </button>

          {aftershockCount > 0 && (
            <span className="hidden shrink-0 font-mono text-amber-300 md:inline">
              {aftershockCount} réplicas M4.0+
            </span>
          )}
        </div>
      </div>

      {directoryOpen && (
        <div
          className="fixed inset-0 z-[110] flex items-end justify-center lg:items-center"
          role="presentation"
          onClick={() => setDirectoryOpen(false)}
        >
          <div className="absolute inset-0 bg-black/40" aria-hidden />
          <div
            ref={sheetRef}
            id="emergency-directory"
            role="dialog"
            aria-modal="true"
            aria-labelledby="emergency-directory-title"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-t-card border border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-lg lg:rounded-card lg:pb-2"
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
              <h2 id="emergency-directory-title" className="text-[17px] font-semibold text-vigil-ink">
                {t('directoryTitle')}
              </h2>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setDirectoryOpen(false)}
                aria-label={tCommon('close')}
                className="flex h-11 w-11 items-center justify-center rounded-full text-vigil-muted hover:bg-vigil-cloud focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vigil-blue/40"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            <div className="space-y-4 p-4">
              {CRISIS_CONFIG.emergencyContacts.map((contact) => (
                <section key={contact.id}>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-vigil-muted">
                      {contact.label_es}
                    </h3>
                    <span
                      className={`shrink-0 rounded-badge px-2 py-0.5 text-[11px] font-medium ${
                        (contact.service_type as string) === 'privado'
                          ? 'bg-status-unverified-bg text-status-unverified'
                          : 'bg-status-alive-bg text-status-alive'
                      }`}
                    >
                      {(contact.service_type as string) === 'privado' ? t('servicePrivate') : t('servicePublic')}
                    </span>
                  </div>
                  <ul className="mt-1.5 space-y-1.5">
                    {contact.numbers.map((num) => (
                      <li key={num}>
                        <a
                          href={telHref(num)}
                          className="flex min-h-[48px] items-center gap-3 rounded-input border border-slate-200 px-3 hover:border-vigil-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vigil-blue/40"
                        >
                          <Phone className="h-4 w-4 shrink-0 text-vigil-blue" aria-hidden />
                          <span className="font-mono text-[15px] font-semibold text-vigil-ink">{num}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                  {contact.id === 'nacional' && 'carrierAccess' in contact && contact.carrierAccess && (
                    <p className="mt-1.5 font-mono text-[13px] text-vigil-muted">{contact.carrierAccess}</p>
                  )}
                  {'verified_at' in contact && contact.verified_at && (
                    <p className="mt-1 font-mono text-[11px] text-vigil-muted">
                      {contact.source} · {contact.verified_at}
                    </p>
                  )}
                </section>
              ))}

              <Link
                href="/informacion#emergency-contacts"
                onClick={() => setDirectoryOpen(false)}
                className="flex min-h-[44px] items-center justify-center rounded-input border border-slate-200 text-[15px] font-medium text-vigil-blue hover:border-vigil-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vigil-blue/40"
              >
                {t('fullDirectory')} →
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
