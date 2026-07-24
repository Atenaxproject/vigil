'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Lock, Search, Users, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import type { Availability, PublicVolunteer, VolunteerSkill } from '@/types/vigil.types'
import { cn } from '@/lib/utils'

const SKILLS: VolunteerSkill[] = [
  'medical',
  'rescue',
  'logistics',
  'translation',
  'tech',
  'construction',
  'drone',
  'legal',
  'psych',
  'communications',
  'structural_engineer',
  'architect',
  'surveyor',
  'logistics_shipping',
  'translation_local',
  'warehouse_sorting',
  'local_driver',
  'fundraising_event',
]

const EQUIPMENT_OPTIONS = ['vehicle', 'tools', 'generator', 'medical_kit', 'drones', 'comms'] as const

const FEATURED_KEYS = [
  'medicalBorderless',
  'structuralEngineers',
  'droneOperators',
  'translators',
  'drivers4x4',
  'psychologists',
  'commsTech',
  'lawyers',
] as const

export default function VoluntariosPage() {
  const t = useTranslations('volunteers')
  const tf = useTranslations('volunteers.form')
  const td = useTranslations('volunteers.directory')
  const [tab, setTab] = useState<'directory' | 'register'>('directory')
  const [volunteers, setVolunteers] = useState<PublicVolunteer[]>([])
  const [loading, setLoading] = useState(true)
  const [skillFilter, setSkillFilter] = useState('')
  const [langFilter, setLangFilter] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [contactVolunteer, setContactVolunteer] = useState<PublicVolunteer | null>(null)

  const fetchVolunteers = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setVolunteers([])
      setLoading(false)
      return
    }
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('public_volunteers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      if (!error && data) {
        setVolunteers(data as PublicVolunteer[])
      }
    } catch {
      setVolunteers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchVolunteers()
  }, [fetchVolunteers])

  const filtered = useMemo(() => {
    return volunteers.filter((v) => {
      if (skillFilter && !v.skills.some((s) => s.includes(skillFilter))) return false
      if (langFilter && !v.languages.some((l) => l.toLowerCase().includes(langFilter.toLowerCase())))
        return false
      if (locationFilter && !v.location_city?.toLowerCase().includes(locationFilter.toLowerCase()))
        return false
      return true
    })
  }, [volunteers, skillFilter, langFilter, locationFilter])

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    const form = new FormData(e.currentTarget)
    const skills = form.getAll('skills') as string[]
    const languages = (form.get('languages') as string).split(',').map((l) => l.trim()).filter(Boolean)
    const equipment = form.getAll('equipment') as string[]

    const payload = {
      full_name: form.get('name') as string,
      skills,
      languages,
      location: form.get('location') as string,
      availability: form.get('availability') as Availability,
      contact_phone: (form.get('phone') as string) || undefined,
      contact_whatsapp: (form.get('whatsapp') as string) || undefined,
      contact_email: (form.get('email') as string) || undefined,
      specialization: (form.get('specialization') as string) || undefined,
      equipment,
      remote_available: form.get('remote_available') === 'on',
      verification_url: (form.get('verification_url') as string) || undefined,
      credential_note: (form.get('credential_note') as string) || undefined,
      public_display: form.get('public_display') !== 'off',
    }

    try {
      const res = await fetch('/api/volunteers/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error()
      toast.success(tf('success'))
      e.currentTarget.reset()
      setTab('directory')
      fetchVolunteers()
    } catch {
      toast.error(tf('error'))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleContact(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!contactVolunteer) return
    const form = new FormData(e.currentTarget)
    try {
      const res = await fetch('/api/volunteers/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          volunteer_id: contactVolunteer.id,
          requester_name: form.get('requester_name'),
          requester_phone: form.get('requester_phone'),
          message: form.get('message') || undefined,
        }),
      })
      if (!res.ok) throw new Error()
      toast.success(td('contactSuccess'))
      setContactVolunteer(null)
    } catch {
      toast.error(td('contactError'))
    }
  }

  const inputClass =
    'mt-1 w-full min-h-[44px] rounded-input border border-slate-200 bg-vigil-cloud px-3 text-[16px] focus:outline-none focus:ring-2 focus:ring-vigil-blue/20'

  return (
    <div className="mx-auto max-w-3xl p-4 pb-24">
      <h1 className="font-display text-[26px] font-semibold text-vigil-ink">{t('title')}</h1>
      <p className="mt-1 text-[16px] text-vigil-muted">{t('subtitle')}</p>

      <div className="mt-6 flex rounded-input border border-slate-200 bg-vigil-cloud p-1">
        {(['directory', 'register'] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setTab(mode)}
            className={cn(
              'flex-1 min-h-[44px] rounded-input text-[16px] font-medium',
              tab === mode ? 'bg-white text-vigil-blue shadow-sm' : 'text-vigil-muted'
            )}
          >
            {td(mode)}
          </button>
        ))}
      </div>

      {tab === 'directory' && (
        <>
          <section className="mt-6">
            <h2 className="text-[20px] font-semibold text-vigil-ink">{td('featuredTitle')}</h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {FEATURED_KEYS.map((key) => (
                <div
                  key={key}
                  className="rounded-card border border-slate-200 bg-vigil-cloud px-3 py-2 text-[16px] text-slate-700"
                >
                  {td(`featured.${key}`)}
                </div>
              ))}
            </div>
          </section>

          <div className="mt-6 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vigil-muted" />
              <input
                type="search"
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                placeholder={td('searchSkill')}
                className="w-full min-h-[44px] rounded-input border border-slate-200 bg-white py-2 pl-10 pr-3 text-[16px]"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="search"
                value={langFilter}
                onChange={(e) => setLangFilter(e.target.value)}
                placeholder={td('searchLanguage')}
                className="min-h-[44px] rounded-input border border-slate-200 bg-white px-3 text-[16px]"
              />
              <input
                type="search"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                placeholder={td('searchLocation')}
                className="min-h-[44px] rounded-input border border-slate-200 bg-white px-3 text-[16px]"
              />
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {loading && <div className="skeleton h-24 rounded-card" />}
            {/* Empty-state policy: only report "no matches" when the user
                actively filtered. An unfiltered empty directory renders nothing
                rather than announcing that no one is here yet. */}
            {!loading && filtered.length === 0 && Boolean(skillFilter || langFilter || locationFilter) && (
              <div className="py-8 text-center">
                <p className="text-[16px] text-vigil-muted">{td('noResults')}</p>
                <button
                  type="button"
                  onClick={() => setTab('register')}
                  className="mt-3 text-[16px] font-medium text-vigil-blue underline-offset-2 hover:underline"
                >
                  {t('form.submit')}
                </button>
              </div>
            )}
            {filtered.map((v) => (
              <article key={v.id} className="rounded-card border border-slate-200 bg-white p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-vigil-blue-light">
                    <Users className="h-5 w-5 text-vigil-blue" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[17px] font-medium text-vigil-ink">{v.display_name}</h3>
                    {v.location_city && (
                      <p className="text-[13px] text-vigil-muted">{v.location_city}</p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {v.skills.map((s) => (
                        <span
                          key={s}
                          className="rounded-badge bg-vigil-blue-light px-2 py-0.5 text-[13px] text-vigil-blue"
                        >
                          {t(`skills.${s}`)}
                        </span>
                      ))}
                    </div>
                    {v.languages.length > 0 && (
                      <p className="mt-2 text-[13px] text-vigil-muted">
                        {td('languages')}: {v.languages.join(', ')}
                      </p>
                    )}
                    {v.specialization && (
                      <p className="mt-1 line-clamp-2 text-[13px] text-slate-600">{v.specialization}</p>
                    )}
                    {v.availability && (
                      <p className="mt-1 text-[13px] font-medium text-slate-700">
                        {t(`availability.${v.availability}`)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-3 border-t border-slate-100 pt-3">
                  <button
                    type="button"
                    onClick={() => setContactVolunteer(v)}
                    className="w-full min-h-[44px] rounded-input bg-vigil-blue text-[16px] font-medium text-white"
                  >
                    {td('connect')}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      {tab === 'register' && (
        <form onSubmit={handleRegister} className="mt-6 space-y-4">
          <div>
            <label htmlFor="name" className="text-[13px] font-medium">
              {tf('name')} *
            </label>
            <input id="name" name="name" required className={inputClass} />
          </div>
          <div>
            <span className="text-[13px] font-medium">{tf('skills')} *</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {SKILLS.map((skill) => (
                <label key={skill} className="flex items-center gap-1 text-[13px]">
                  <input type="checkbox" name="skills" value={skill} className="rounded" />
                  {t(`skills.${skill}`)}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="languages" className="text-[13px] font-medium">
              {tf('languages')} *
            </label>
            <input
              id="languages"
              name="languages"
              required
              placeholder="es, en, pt"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="location" className="text-[13px] font-medium">
              {tf('location')} *
            </label>
            <input id="location" name="location" required className={inputClass} />
          </div>
          <div>
            <label htmlFor="availability" className="text-[13px] font-medium">
              {tf('availability')} *
            </label>
            <select id="availability" name="availability" required className={inputClass}>
              {(['immediate', 'this_week', 'remote_only', 'on_request'] as Availability[]).map(
                (a) => (
                  <option key={a} value={a}>
                    {t(`availability.${a}`)}
                  </option>
                )
              )}
            </select>
          </div>
          <div>
            <label htmlFor="specialization" className="text-[13px] font-medium">
              {tf('specialization')}
            </label>
            <textarea
              id="specialization"
              name="specialization"
              maxLength={200}
              rows={3}
              className={inputClass}
              placeholder={tf('specializationPlaceholder')}
            />
          </div>
          <div>
            <span className="text-[13px] font-medium">{tf('equipment')}</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {EQUIPMENT_OPTIONS.map((eq) => (
                <label key={eq} className="flex items-center gap-1 text-[13px]">
                  <input type="checkbox" name="equipment" value={eq} className="rounded" />
                  {tf(`equipmentOptions.${eq}`)}
                </label>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 text-[16px]">
            <input type="checkbox" name="remote_available" className="rounded" />
            {tf('remoteAvailable')}
          </label>
          <div>
            <label htmlFor="verification_url" className="text-[13px] font-medium">
              {tf('verificationUrl')}
            </label>
            <input id="verification_url" name="verification_url" type="url" className={inputClass} />
          </div>
          <div>
            <label htmlFor="credential_note" className="text-[13px] font-medium">
              {tf('credentialNote')}
            </label>
            <input
              id="credential_note"
              name="credential_note"
              maxLength={300}
              placeholder={tf('credentialNotePlaceholder')}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="phone" className="text-[13px] font-medium">
              {tf('phone')}
            </label>
            <input id="phone" name="phone" className={inputClass} />
          </div>
          <div>
            <label htmlFor="whatsapp" className="text-[13px] font-medium">
              {tf('whatsapp')}
            </label>
            <input id="whatsapp" name="whatsapp" className={inputClass} />
          </div>
          <div>
            <label htmlFor="email" className="text-[13px] font-medium">
              {tf('email')}
            </label>
            <input id="email" name="email" type="email" className={inputClass} />
          </div>
          <label className="flex items-center gap-2 text-[16px]">
            <input type="checkbox" name="public_display" defaultChecked className="rounded" />
            {tf('publicDisplay')}
          </label>
          <p className="flex items-start gap-2 rounded-input bg-status-unverified-bg p-3 text-[13px] text-amber-900">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {tf('privacyNote')}
          </p>
          {/* Age attestation (76 §9): volunteers must be adults. Required gate. */}
          <label className="flex items-start gap-2 text-[16px]">
            <input type="checkbox" name="age_attestation" required className="mt-1 rounded" />
            {tf('ageAttestation')}
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="w-full min-h-[44px] rounded-input bg-vigil-blue text-white disabled:opacity-60"
          >
            {submitting ? tf('submitting') : tf('submit')}
          </button>
        </form>
      )}

      {contactVolunteer && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-card bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-[20px] font-semibold">{td('contactTitle')}</h2>
              <button type="button" onClick={() => setContactVolunteer(null)} aria-label="Cerrar">
                <X className="h-5 w-5 text-vigil-muted" />
              </button>
            </div>
            <p className="mt-2 text-[16px] text-vigil-muted">{contactVolunteer.display_name}</p>
            <form onSubmit={handleContact} className="mt-4 space-y-4">
              <div>
                <label htmlFor="vcr-name" className="text-[13px] font-medium">
                  {td('yourName')} *
                </label>
                <input id="vcr-name" name="requester_name" required className={inputClass} />
              </div>
              <div>
                <label htmlFor="vcr-phone" className="text-[13px] font-medium">
                  {td('yourPhone')} *
                </label>
                <input id="vcr-phone" name="requester_phone" required className={inputClass} />
              </div>
              <div>
                <label htmlFor="vcr-msg" className="text-[13px] font-medium">
                  {td('message')}
                </label>
                <textarea id="vcr-msg" name="message" rows={3} className={inputClass} />
              </div>
              <button
                type="submit"
                className="w-full min-h-[44px] rounded-input bg-vigil-blue text-[16px] font-medium text-white"
              >
                {td('connect')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
