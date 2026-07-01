'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { es, enUS } from 'date-fns/locale'
import { useLocale, useTranslations } from 'next-intl'
import type { PublicMissingPerson } from '@/types/vigil.types'
import { StatusBadge } from '@/components/missing/StatusBadge'
import { VerifiedBadge } from '@/components/ui/VerifiedBadge'
import { UnverifiedBadge } from '@/components/ui/UnverifiedBadge'
import { FlagButton } from '@/components/ui/FlagButton'

interface MissingPersonCardProps {
  person: PublicMissingPerson
  onContact?: (id: string) => void
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export function MissingPersonCard({ person, onContact }: MissingPersonCardProps) {
  const t = useTranslations('missing')
  const locale = useLocale()
  const dateLocale = locale === 'es' ? es : enUS

  const timeAgo = person.created_at
    ? formatDistanceToNow(new Date(person.created_at), { addSuffix: true, locale: dateLocale })
    : t('card.justNow')

  return (
    <Link href={`/buscar/${person.id}`} className="block">
    <article className="relative rounded-card border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-colors hover:border-slate-300">
      <div className="absolute right-4 top-4">
        <StatusBadge status={person.status} label={t(`status.${person.status}`)} />
      </div>
      <div className="flex gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 text-sm font-semibold text-slate-600"
          aria-hidden
        >
          {getInitials(person.full_name)}
        </div>
        <div className="min-w-0 flex-1 pr-16">
          <h3 className="text-[14px] font-medium text-vigil-ink">{person.full_name}</h3>
          <p className="mt-0.5 text-[13px] text-vigil-muted">
            {[person.gender, person.age ? `${person.age}` : null, person.estado, person.last_seen_location]
              .filter(Boolean)
              .join(' · ')}
          </p>
          <p className="mt-1 text-[13px] font-medium text-slate-600">
            {t('card.lastSeen')} <span className="font-normal">{timeAgo}</span>
          </p>
          {person.notes && (
            <p className="mt-1 line-clamp-2 text-[13px] text-slate-500">{person.notes}</p>
          )}
        </div>
      </div>
      <footer className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
        <div className="flex items-center gap-2">
          {person.verified ? <VerifiedBadge /> : <UnverifiedBadge />}
          <span className="text-[13px] text-vigil-muted">
            {t('card.reportedBy')} {person.source}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <FlagButton />
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onContact?.(person.id)
            }}
            className="rounded-input bg-vigil-blue px-3 py-1.5 text-[13px] font-medium text-white hover:bg-blue-700"
          >
            {t('card.contact')}
          </button>
        </div>
      </footer>
    </article>
    </Link>
  )
}
