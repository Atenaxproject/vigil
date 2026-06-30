'use client'

import { useCallback, useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { es, enUS } from 'date-fns/locale'
import { useLocale, useTranslations } from 'next-intl'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { cn } from '@/lib/utils'

export type NoteType = 'sighting' | 'status_update' | 'encouragement' | 'correction'

export interface MissingPersonNote {
  id: string
  author_name: string
  note_type: NoteType
  message: string
  created_at: string
}

const NOTE_TYPE_STYLES: Record<NoteType, string> = {
  sighting: 'bg-blue-50 text-blue-700 border-blue-200',
  status_update: 'bg-green-50 text-green-700 border-green-200',
  encouragement: 'bg-slate-50 text-slate-600 border-slate-200',
  correction: 'bg-amber-50 text-amber-800 border-amber-200',
}

interface MissingPersonNotesProps {
  personId: string
}

export function MissingPersonNotes({ personId }: MissingPersonNotesProps) {
  const t = useTranslations('notes')
  const locale = useLocale()
  const dateLocale = locale === 'es' ? es : enUS
  const [notes, setNotes] = useState<MissingPersonNote[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [authorName, setAuthorName] = useState('')
  const [noteType, setNoteType] = useState<NoteType>('sighting')
  const [message, setMessage] = useState('')

  const fetchNotes = useCallback(async () => {
    try {
      const res = await fetch(`/api/missing-persons/notes?person_id=${personId}`)
      const data = (await res.json()) as { notes?: MissingPersonNote[] }
      setNotes(data.notes ?? [])
    } catch {
      setNotes([])
    } finally {
      setLoading(false)
    }
  }, [personId])

  useEffect(() => {
    void fetchNotes()
  }, [fetchNotes])

  useEffect(() => {
    if (!isSupabaseConfigured()) return

    const supabase = createClient()
    const channel = supabase
      .channel(`notes-${personId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'missing_person_notes',
          filter: `missing_person_id=eq.${personId}`,
        },
        (payload) => {
          const row = payload.new as MissingPersonNote
          setNotes((prev) => {
            if (prev.some((n) => n.id === row.id)) return prev
            return [row, ...prev]
          })
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [personId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/missing-persons/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          missing_person_id: personId,
          author_name: authorName,
          note_type: noteType,
          message,
        }),
      })
      if (!res.ok) throw new Error()
      toast.success(t('form.success'))
      setAuthorName('')
      setMessage('')
      setShowForm(false)
      void fetchNotes()
    } catch {
      toast.error(t('form.error'))
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'mt-1 w-full min-h-[44px] rounded-input border border-slate-200 bg-vigil-cloud px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-vigil-blue/20'

  return (
    <section className="mt-8 border-t border-slate-200 pt-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-lg font-semibold text-vigil-ink">{t('title')}</h2>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="rounded-input bg-vigil-blue px-3 py-1.5 text-[11px] font-medium text-white"
        >
          {t('addUpdate')}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3 rounded-card border border-slate-200 bg-vigil-cloud p-4">
          <div>
            <label htmlFor="note-author" className="block text-[11px] font-medium text-slate-600">
              {t('form.authorName')} *
            </label>
            <input
              id="note-author"
              required
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="note-type" className="block text-[11px] font-medium text-slate-600">
              {t('form.noteType')}
            </label>
            <select
              id="note-type"
              value={noteType}
              onChange={(e) => setNoteType(e.target.value as NoteType)}
              className={inputClass}
            >
              {(Object.keys(NOTE_TYPE_STYLES) as NoteType[]).map((type) => (
                <option key={type} value={type}>
                  {t(`types.${type}`)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="note-message" className="block text-[11px] font-medium text-slate-600">
              {t('form.message')} *
            </label>
            <textarea
              id="note-message"
              required
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="min-h-[44px] w-full rounded-input bg-vigil-blue text-[13px] font-medium text-white disabled:opacity-50"
          >
            {submitting ? t('form.submitting') : t('form.submit')}
          </button>
        </form>
      )}

      <div className="mt-4 space-y-3">
        {loading && <div className="skeleton h-16 rounded-card" />}
        {!loading && notes.length === 0 && (
          <p className="text-center text-[13px] text-vigil-muted">{t('empty')}</p>
        )}
        {notes.map((note) => (
          <article key={note.id} className="rounded-card border border-slate-200 bg-white p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[13px] font-medium text-vigil-ink">{note.author_name}</span>
              <span
                className={cn(
                  'rounded-badge border px-2 py-0.5 text-[10px] font-medium',
                  NOTE_TYPE_STYLES[note.note_type]
                )}
              >
                {t(`types.${note.note_type}`)}
              </span>
              <time className="ml-auto font-mono text-[11px] text-vigil-muted">
                {formatDistanceToNow(new Date(note.created_at), { addSuffix: true, locale: dateLocale })}
              </time>
            </div>
            <p className="mt-2 text-[13px] leading-relaxed text-slate-600">{note.message}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
