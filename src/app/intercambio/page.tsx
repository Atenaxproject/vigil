'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { formatDistanceToNow } from 'date-fns'
import { es, enUS } from 'date-fns/locale'
import {
  ArrowLeftRight,
  Briefcase,
  DollarSign,
  Heart,
  Home,
  Lock,
  Package,
  Plus,
  Search,
  Wrench,
  Truck,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { ClaimLinkSuccess } from '@/components/ui/ClaimLinkSuccess'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import type {
  PublicResourceExchange,
  ResourceExchangeCategory,
  ResourceExchangeType,
} from '@/types/vigil.types'
import { cn } from '@/lib/utils'

const CATEGORY_ICONS: Record<ResourceExchangeCategory, typeof Package> = {
  goods: Package,
  shelter: Home,
  transport: Truck,
  skills: Briefcase,
  volunteer: Heart,
  equipment: Wrench,
  money: DollarSign,
}

const CATEGORIES: ResourceExchangeCategory[] = [
  'goods',
  'shelter',
  'transport',
  'skills',
  'volunteer',
  'equipment',
  'money',
]

const LANGUAGE_OPTIONS = ['es', 'en', 'pt', 'fr', 'it', 'zh', 'de', 'ru', 'ar']

const PUBLIC_SELECT =
  'id, entry_type, category, title, description, quantity, location, languages, available_until, urgent, status, verified, created_at, updated_at'

type TabType = ResourceExchangeType

export default function IntercambioPage() {
  const t = useTranslations('exchange')
  const tc = useTranslations('common')
  const [tab, setTab] = useState<TabType>('offering')
  const [category, setCategory] = useState<ResourceExchangeCategory | 'all'>('all')
  const [search, setSearch] = useState('')
  const [entries, setEntries] = useState<PublicResourceExchange[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [contactEntry, setContactEntry] = useState<PublicResourceExchange | null>(null)
  const [claimUrl, setClaimUrl] = useState<string | null>(null)
  const [locale, setLocale] = useState('es')

  useEffect(() => {
    setLocale(document.documentElement.lang || 'es')
  }, [])

  const fetchEntries = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setEntries([])
      setLoading(false)
      return
    }
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('resource_exchange')
        .select(PUBLIC_SELECT)
        .eq('entry_type', tab)
        .eq('status', 'active')
        .eq('flagged', false)
        .order('urgent', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(100)

      if (!error && data) {
        setEntries(data as PublicResourceExchange[])
      }
    } catch {
      setEntries([])
    } finally {
      setLoading(false)
    }
  }, [tab])

  useEffect(() => {
    setLoading(true)
    fetchEntries()
  }, [fetchEntries])

  useEffect(() => {
    // No live updates without a configured Supabase instance — avoid opening
    // a websocket that would be blocked/fail and crash the page.
    if (!isSupabaseConfigured()) return

    const supabase = createClient()
    const channel = supabase
      .channel('resource_exchange_live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'resource_exchange' },
        () => {
          fetchEntries()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchEntries])

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (category !== 'all' && e.category !== category) return false
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return (
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q)
      )
    })
  }, [entries, category, search])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    const form = new FormData(e.currentTarget)
    const entryType = (form.get('entry_type') as TabType) || tab
    const langs = form.getAll('languages') as string[]

    const payload = {
      entry_type: entryType,
      category: form.get('category') as ResourceExchangeCategory,
      title: form.get('title') as string,
      description: form.get('description') as string,
      quantity: (form.get('quantity') as string) || undefined,
      location: form.get('location') as string,
      contact_method: form.get('contact_method') as string,
      contact_value: (form.get('contact_value') as string) || undefined,
      languages: langs,
      available_until: (form.get('available_until') as string) || undefined,
      urgent: form.get('urgent') === 'on',
    }

    try {
      const res = await fetch('/api/resource-exchange/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      if (entryType === 'requesting' && data.matchCount > 0) {
        toast.success(t('form.matchSuggestion', { count: data.matchCount }))
      } else if (data.claimUrl) {
        setClaimUrl(data.claimUrl as string)
      } else {
        toast.success(t('form.success'))
      }
      setShowForm(false)
      fetchEntries()
    } catch {
      toast.error(t('form.error'))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleContact(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!contactEntry) return
    const form = new FormData(e.currentTarget)
    try {
      const res = await fetch('/api/resource-exchange/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resource_exchange_id: contactEntry.id,
          requester_name: form.get('requester_name'),
          requester_phone: form.get('requester_phone'),
          message: form.get('message') || undefined,
        }),
      })
      if (!res.ok) throw new Error()
      toast.success(t('contact.success'))
      setContactEntry(null)
    } catch {
      toast.error(t('contact.error'))
    }
  }

  const inputClass =
    'mt-1 w-full min-h-[44px] rounded-input border border-slate-200 bg-vigil-cloud px-3 text-[16px] focus:outline-none focus:ring-2 focus:ring-vigil-blue/20'

  return (
    <div className="mx-auto max-w-3xl p-4 pb-24">
      {claimUrl && (
        <div className="mb-6">
          <ClaimLinkSuccess claimUrl={claimUrl} onDismiss={() => setClaimUrl(null)} />
        </div>
      )}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="h-6 w-6 text-vigil-blue" aria-hidden />
            <h1 className="font-display text-[26px] font-semibold text-vigil-ink">{t('title')}</h1>
          </div>
          <p className="mt-1 text-[16px] text-vigil-muted">{t('subtitle')}</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex min-h-[44px] shrink-0 items-center gap-2 rounded-input bg-vigil-blue px-4 text-[16px] font-medium text-white"
        >
          <Plus className="h-4 w-4" />
          {t('publish')}
        </button>
      </div>

      <div className="mt-6 flex rounded-input border border-slate-200 bg-vigil-cloud p-1">
        {(['offering', 'requesting'] as TabType[]).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setTab(type)}
            className={cn(
              'flex-1 min-h-[44px] rounded-input text-[16px] font-medium transition-colors',
              tab === type ? 'bg-white text-vigil-blue shadow-sm' : 'text-vigil-muted'
            )}
          >
            {t(`tabs.${type}`)}
          </button>
        ))}
      </div>

      <div className="relative mt-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vigil-muted" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="w-full min-h-[44px] rounded-input border border-slate-200 bg-white py-2 pl-10 pr-3 text-[16px]"
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategory('all')}
          className={cn(
            'rounded-badge border px-3 py-1.5 text-[13px] font-medium',
            category === 'all'
              ? 'border-vigil-blue bg-vigil-blue-light text-vigil-blue'
              : 'border-slate-200 text-vigil-muted'
          )}
        >
          {t('allCategories')}
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={cn(
              'rounded-badge border px-3 py-1.5 text-[13px] font-medium',
              category === cat
                ? 'border-vigil-blue bg-vigil-blue-light text-vigil-blue'
                : 'border-slate-200 text-vigil-muted'
            )}
          >
            {t(`categories.${cat}`)}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-28 rounded-card" />
            ))}
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <p className="py-12 text-center text-[16px] text-vigil-muted">{t('noResults')}</p>
        )}
        {filtered.map((entry) => {
          const Icon = CATEGORY_ICONS[entry.category]
          const dateLocale = locale.startsWith('es') ? es : enUS
          return (
            <article
              key={entry.id}
              className="rounded-card border border-slate-200 bg-white p-4 transition-opacity duration-200"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-vigil-blue-light">
                    <Icon className="h-5 w-5 text-vigil-blue" aria-hidden />
                  </span>
                  <div>
                    <h3 className="text-[17px] font-medium text-vigil-ink">{entry.title}</h3>
                    <p className="mt-0.5 text-[13px] text-vigil-muted">
                      {t(`categories.${entry.category}`)}
                      {entry.quantity && ` · ${entry.quantity}`}
                    </p>
                  </div>
                </div>
                {entry.urgent && (
                  <span className="shrink-0 rounded-badge bg-status-missing-bg px-2 py-0.5 text-[13px] font-medium text-status-missing">
                    {t('urgent')}
                  </span>
                )}
              </div>
              <p className="mt-2 line-clamp-2 text-[16px] text-slate-600">{entry.description}</p>
              <p className="mt-2 text-[13px] text-vigil-muted">{entry.location}</p>
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                <time className="font-mono text-[13px] text-vigil-muted">
                  {formatDistanceToNow(new Date(entry.created_at), {
                    addSuffix: true,
                    locale: dateLocale,
                  })}
                </time>
                <button
                  type="button"
                  onClick={() => setContactEntry(entry)}
                  className="rounded-input bg-vigil-blue px-3 py-1.5 text-[13px] font-medium text-white"
                >
                  {t('contact')}
                </button>
              </div>
            </article>
          )
        })}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-card bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-[20px] font-semibold text-vigil-ink">{t('form.title')}</h2>
              <button type="button" onClick={() => setShowForm(false)} aria-label={tc('close')}>
                <X className="h-5 w-5 text-vigil-muted" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <input type="hidden" name="entry_type" value={tab} />
              <div>
                <label htmlFor="ex-title" className="text-[13px] font-medium">
                  {t('form.titleLabel')} *
                </label>
                <input id="ex-title" name="title" required className={inputClass} />
              </div>
              <div>
                <label htmlFor="ex-category" className="text-[13px] font-medium">
                  {t('form.category')} *
                </label>
                <select id="ex-category" name="category" required className={inputClass}>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {t(`categories.${cat}`)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="ex-desc" className="text-[13px] font-medium">
                  {t('form.description')} *
                </label>
                <textarea id="ex-desc" name="description" required rows={3} className={inputClass} />
              </div>
              <div>
                <label htmlFor="ex-qty" className="text-[13px] font-medium">
                  {t('form.quantity')}
                </label>
                <input id="ex-qty" name="quantity" className={inputClass} />
              </div>
              <div>
                <label htmlFor="ex-loc" className="text-[13px] font-medium">
                  {t('form.location')} *
                </label>
                <input id="ex-loc" name="location" required className={inputClass} />
              </div>
              <div>
                <label htmlFor="ex-until" className="text-[13px] font-medium">
                  {t('form.availableUntil')}
                </label>
                <input id="ex-until" name="available_until" type="date" className={inputClass} />
              </div>
              <div>
                <span className="text-[13px] font-medium">{t('form.languages')}</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {LANGUAGE_OPTIONS.map((lang) => (
                    <label key={lang} className="flex items-center gap-1 text-[13px]">
                      <input type="checkbox" name="languages" value={lang} className="rounded" />
                      {lang.toUpperCase()}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="ex-method" className="text-[13px] font-medium">
                  {t('form.contactMethod')} *
                </label>
                <select id="ex-method" name="contact_method" required className={inputClass}>
                  <option value="vigil">{t('form.contactVigil')}</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="phone">{t('form.contactPhone')}</option>
                  <option value="email">Email</option>
                </select>
              </div>
              <div>
                <label htmlFor="ex-contact" className="text-[13px] font-medium">
                  {t('form.contactValue')}
                </label>
                <input id="ex-contact" name="contact_value" className={inputClass} />
                <p className="mt-2 flex items-start gap-2 rounded-input bg-status-unverified-bg p-3 text-[13px] text-amber-900">
                  <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                  {t('form.privacyNotice')}
                </p>
              </div>
              <label className="flex items-center gap-2 text-[16px]">
                <input type="checkbox" name="urgent" className="rounded" />
                {t('form.urgent')}
              </label>
              <button
                type="submit"
                disabled={submitting}
                className="w-full min-h-[44px] rounded-input bg-vigil-blue text-[16px] font-medium text-white disabled:opacity-60"
              >
                {submitting ? t('form.submitting') : t('form.submit')}
              </button>
            </form>
          </div>
        </div>
      )}

      {contactEntry && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-card bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-[20px] font-semibold text-vigil-ink">{t('contact.title')}</h2>
              <button type="button" onClick={() => setContactEntry(null)} aria-label={tc('close')}>
                <X className="h-5 w-5 text-vigil-muted" />
              </button>
            </div>
            <p className="mt-2 text-[16px] text-vigil-muted">{contactEntry.title}</p>
            <form onSubmit={handleContact} className="mt-4 space-y-4">
              <div>
                <label htmlFor="cr-name" className="text-[13px] font-medium">
                  {t('contact.name')} *
                </label>
                <input id="cr-name" name="requester_name" required className={inputClass} />
              </div>
              <div>
                <label htmlFor="cr-phone" className="text-[13px] font-medium">
                  {t('contact.phone')} *
                </label>
                <input id="cr-phone" name="requester_phone" required className={inputClass} />
              </div>
              <div>
                <label htmlFor="cr-msg" className="text-[13px] font-medium">
                  {t('contact.message')}
                </label>
                <textarea id="cr-msg" name="message" rows={3} className={inputClass} />
              </div>
              <button
                type="submit"
                className="w-full min-h-[44px] rounded-input bg-vigil-blue text-[16px] font-medium text-white"
              >
                {t('contact.submit')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
