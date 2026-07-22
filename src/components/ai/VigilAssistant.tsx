'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocale, useTranslations } from 'next-intl'
import { Sparkles, X, Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CRISIS_CONFIG } from '@/config/crisis.config'

export function VigilAssistant() {
  const t = useTranslations('assistant')
  const locale = useLocale()
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [reply, setReply] = useState('')
  const [loading, setLoading] = useState(false)
  const [unavailable, setUnavailable] = useState(false)
  const [hasAsked, setHasAsked] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => inputRef.current?.focus(), 100)
      return () => clearTimeout(timer)
    }
  }, [open])

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, close])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = message.trim()
    if (!trimmed || loading) return

    setLoading(true)
    setHasAsked(true)
    setReply('')
    setUnavailable(false)

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, language: locale }),
      })

      if (res.status === 503 || res.status === 429) {
        setUnavailable(true)
        return
      }

      if (!res.ok || !res.body) {
        throw new Error('assistant failed')
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue
          const payload = line.slice(6)
          if (payload === '[DONE]') continue
          try {
            const parsed = JSON.parse(payload) as { text?: string }
            if (parsed.text) {
              accumulated += parsed.text
              setReply(accumulated)
            }
          } catch {
            /* ignore partial SSE */
          }
        }
      }

      if (!accumulated) {
        setReply(
          t('errorFallback', {
            hotline: CRISIS_CONFIG.emergency.hotlineLabel,
            number: CRISIS_CONFIG.emergency.hotline,
          })
        )
      }
    } catch {
      setReply(
        t('errorFallback', {
          hotline: CRISIS_CONFIG.emergency.hotlineLabel,
          number: CRISIS_CONFIG.emergency.hotline,
        })
      )
    } finally {
      setLoading(false)
      setMessage('')
    }
  }

  if (!mounted) return null

  return createPortal(
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-32 right-4 z-40 flex min-h-[44px] items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-[13px] font-medium text-vigil-blue shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vigil-blue/40 lg:bottom-20"
        aria-label={t('triggerLabel')}
      >
        <Sparkles className="h-4 w-4" aria-hidden />
        <span className="hidden sm:inline">{t('triggerLabel')}</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[998] flex items-end justify-end bg-black/30 p-0 sm:items-stretch sm:p-4"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) close()
          }}
        >
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={t('panelTitle')}
            className={cn(
              'flex w-full flex-col bg-white shadow-lg',
              'h-[70vh] rounded-t-card border border-slate-200',
              'sm:h-auto sm:max-h-[calc(100vh-2rem)] sm:w-[400px] sm:self-end sm:rounded-card'
            )}
          >
            <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-vigil-blue" aria-hidden />
                <h2 className="font-display text-[17px] font-semibold text-vigil-ink">
                  {t('panelTitle')}
                </h2>
              </div>
              <button
                type="button"
                onClick={close}
                className="flex h-9 w-9 items-center justify-center rounded-input text-vigil-muted hover:bg-vigil-cloud"
                aria-label={t('close')}
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {unavailable ? (
                <div className="rounded-input border border-status-unverified bg-status-unverified-bg p-4 text-[16px] text-vigil-body">
                  <p className="font-medium text-vigil-ink">{t('unavailableTitle')}</p>
                  <p className="mt-2">{t('unavailableBody')}</p>
                </div>
              ) : (
                <>
                  {!hasAsked && (
                    <p className="text-[16px] leading-relaxed text-vigil-body">{t('welcome')}</p>
                  )}
                  {loading && (
                    <p className="text-[13px] text-vigil-muted animate-pulse">{t('loading')}</p>
                  )}
                  {reply && (
                    <div className="rounded-input bg-vigil-cloud p-3 text-[16px] leading-relaxed text-vigil-body whitespace-pre-wrap">
                      {reply}
                    </div>
                  )}
                </>
              )}
            </div>

            {!unavailable && (
              <form
                onSubmit={handleSubmit}
                className="border-t border-slate-200 p-4 flex gap-2"
              >
                <label htmlFor="assistant-input" className="sr-only">
                  {t('inputPlaceholder')}
                </label>
                <input
                  ref={inputRef}
                  id="assistant-input"
                  type="text"
                  maxLength={500}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t('inputPlaceholder')}
                  disabled={loading}
                  className="min-h-[44px] flex-1 rounded-input border border-slate-200 bg-vigil-cloud px-3 text-[16px] focus:outline-none focus:ring-2 focus:ring-vigil-blue/20 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={loading || !message.trim()}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-input bg-vigil-blue text-white disabled:opacity-50"
                  aria-label={t('send')}
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>,
    document.body
  )
}
