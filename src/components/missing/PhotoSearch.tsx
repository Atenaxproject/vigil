'use client'

import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Camera, ExternalLink, Loader2 } from 'lucide-react'
import type { FederatedPerson } from '@/lib/dtv-mapper'
import { tagVigilPerson } from '@/lib/dtv-mapper'
import type { PublicMissingPerson } from '@/types/vigil.types'
import { MissingPersonCard } from '@/components/missing/MissingPersonCard'

const DTV_PLATFORM_URL = 'https://desaparecidosterremotovenezuela.com'

interface PhotoSearchProps {
  aiAvailable?: boolean
}

export function PhotoSearch({ aiAvailable = true }: PhotoSearchProps) {
  const t = useTranslations('missing.photoSearch')
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [vigilResults, setVigilResults] = useState<FederatedPerson[]>([])
  const [dtvResults, setDtvResults] = useState<FederatedPerson[]>([])
  const [confidence, setConfidence] = useState<string | null>(null)
  const [description, setDescription] = useState<string | null>(null)
  const [unavailable, setUnavailable] = useState(false)

  async function handleFile(file: File) {
    setLoading(true)
    setVigilResults([])
    setDtvResults([])
    setConfidence(null)
    setDescription(null)
    setUnavailable(false)

    try {
      const formData = new FormData()
      formData.append('photo', file)
      const res = await fetch('/api/photo-search', { method: 'POST', body: formData })
      const data = (await res.json()) as {
        unavailable?: boolean
        matches?: (PublicMissingPerson & { _source?: 'vigil' })[]
        dtvMatches?: FederatedPerson[]
        confidence?: string
        description?: string | null
      }

      if (data.unavailable || res.status === 503) {
        setUnavailable(true)
        return
      }

      setVigilResults((data.matches ?? []).map((m) => tagVigilPerson(m)))
      setDtvResults(data.dtvMatches ?? [])
      setConfidence(data.confidence ?? null)
      setDescription(data.description ?? null)
    } catch {
      setVigilResults([])
      setDtvResults([])
    } finally {
      setLoading(false)
    }
  }

  if (!aiAvailable) {
    return (
      <div className="mt-4 rounded-input border border-dashed border-slate-300 bg-vigil-cloud p-4 text-center">
        <p className="text-[13px] font-medium text-vigil-ink">{t('comingSoonTitle')}</p>
        <p className="mt-1 text-[13px] text-vigil-muted">{t('comingSoonBody')}</p>
      </div>
    )
  }

  return (
    <div className="mt-4 border-t border-slate-200 pt-4">
      <p className="text-center text-[13px] text-vigil-muted">{t('divider')}</p>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void handleFile(file)
          e.target.value = ''
        }}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className="mt-3 flex w-full min-h-[44px] items-center justify-center gap-2 rounded-input border border-slate-200 bg-white px-4 text-[16px] font-medium text-vigil-blue hover:bg-vigil-cloud disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            {t('analyzing')}
          </>
        ) : (
          <>
            <Camera className="h-4 w-4" aria-hidden />
            {t('uploadButton')}
          </>
        )}
      </button>

      <p className="mt-2 text-[13px] text-vigil-muted">{t('privacyNotice')}</p>

      {unavailable && (
        <div className="mt-3 rounded-input bg-vigil-blue-light p-3 text-[13px] text-vigil-body">
          <p className="font-medium">{t('comingSoonTitle')}</p>
          <p className="mt-1">{t('comingSoonBody')}</p>
        </div>
      )}

      {description && (
        <p className="mt-3 text-[13px] text-vigil-muted">
          <span className="font-medium text-vigil-body">{t('aiDescription')}:</span> {description}
        </p>
      )}

      {vigilResults.length > 0 && (
        <div className="mt-4 space-y-3">
          <p className="text-[13px] font-medium text-vigil-ink">
            {t('vigilMatchLabel', { confidence: confidence ?? 'baja' })}
          </p>
          {vigilResults.map((person) => (
            <MissingPersonCard key={`vigil-${person.id}`} person={person} />
          ))}
        </div>
      )}

      {dtvResults.length > 0 && (
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[13px] font-medium text-vigil-ink">{t('dtvMatchLabel')}</p>
            <a
              href={DTV_PLATFORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[13px] text-slate-600 hover:underline"
            >
              {t('dtvViewFullPlatform')}
              <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
            </a>
          </div>
          {dtvResults.map((person) => (
            <MissingPersonCard key={`dtv-${person.id}`} person={person} />
          ))}
        </div>
      )}
    </div>
  )
}
