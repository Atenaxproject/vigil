'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import {
  Calendar,
  Gift,
  Heart,
  Info,
  Megaphone,
  Package,
  Plus,
  Users,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { formatVenezuelaDateKey, formatVenezuelaDateTime, VENEZUELA_TZ_LABEL } from '@/lib/time/venezuela'
import type { EventCategory, VigilEvent } from '@/types/vigil.types'
import { cn } from '@/lib/utils'

const CATEGORY_ICONS: Record<EventCategory, typeof Calendar> = {
  donation_drive: Gift,
  volunteer_meetup: Users,
  distribution: Package,
  info_session: Info,
  memorial: Heart,
  other: Megaphone,
}

const CATEGORY_COLORS: Record<EventCategory, string> = {
  donation_drive: 'text-blue-600 bg-blue-50',
  volunteer_meetup: 'text-green-600 bg-green-50',
  distribution: 'text-orange-600 bg-orange-50',
  info_session: 'text-purple-600 bg-purple-50',
  memorial: 'text-slate-600 bg-slate-100',
  other: 'text-vigil-muted bg-vigil-cloud',
}

const CATEGORIES: Array<EventCategory | 'all'> = [
  'all',
  'donation_drive',
  'volunteer_meetup',
  'distribution',
  'info_session',
  'memorial',
]

export function EventsCalendar() {
  const t = useTranslations('calendar')
  const locale = useLocale()
  const tzLabel = locale === 'es' ? VENEZUELA_TZ_LABEL.es : VENEZUELA_TZ_LABEL.en
  const [events, setEvents] = useState<VigilEvent[]>([])
  const [filter, setFilter] = useState<EventCategory | 'all'>('all')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const fetchEvents = useCallback(async () => {
    try {
      const params = new URLSearchParams({ upcoming: 'true' })
      if (filter !== 'all') params.set('category', filter)
      const res = await fetch(`/api/events?${params}`)
      const data = (await res.json()) as { events?: VigilEvent[] }
      setEvents(data.events ?? [])
    } catch {
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    setLoading(true)
    void fetchEvents()
  }, [fetchEvents])

  useEffect(() => {
    if (!isSupabaseConfigured()) return

    const supabase = createClient()
    const channel = supabase
      .channel('events-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => {
        void fetchEvents()
      })
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [fetchEvents])

  const grouped = useMemo(() => {
    const map = new Map<string, VigilEvent[]>()
    for (const event of events) {
      const key = formatVenezuelaDateKey(event.starts_at)
      const list = map.get(key) ?? []
      list.push(event)
      map.set(key, list)
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [events])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    const form = new FormData(e.currentTarget)
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.get('title'),
          description: form.get('description') || undefined,
          category: form.get('category'),
          starts_at: form.get('starts_at'),
          ends_at: form.get('ends_at') || undefined,
          location_label: form.get('location_label'),
          organizer_name: form.get('organizer_name') || undefined,
          organizer_contact: form.get('organizer_contact') || undefined,
        }),
      })
      if (!res.ok) throw new Error()
      toast.success(t('form.success'))
      setShowForm(false)
      void fetchEvents()
    } catch {
      toast.error(t('form.error'))
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'mt-1 w-full min-h-[44px] rounded-input border border-slate-200 bg-vigil-cloud px-3 text-[16px] focus:outline-none focus:ring-2 focus:ring-vigil-blue/20'

  return (
    <div className="mx-auto max-w-2xl p-4 pb-24">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-vigil-blue" aria-hidden />
            <h1 className="font-display text-[26px] font-semibold text-vigil-ink">{t('title')}</h1>
          </div>
          <p className="mt-1 text-[16px] text-vigil-muted">{t('subtitle')}</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex min-h-[44px] items-center gap-1 rounded-input bg-vigil-blue px-3 text-[16px] font-medium text-white"
        >
          <Plus className="h-4 w-4" />
          {t('addEvent')}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilter(cat)}
            className={cn(
              'rounded-badge border px-3 py-1 text-[13px] font-medium transition-colors',
              filter === cat
                ? 'border-vigil-blue bg-vigil-blue-light text-vigil-blue'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-vigil-cloud'
            )}
          >
            {cat === 'all' ? t('filters.all') : t(`categories.${cat}`)}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <form
            onSubmit={handleSubmit}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-card bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-[20px] font-semibold">{t('form.title')}</h2>
              <button type="button" onClick={() => setShowForm(false)} aria-label={t('form.cancel')}>
                <X className="h-5 w-5 text-vigil-muted" />
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <div>
                <label htmlFor="event-title" className="block text-[13px] font-medium text-slate-600">
                  {t('form.eventTitle')} *
                </label>
                <input id="event-title" name="title" required className={inputClass} />
              </div>
              <div>
                <label htmlFor="event-category" className="block text-[13px] font-medium text-slate-600">
                  {t('form.category')} *
                </label>
                <select id="event-category" name="category" required className={inputClass} defaultValue="donation_drive">
                  {CATEGORIES.filter((c) => c !== 'all').map((cat) => (
                    <option key={cat} value={cat}>
                      {t(`categories.${cat}`)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="event-starts" className="block text-[13px] font-medium text-slate-600">
                  {t('form.startsAt')} *
                </label>
                <input id="event-starts" name="starts_at" type="datetime-local" required className={inputClass} />
              </div>
              <div>
                <label htmlFor="event-ends" className="block text-[13px] font-medium text-slate-600">
                  {t('form.endsAt')}
                </label>
                <input id="event-ends" name="ends_at" type="datetime-local" className={inputClass} />
              </div>
              <div>
                <label htmlFor="event-location" className="block text-[13px] font-medium text-slate-600">
                  {t('form.location')} *
                </label>
                <input id="event-location" name="location_label" required className={inputClass} />
              </div>
              <div>
                <label htmlFor="event-desc" className="block text-[13px] font-medium text-slate-600">
                  {t('form.description')}
                </label>
                <textarea id="event-desc" name="description" rows={2} className={inputClass} />
              </div>
              <div>
                <label htmlFor="event-organizer" className="block text-[13px] font-medium text-slate-600">
                  {t('form.organizer')}
                </label>
                <input id="event-organizer" name="organizer_name" className={inputClass} />
              </div>
              <div>
                <label htmlFor="event-contact" className="block text-[13px] font-medium text-slate-600">
                  {t('form.contact')}
                </label>
                <input id="event-contact" name="organizer_contact" type="tel" className={inputClass} />
                <p className="mt-1 text-[13px] text-vigil-muted">{t('form.contactNote')}</p>
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="mt-4 min-h-[44px] w-full rounded-input bg-vigil-blue text-[16px] font-medium text-white disabled:opacity-50"
            >
              {submitting ? t('form.submitting') : t('form.submit')}
            </button>
          </form>
        </div>
      )}

      <div className="mt-6 space-y-6">
        {loading && <div className="skeleton h-24 rounded-card" />}
        {!loading && grouped.length === 0 && (
          <div className="rounded-card border border-slate-200 bg-vigil-cloud py-10 text-center">
            <p className="text-[16px] text-vigil-muted">{t('empty')}</p>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="mt-4 inline-flex min-h-[44px] items-center gap-1 rounded-input bg-vigil-blue px-4 text-[16px] font-medium text-white"
            >
              <Plus className="h-4 w-4" aria-hidden />
              {t('emptyAction')}
            </button>
          </div>
        )}
        {grouped.map(([dateKey, dayEvents]) => (
          <section key={dateKey}>
            <h2 className="font-mono text-[13px] font-medium uppercase tracking-wide text-vigil-muted">
              {formatVenezuelaDateTime(dateKey, locale)}
            </h2>
            <div className="mt-2 space-y-3">
              {dayEvents.map((event) => {
                const Icon = CATEGORY_ICONS[event.category ?? 'other']
                return (
                  <article
                    key={event.id}
                    className="rounded-card border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={cn(
                          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                          CATEGORY_COLORS[event.category ?? 'other']
                        )}
                      >
                        <Icon className="h-4 w-4" aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-[14px] font-medium text-vigil-ink">{event.title}</h3>
                        <p className="mt-0.5 font-mono text-[13px] text-vigil-muted">
                          {formatVenezuelaDateTime(event.starts_at, locale)} ({tzLabel})
                        </p>
                        <p className="mt-1 text-[16px] text-slate-600">{event.location_label}</p>
                        {event.organizer_name && (
                          <p className="mt-1 text-[13px] text-vigil-muted">
                            {t('organizer')}: {event.organizer_name}
                          </p>
                        )}
                        {event.description && (
                          <p className="mt-2 text-[16px] leading-relaxed text-slate-500">{event.description}</p>
                        )}
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
