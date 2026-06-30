'use client'

import { useCallback, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { CRISIS_CONFIG } from '@/config/crisis.config'
import toast from 'react-hot-toast'
import type { RescuerPresenceType } from '@/types/vigil.types'

interface ActivePresence {
  id: string
  display_name: string
  status: string
  last_checkin: string
}

export default function EquipoActivoPage() {
  const t = useTranslations('rescuer')
  const [displayName, setDisplayName] = useState('')
  const [teamOrOrg, setTeamOrOrg] = useState('')
  const [presenceType, setPresenceType] = useState<RescuerPresenceType>('volunteer')
  const [notes, setNotes] = useState('')
  const [phone, setPhone] = useState('')
  const [lat, setLat] = useState<number>(CRISIS_CONFIG.mapBounds.centerLat)
  const [lng, setLng] = useState<number>(CRISIS_CONFIG.mapBounds.centerLng)
  const [active, setActive] = useState<ActivePresence | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem('vigil_presence_id')
    const storedName = sessionStorage.getItem('vigil_presence_name')
    if (stored && storedName) {
      setActive({ id: stored, display_name: storedName, status: 'checked_in', last_checkin: new Date().toISOString() })
    }
  }, [])

  function useMyLocation() {
    if (!navigator.geolocation) {
      toast.error(t('noGps'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude)
        setLng(pos.coords.longitude)
      },
      () => toast.error(t('gpsDenied'))
    )
  }

  async function register() {
    if (!displayName.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/rescuer-presence/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: displayName.trim(),
          team_or_org: teamOrOrg.trim() || undefined,
          presence_type: presenceType,
          lat,
          lng,
          notes: notes.trim() || undefined,
          contact_phone: phone.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      sessionStorage.setItem('vigil_presence_id', data.presence.id)
      sessionStorage.setItem('vigil_presence_name', displayName.trim())
      setActive({
        id: data.presence.id,
        display_name: displayName.trim(),
        status: data.presence.status,
        last_checkin: data.presence.last_checkin,
      })
      toast.success(t('registered'))
    } catch {
      toast.error(t('error'))
    } finally {
      setSubmitting(false)
    }
  }

  const checkIn = useCallback(async (status?: 'checked_in' | 'needs_assistance' | 'signed_off') => {
    if (!active) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/rescuer-presence/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: active.id, status }),
      })
      if (!res.ok) throw new Error('fail')
      const data = await res.json()
      if (status === 'signed_off') {
        sessionStorage.removeItem('vigil_presence_id')
        sessionStorage.removeItem('vigil_presence_name')
        setActive(null)
        toast.success(t('signedOff'))
      } else if (status === 'needs_assistance') {
        setActive((a) => (a ? { ...a, status: 'needs_assistance' } : a))
        toast.success(t('sosSent'))
      } else {
        setActive((a) =>
          a ? { ...a, status: data.presence.status, last_checkin: data.presence.last_checkin } : a
        )
        toast.success(t('checkinOk'))
      }
    } catch {
      toast.error(t('error'))
    } finally {
      setSubmitting(false)
    }
  }, [active, t])

  const inputClass =
    'mt-1 w-full min-h-[48px] rounded-input border border-slate-200 bg-vigil-cloud px-3 text-[17px]'

  if (active) {
    return (
      <div className="mx-auto max-w-lg space-y-4 p-4 pb-24">
        <h1 className="font-display text-[26px] font-semibold text-vigil-ink">{t('checkedInTitle')}</h1>
        <p className="text-[17px] text-slate-600">{active.display_name}</p>

        <button
          type="button"
          onClick={() => void checkIn('needs_assistance')}
          disabled={submitting}
          className="w-full min-h-[56px] rounded-input bg-status-missing text-[20px] font-bold text-white disabled:opacity-50"
        >
          {t('sos')}
        </button>

        <button
          type="button"
          onClick={() => void checkIn('checked_in')}
          disabled={submitting}
          className="w-full min-h-[48px] rounded-input bg-vigil-blue text-[17px] font-medium text-white disabled:opacity-50"
        >
          {t('checkin')}
        </button>

        <button
          type="button"
          onClick={() => void checkIn('signed_off')}
          disabled={submitting}
          className="w-full min-h-[44px] rounded-input border border-slate-200 text-[16px] text-slate-600"
        >
          {t('signOff')}
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg space-y-4 p-4 pb-24">
      <h1 className="font-display text-[26px] font-semibold text-vigil-ink">{t('title')}</h1>
      <p className="text-[16px] text-vigil-muted">{t('subtitle')}</p>

      <div>
        <label htmlFor="display-name" className="text-[13px] font-medium text-slate-600">
          {t('name')} *
        </label>
        <input
          id="display-name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className={inputClass}
          required
        />
      </div>

      <div>
        <label htmlFor="team" className="text-[13px] font-medium text-slate-600">
          {t('team')}
        </label>
        <input id="team" value={teamOrOrg} onChange={(e) => setTeamOrOrg(e.target.value)} className={inputClass} />
      </div>

      <div>
        <label htmlFor="type" className="text-[13px] font-medium text-slate-600">
          {t('type')}
        </label>
        <select
          id="type"
          value={presenceType}
          onChange={(e) => setPresenceType(e.target.value as RescuerPresenceType)}
          className={inputClass}
        >
          <option value="rescue_team">{t('types.rescue_team')}</option>
          <option value="medical">{t('types.medical')}</option>
          <option value="volunteer">{t('types.volunteer')}</option>
          <option value="individual">{t('types.individual')}</option>
        </select>
      </div>

      <button type="button" onClick={useMyLocation} className="text-[17px] text-vigil-blue underline">
        {t('useGps')}
      </button>

      <div>
        <label htmlFor="notes" className="text-[13px] font-medium text-slate-600">
          {t('notes')}
        </label>
        <textarea id="notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass} />
      </div>

      <div>
        <label htmlFor="phone" className="text-[13px] font-medium text-slate-600">
          {t('phone')}
        </label>
        <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
        <p className="mt-1 text-[13px] text-vigil-muted">{t('phonePrivate')}</p>
      </div>

      <button
        type="button"
        onClick={() => void register()}
        disabled={submitting || !displayName.trim()}
        className="w-full min-h-[52px] rounded-input bg-vigil-blue text-[17px] font-medium text-white disabled:opacity-50"
      >
        {submitting ? t('submitting') : t('register')}
      </button>
    </div>
  )
}
