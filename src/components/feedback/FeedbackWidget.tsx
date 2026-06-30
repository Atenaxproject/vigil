'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { MessageCircle, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

type FeedbackCategory = 'bug' | 'feature_request' | 'missing_info' | 'question'

const CATEGORIES: Array<{ key: FeedbackCategory; emoji: string }> = [
  { key: 'bug', emoji: '🐛' },
  { key: 'feature_request', emoji: '💡' },
  { key: 'missing_info', emoji: '📋' },
  { key: 'question', emoji: '❓' },
]

export function FeedbackWidget() {
  const t = useTranslations('feedback')
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [category, setCategory] = useState<FeedbackCategory>('bug')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const close = useCallback(() => setOpen(false), [])

  // Escape to close + lock body scroll while open + focus management
  useEffect(() => {
    if (!open) return

    const previouslyFocused = document.activeElement as HTMLElement | null
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKeyDown)
    closeButtonRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = originalOverflow
      previouslyFocused?.focus?.()
    }
  }, [open, close])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/feedback/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          message: message.trim(),
          contact_email: email.trim() || undefined,
          page_context: pathname,
        }),
      })
      if (!res.ok) throw new Error('fail')
      setSent(true)
      setMessage('')
      setEmail('')
    } catch {
      toast.error(t('error'))
    } finally {
      setSubmitting(false)
    }
  }

  // Render everything through a portal to document.body so the floating button
  // and modal are always direct children of <body>. This guarantees their
  // `position: fixed` is anchored to the viewport and can never be broken by an
  // ancestor that establishes a containing block (transform / filter /
  // will-change / backdrop-filter), regardless of where <FeedbackWidget /> sits.
  if (!mounted) return null

  return (
    <>
      {createPortal(
        <button
          type="button"
          onClick={() => {
            setOpen(true)
            setSent(false)
          }}
          className="fixed bottom-20 right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-vigil-blue shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vigil-blue/40 lg:bottom-6"
          aria-label={t('open')}
        >
          <MessageCircle className="h-5 w-5" aria-hidden />
        </button>,
        document.body
      )}

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) close()
            }}
          >
            <div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="feedback-title"
              className="relative z-[1000] flex max-h-[90vh] w-full max-w-[400px] flex-col overflow-y-auto rounded-card border border-slate-200 bg-white p-5 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <h2 id="feedback-title" className="text-[17px] font-semibold text-vigil-ink">
                  {t('title')}
                </h2>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={close}
                  className="rounded p-1 text-vigil-muted hover:bg-vigil-cloud focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vigil-blue/40"
                  aria-label={t('close')}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {sent ? (
                <p className="mt-4 text-[16px] text-slate-600">{t('success')}</p>
              ) : (
                <form onSubmit={handleSubmit} className="mt-4 space-y-4" noValidate>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(({ key, emoji }) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setCategory(key)}
                        className={cn(
                          'min-h-[36px] rounded-full border px-3 text-[13px]',
                          category === key
                            ? 'border-vigil-blue bg-vigil-blue-light text-vigil-blue'
                            : 'border-slate-200 text-slate-600'
                        )}
                      >
                        {emoji} {t(`categories.${key}`)}
                      </button>
                    ))}
                  </div>

                  <div>
                    <label htmlFor="feedback-message" className="text-[13px] font-medium text-slate-600">
                      {t('message')}
                    </label>
                    <textarea
                      id="feedback-message"
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      aria-required="true"
                      className="mt-1 w-full resize-y rounded-input border border-slate-200 bg-vigil-cloud px-3 py-2 text-[16px]"
                    />
                  </div>

                  <div>
                    <label htmlFor="feedback-email" className="text-[13px] font-medium text-slate-600">
                      {t('email')}
                    </label>
                    <input
                      id="feedback-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 min-h-[44px] w-full rounded-input border border-slate-200 bg-vigil-cloud px-3 text-[16px]"
                    />
                  </div>

                  <p className="text-[13px] text-vigil-muted">{t('supportEmail')}</p>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="min-h-[44px] w-full rounded-input bg-vigil-blue px-4 text-[16px] font-medium text-white disabled:opacity-50"
                  >
                    {submitting ? t('submitting') : t('submit')}
                  </button>
                </form>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  )
}
