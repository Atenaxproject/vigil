'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { isClaimToken, sanitizeText } from '@/lib/security/validate'

const STORAGE_KEY = 'vigil-claim-tokens'

export type StoredClaim = {
  kind: 'reporte' | 'intercambio' | 'evaluacion'
  token: string
  label?: string
  savedAt: string
}

function normalizeClaim(raw: unknown): StoredClaim | null {
  if (!raw || typeof raw !== 'object') return null
  const c = raw as Partial<StoredClaim>
  if (c.kind !== 'reporte' && c.kind !== 'intercambio' && c.kind !== 'evaluacion') return null
  if (typeof c.token !== 'string' || !isClaimToken(c.token)) return null
  const token = c.token.trim()
  const label =
    typeof c.label === 'string' && c.label.trim() ? sanitizeText(c.label) : undefined
  const savedAt = typeof c.savedAt === 'string' ? c.savedAt : new Date().toISOString()
  return { kind: c.kind, token, label, savedAt }
}

export function loadClaims(): StoredClaim[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.map(normalizeClaim).filter((c): c is StoredClaim => c !== null)
  } catch {
    return []
  }
}

export function saveClaim(claim: StoredClaim) {
  const normalized = normalizeClaim(claim)
  if (!normalized) return
  const list = loadClaims().filter(
    (c) => !(c.kind === normalized.kind && c.token === normalized.token)
  )
  list.unshift(normalized)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 40)))
}

function hrefFor(c: StoredClaim): string | null {
  // Re-check at the Link sink so tainted DOM/localStorage strings never reach href.
  if (!isClaimToken(c.token)) return null
  const token = c.token.trim()
  if (c.kind === 'intercambio') return `/mi-intercambio/${token}`
  if (c.kind === 'evaluacion') return `/mi-evaluacion/${token}`
  return `/mi-reporte/${token}`
}

export function MisReportesClient() {
  const t = useTranslations('misReportes')
  const [claims, setClaims] = useState<StoredClaim[]>([])
  const [manual, setManual] = useState('')
  const [manualError, setManualError] = useState(false)

  useEffect(() => {
    setClaims(loadClaims())
  }, [])

  function addManual() {
    const token = manual.trim()
    if (!token) return
    if (!isClaimToken(token)) {
      setManualError(true)
      return
    }
    setManualError(false)
    saveClaim({
      kind: 'reporte',
      token,
      savedAt: new Date().toISOString(),
    })
    setClaims(loadClaims())
    setManual('')
  }

  function remove(token: string, kind: StoredClaim['kind']) {
    const next = loadClaims().filter((c) => !(c.token === token && c.kind === kind))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setClaims(next)
  }

  return (
    <div className="mx-auto max-w-lg p-4 pb-24">
      <h1 className="font-display text-[26px] font-semibold text-vigil-ink">{t('title')}</h1>
      <p className="mt-1 text-[16px] text-vigil-muted">{t('subtitle')}</p>

      {claims.length === 0 ? (
        <div className="mt-6 rounded-card border border-slate-200 bg-vigil-cloud p-5">
          <p className="text-[16px] text-vigil-body">{t('emptyExplainer')}</p>
          <Link
            href="/reportar"
            className="mt-4 inline-flex min-h-[44px] items-center rounded-input bg-vigil-blue px-4 text-[16px] font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vigil-blue/40"
          >
            {t('emptyCta')}
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {claims.map((c) => {
            const href = hrefFor(c)
            if (!href) return null
            const label = c.label ? sanitizeText(c.label) : t(c.kind)
            return (
              <li
                key={`${c.kind}-${c.token}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-card border border-slate-200 bg-white p-4"
              >
                <div>
                  <Link
                    href={href}
                    className="text-[16px] font-medium text-vigil-blue hover:underline"
                  >
                    {label}
                  </Link>
                  <p className="font-mono text-[13px] text-vigil-muted">{c.token.slice(0, 8)}…</p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(c.token, c.kind)}
                  className="min-h-[44px] rounded-input border border-slate-200 px-3 text-[13px]"
                >
                  {t('remove')}
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <div className="mt-8">
        <label htmlFor="claim-token" className="block text-[13px] text-vigil-muted">
          {t('addLabel')}
        </label>
        <div className="mt-1 flex gap-2">
          <input
            id="claim-token"
            value={manual}
            onChange={(e) => {
              setManual(e.target.value)
              setManualError(false)
            }}
            className="min-h-[44px] flex-1 rounded-input border border-slate-200 px-3 text-[16px]"
            autoComplete="off"
          />
          <button
            type="button"
            onClick={addManual}
            className="min-h-[44px] rounded-input bg-vigil-blue px-4 text-[16px] font-medium text-white"
          >
            {t('add')}
          </button>
        </div>
        {manualError ? (
          <p className="mt-1 text-[13px] text-red-700" role="alert">
            {t('invalidToken')}
          </p>
        ) : null}
      </div>

      <aside className="mt-8 rounded-card border border-slate-200 bg-vigil-cloud p-4 text-[13px] text-vigil-body">
        <p className="font-medium text-vigil-ink">{t('claimRecoveryTitle')}</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>{t('claimRecoveryEmail')}</li>
          <li>{t('claimRecoveryDevice')}</li>
          <li>{t('claimRecoveryPaste')}</li>
        </ul>
        <p className="mt-2 text-vigil-muted">{t('claimRecoveryNoLookup')}</p>
      </aside>
    </div>
  )
}
