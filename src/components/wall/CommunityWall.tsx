'use client'

import { useCallback, useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { es, enUS } from 'date-fns/locale'
import { useLocale, useTranslations } from 'next-intl'
import toast from 'react-hot-toast'
import { AlertTriangle, Heart, HelpCircle, MessageSquare, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { FlagButton } from '@/components/ui/FlagButton'
import { UnverifiedBadge } from '@/components/ui/UnverifiedBadge'
import { cn } from '@/lib/utils'
import type { CommunityWallCategory, CommunityWallMessage } from '@/types/vigil.types'

const CATEGORY_STYLES: Record<CommunityWallCategory, string> = {
  aviso: 'bg-amber-50 text-amber-800 border-amber-200',
  solidaridad: 'bg-green-50 text-green-700 border-green-200',
  pregunta: 'bg-blue-50 text-blue-700 border-blue-200',
  general: 'bg-slate-50 text-slate-600 border-slate-200',
}

const CATEGORY_ICONS: Record<CommunityWallCategory, typeof AlertTriangle> = {
  aviso: AlertTriangle,
  solidaridad: Heart,
  pregunta: HelpCircle,
  general: MessageSquare,
}

export function CommunityWall() {
  const t = useTranslations('wall')
  const tc = useTranslations('common')
  const locale = useLocale()
  const dateLocale = locale === 'es' ? es : enUS
  const [messages, setMessages] = useState<CommunityWallMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [authorName, setAuthorName] = useState('')
  const [category, setCategory] = useState<CommunityWallCategory>('general')
  const [message, setMessage] = useState('')
  const [locationLabel, setLocationLabel] = useState('')

  const fetchMessages = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { data } = await supabase
      .from('community_wall')
      .select('id, author_name, message, category, location_label, created_at')
      .eq('flagged', false)
      .order('created_at', { ascending: false })
      .limit(100)

    setMessages((data as CommunityWallMessage[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    void fetchMessages()
  }, [fetchMessages])

  useEffect(() => {
    if (!isSupabaseConfigured()) return

    const supabase = createClient()
    const channel = supabase
      .channel('community-wall-live')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'community_wall' },
        (payload) => {
          const row = payload.new as CommunityWallMessage & { flagged?: boolean }
          if (row.flagged) return
          setMessages((prev) => {
            if (prev.some((m) => m.id === row.id)) return prev
            return [row, ...prev]
          })
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/community-wall/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author_name: authorName,
          message,
          category,
          location_label: locationLabel || undefined,
        }),
      })
      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        throw new Error(data.error)
      }
      toast.success(t('form.success'))
      setAuthorName('')
      setMessage('')
      setLocationLabel('')
      setShowForm(false)
      void fetchMessages()
    } catch {
      toast.error(t('form.error'))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleFlag(id: string) {
    try {
      const res = await fetch('/api/community-wall/flag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error()
      toast.success(tc('flagSuccess'))
      setMessages((prev) => prev.filter((m) => m.id !== id))
    } catch {
      toast.error(tc('error'))
    }
  }

  const inputClass =
    'mt-1 w-full min-h-[44px] rounded-input border border-slate-200 bg-vigil-cloud px-3 text-[16px] focus:outline-none focus:ring-2 focus:ring-vigil-blue/20'

  return (
    <div className="mx-auto max-w-3xl p-4 pb-24">
      <h1 className="font-display text-[26px] font-semibold text-vigil-ink">{t('title')}</h1>
      <p className="mt-1 text-[16px] text-vigil-muted">{t('subtitle')}</p>

      <div className="mt-4 flex items-center gap-2">
        <UnverifiedBadge />
        <p className="text-[13px] text-vigil-muted">{t('unverifiedNote')}</p>
      </div>

      <button
        type="button"
        onClick={() => setShowForm((v) => !v)}
        className="mt-6 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-input bg-vigil-blue px-4 text-[16px] font-medium text-white sm:w-auto"
      >
        <MessageSquare className="h-4 w-4" aria-hidden />
        {t('writeMessage')}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-4 rounded-card border border-slate-200 bg-white p-4">
          <div>
            <label htmlFor="wall-author" className="text-[13px] font-medium text-slate-600">
              {t('form.authorName')}
            </label>
            <input
              id="wall-author"
              type="text"
              required
              maxLength={100}
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="mt-3">
            <label htmlFor="wall-category" className="text-[13px] font-medium text-slate-600">
              {t('form.category')}
            </label>
            <select
              id="wall-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as CommunityWallCategory)}
              className={inputClass}
            >
              {(['general', 'aviso', 'solidaridad', 'pregunta'] as const).map((cat) => (
                <option key={cat} value={cat}>
                  {t(`categories.${cat}`)}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-3">
            <label htmlFor="wall-message" className="text-[13px] font-medium text-slate-600">
              {t('form.message')}
            </label>
            <textarea
              id="wall-message"
              required
              maxLength={300}
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={inputClass}
            />
            <p className="mt-1 text-[13px] text-vigil-muted">{t('form.charLimit', { count: message.length })}</p>
          </div>
          <div className="mt-3">
            <label htmlFor="wall-location" className="text-[13px] font-medium text-slate-600">
              {t('form.location')} ({tc('optional')})
            </label>
            <input
              id="wall-location"
              type="text"
              maxLength={200}
              value={locationLabel}
              onChange={(e) => setLocationLabel(e.target.value)}
              placeholder={t('form.locationPlaceholder')}
              className={inputClass}
            />
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="min-h-[44px] rounded-input bg-vigil-blue px-4 text-[16px] font-medium text-white disabled:opacity-50"
            >
              {submitting ? tc('loading') : t('form.submit')}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="min-h-[44px] rounded-input border border-slate-200 px-4 text-[16px] text-vigil-muted"
            >
              {tc('cancel')}
            </button>
          </div>
        </form>
      )}

      <div className="mt-8 space-y-3">
        {loading && <div className="skeleton h-24 rounded-card" />}
        {!loading && messages.length === 0 && (
          <p className="text-[16px] text-vigil-muted">{t('empty')}</p>
        )}
        {messages.map((msg) => {
          const Icon = CATEGORY_ICONS[msg.category]
          return (
            <article key={msg.id} className="rounded-card border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-badge border px-2 py-0.5 text-[13px] font-medium',
                        CATEGORY_STYLES[msg.category]
                      )}
                    >
                      <Icon className="h-3 w-3" aria-hidden />
                      {t(`categories.${msg.category}`)}
                    </span>
                    <span className="text-[16px] font-medium text-vigil-ink">{msg.author_name}</span>
                  </div>
                  <p className="mt-2 text-[16px] text-vigil-body">{msg.message}</p>
                  {msg.location_label && (
                    <p className="mt-1 flex items-center gap-1 text-[13px] text-vigil-muted">
                      <MapPin className="h-3 w-3" aria-hidden />
                      {msg.location_label}
                    </p>
                  )}
                  <p className="mt-2 font-mono text-[13px] text-vigil-muted">
                    {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true, locale: dateLocale })}
                  </p>
                </div>
                <FlagButton onClick={() => void handleFlag(msg.id)} />
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
