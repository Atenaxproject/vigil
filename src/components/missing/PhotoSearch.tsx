'use client'

import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Camera, Loader2 } from 'lucide-react'
import type { PublicMissingPerson } from '@/types/vigil.types'
import { MissingPersonCard } from '@/components/missing/MissingPersonCard'

interface PhotoSearchProps {
  aiAvailable?: boolean
}

export function PhotoSearch({ aiAvailable = true }: PhotoSearchProps) {
  const t = useTranslations('missing.photoSearch')
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<PublicMissingPerson[]>([])
  const [confidence, setConfidence] = useState<string | null>(null)
  const [description, setDescription] = useState<string | null>(null)
  const [unavailable, setUnavailable] = useState(false)

  async function handleFile(file: File) {
    setLoading(true)
    setResults([])
    setConfidence(null)
    setDescription(null)
    setUnavailable(false)

    try {
      const formData = new FormData()
      formData.append('photo', file)
      const res = await fetch('/api/photo-search', { method: 'POST', body: formData })
      const data = (await res.json()) as {
        unavailable?: boolean
        matches?: PublicMissingPerson[]
        confidence?: string
        description?: string | null
      }

      if (data.unavailable || res.status === 503) {
        setUnavailable(true)
        return
      }

      setResults(data.matches ?? [])
      setConfidence(data.confidence ?? null)
      setDescription(data.description ?? null)
    } catch {
      setResults([])
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

      {results.length > 0 && (
        <div className="mt-4 space-y-3">
          <p className="text-[13px] font-medium text-vigil-ink">
            {t('matchLabel', { confidence: confidence ?? 'baja' })}
          </p>
          {results.map((person) => (
            <MissingPersonCard key={person.id} person={person} />
          ))}
        </div>
      )}
    </div>
  )
}
