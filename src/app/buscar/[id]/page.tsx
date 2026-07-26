import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { MissingPersonNotes } from '@/components/missing/MissingPersonNotes'
import { RemovalRequestAction } from '@/components/missing/RemovalRequestAction'
import { StatusBadge } from '@/components/missing/StatusBadge'
import { createClient } from '@/lib/supabase/server'
import type { PublicMissingPerson } from '@/types/vigil.types'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export default async function MissingPersonDetailPage({ params }: PageProps) {
  const { id } = await params
  const t = await getTranslations('missing')

  const supabase = await createClient()
  const { data, error } = await supabase.from('public_missing_persons').select('*').eq('id', id).single()

  if (error || !data) notFound()

  const person = data as PublicMissingPerson
  // is_minor is intentionally absent from the public view (76 §5). Age is a
  // published recognition field — use it only for UI prominence, not as a
  // legal/compliance signal.
  const likelyMinor = typeof person.age === 'number' && person.age < 18

  return (
    <div className="mx-auto max-w-2xl p-4 pb-24">
      <Link href="/buscar" className="text-[16px] text-vigil-blue underline">
        ← {t('title')}
      </Link>
      <article className="mt-4 rounded-card border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="flex items-start gap-4">
          {person.photo_url ? (
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100">
              <Image
                src={person.photo_url}
                alt=""
                width={96}
                height={96}
                className="h-full w-full object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div
              className="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 text-xl font-semibold text-slate-600"
              aria-hidden
            >
              {initials(person.full_name)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-4">
              <h1 className="font-display text-xl font-semibold text-vigil-ink">{person.full_name}</h1>
              <StatusBadge status={person.status} label={t(`status.${person.status}`)} />
            </div>
          </div>
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
      <RemovalRequestAction personId={person.id} likelyMinor={likelyMinor} />
      <MissingPersonNotes personId={person.id} />
    </div>
  )
}
