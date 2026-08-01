'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

const STORAGE_KEY = 'vigil-claim-tokens'
const CLAIM_TOKEN_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export type StoredClaim = {
  kind: 'reporte' | 'intercambio' | 'evaluacion'
  token: string
  label?: string
  savedAt: string
}

function normalizeClaimToken(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  const withoutQuery = trimmed.split(/[?#]/, 1)[0] ?? trimmed
  const candidate = withoutQuery.replace(/\/+$/, '').split('/').pop() ?? withoutQuery

  return CLAIM_TOKEN_PATTERN.test(candidate) ? candidate.toLowerCase() : null
}

function isStoredClaimKind(value: unknown): value is StoredClaim['kind'] {
  return value === 'reporte' || value === 'intercambio' || value === 'evaluacion'
}

export function loadClaims(): StoredClaim[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed.flatMap((claim) => {
      if (!claim || typeof claim !== 'object') return []
      const entry = claim as Partial<StoredClaim>

      const token = normalizeClaimToken(typeof entry.token === 'string' ? entry.token : '')
      if (!token || !isStoredClaimKind(entry.kind) || typeof entry.savedAt !== 'string') return []

      return [
        {
          kind: entry.kind,
          token,
          label: typeof entry.label === 'string' ? entry.label : undefined,
          savedAt: entry.savedAt,
        } satisfies StoredClaim,
      ]
    })
  } catch {
    return []
  }
}

export function saveClaim(claim: StoredClaim) {
  const token = normalizeClaimToken(claim.token)
  if (!token) return

  const normalizedClaim = { ...claim, token }
  const list = loadClaims().filter((c) => !(c.kind === normalizedClaim.kind && c.token === normalizedClaim.token))
  list.unshift(normalizedClaim)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 40)))
}

export function MisReportesClient() {
  const t = useTranslations('misReportes')
  const [claims, setClaims] = useState<StoredClaim[]>([])
  const [manual, setManual] = useState('')

  useEffect(() => {
    setClaims(loadClaims())
  }, [])

  function addManual() {
    const token = normalizeClaimToken(manual)
    if (!token) return
    const claim: StoredClaim = {
      kind: 'reporte',
      token,
      savedAt: new Date().toISOString(),
    }
    saveClaim(claim)
    setClaims(loadClaims())
    setManual('')
  }

  function remove(token: string, kind: StoredClaim['kind']) {
    const next = loadClaims().filter((c) => !(c.token === token && c.kind === kind))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setClaims(next)
  }

  const hrefFor = (c: StoredClaim) => {
    const token = encodeURIComponent(c.token)
    if (c.kind === 'intercambio') return `/mi-intercambio/${token}`
    if (c.kind === 'evaluacion') return `/mi-evaluacion/${token}`
    return `/mi-reporte/${token}`
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
          {claims.map((c) => (
            <li
              key={`${c.kind}-${c.token}`}
              className="flex flex-wrap items-center justify-between gap-2 rounded-card border border-slate-200 bg-white p-4"
            >
              <div>
                <Link href={hrefFor(c)} className="text-[16px] font-medium text-vigil-blue hover:underline">
                  {c.label || t(c.kind)}
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
          ))}
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
            onChange={(e) => setManual(e.target.value)}
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
