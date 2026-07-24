import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { MissingPersonNotes } from '@/components/missing/MissingPersonNotes'
import { StatusBadge } from '@/components/missing/StatusBadge'
import { createClient } from '@/lib/supabase/server'
import type { PublicMissingPerson } from '@/types/vigil.types'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function MissingPersonDetailPage({ params }: PageProps) {
  const { id } = await params
  const t = await getTranslations('missing')

  const supabase = await createClient()
  const { data, error } = await supabase.from('public_missing_persons').select('*').eq('id', id).single()

  if (error || !data) notFound()

  const person = data as PublicMissingPerson

  return (
    <div className="mx-auto max-w-2xl p-4 pb-24">
      <Link href="/buscar" className="text-[16px] text-vigil-blue underline">
        ← {t('title')}
      </Link>
      <article className="mt-4 rounded-card border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="flex items-start justify-between gap-4">
          <h1 className="font-display text-xl font-semibold text-vigil-ink">{person.full_name}</h1>
          <StatusBadge status={person.status} label={t(`status.${person.status}`)} />
        </div>
        <dl className="mt-4 space-y-2 text-[16px]">
          {person.age && (
            <div>
              <dt className="text-[13px] text-vigil-muted">{t('form.age')}</dt>
              <dd>{person.age}</dd>
            </div>
          )}
          {person.gender && (
            <div>
              <dt className="text-[13px] text-vigil-muted">{t('form.gender')}</dt>
              <dd>{t(`form.genderOptions.${person.gender as 'male'}`)}</dd>
            </div>
          )}
          <div>
            <dt className="text-[13px] text-vigil-muted">{t('form.lastSeen')}</dt>
            {/* Municipio-level fallback when the free-text location is absent
                (minor records — the view nulls it, 76 §3). */}
            <dd>
              {person.last_seen_location ??
                ([person.municipio, person.estado].filter(Boolean).join(', ') || '—')}
            </dd>
          </div>
          {person.notes && (
            <div>
              <dt className="text-[13px] text-vigil-muted">{t('form.notes')}</dt>
              <dd className="text-slate-600">{person.notes}</dd>
            </div>
          )}
        </dl>
      </article>
      <MissingPersonNotes personId={person.id} />
    </div>
  )
}
