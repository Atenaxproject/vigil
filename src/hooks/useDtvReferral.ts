'use client'

/**
 * DTV referral detection (74 Part C).
 *
 * Privacy constraints, non-negotiable:
 * - document.referrer is read client-side only and NEVER persisted to Supabase,
 *   never attached to a report record, never logged server-side.
 * - sessionStorage only — not localStorage, not a cookie.
 * - No analytics event carries the referrer.
 * - Progressive enhancement: if the flag cannot be read, the site behaves
 *   exactly as it does without it.
 */

import { useCallback, useSyncExternalStore } from 'react'

const REFERRAL_KEY = 'vigil_dtv_referral'
const DISMISSED_KEY = 'vigil_dtv_referral_notice_dismissed'
const DTV_HOST = 'desaparecidosterremotovenezuela.com'

let detected = false

function detectOnce() {
  if (detected) return
  detected = true
  try {
    if (!document.referrer) return
    const host = new URL(document.referrer).hostname
    if (host === DTV_HOST || host.endsWith(`.${DTV_HOST}`)) {
      sessionStorage.setItem(REFERRAL_KEY, '1')
    }
  } catch {
    /* progressive enhancement — never a gate */
  }
}

const listeners = new Set<() => void>()

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

function notify() {
  for (const cb of listeners) cb()
}

function readSnapshot(): 'notice' | 'referred' | 'none' {
  try {
    detectOnce()
    if (sessionStorage.getItem(REFERRAL_KEY) !== '1') return 'none'
    return sessionStorage.getItem(DISMISSED_KEY) === '1' ? 'referred' : 'notice'
  } catch {
    return 'none'
  }
}

export interface DtvReferralState {
  /** User arrived from DTV this session (drives sister-platform ordering). */
  referred: boolean
  /** Show the contextual notice (referred and not yet dismissed). */
  showNotice: boolean
  dismissNotice: () => void
}

export function useDtvReferral(): DtvReferralState {
  const snapshot = useSyncExternalStore(subscribe, readSnapshot, () => 'none' as const)

  const dismissNotice = useCallback(() => {
    try {
      sessionStorage.setItem(DISMISSED_KEY, '1')
    } catch {
      /* ignore */
    }
    notify()
  }, [])

  return {
    referred: snapshot !== 'none',
    showNotice: snapshot === 'notice',
    dismissNotice,
  }
}
