'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { es, enUS } from 'date-fns/locale'
import { ExternalLink } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import type { FederatedPerson } from '@/lib/dtv-mapper'
import { tagVigilPerson } from '@/lib/dtv-mapper'
import type { PublicMissingPerson } from '@/types/vigil.types'
import { StatusBadge } from '@/components/missing/StatusBadge'
import { VerifiedBadge } from '@/components/ui/VerifiedBadge'
import { UnverifiedBadge } from '@/components/ui/UnverifiedBadge'
import { FlagButton } from '@/components/ui/FlagButton'

interface MissingPersonCardProps {
  person: PublicMissingPerson | FederatedPerson
  onContact?: (id: string) => void
}

const DTV_PLATFORM_URL = 'https://desaparecidosterremotovenezuela.com'

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
  const federated: FederatedPerson =
    '_source' in person && person._source ? person : tagVigilPerson(person)
  const isDtv = federated._source === 'dtv'

  const timeAgo = federated.created_at
    ? formatDistanceToNow(new Date(federated.created_at), { addSuffix: true, locale: dateLocale })
    : t('card.justNow')

  const cardContent = (
    <article className="relative rounded-card border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-colors hover:border-slate-300">
      <div className="absolute right-4 top-4">
        <StatusBadge status={federated.status} label={t(`status.${federated.status}`)} />
      </div>
      <div className="flex gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 text-sm font-semibold text-slate-600"
          aria-hidden
        >
          {getInitials(federated.full_name)}
        </div>
        <div className="min-w-0 flex-1 pr-16">
          <h3 className="text-[14px] font-medium text-vigil-ink">{federated.full_name}</h3>
          <p className="mt-0.5 text-[13px] text-vigil-muted">
            {[federated.gender, federated.age ? `${federated.age}` : null, federated.estado, federated.last_seen_location]
              .filter(Boolean)
              .join(' · ')}
          </p>
          <p className="mt-1 text-[13px] font-medium text-slate-600">
            {t('card.lastSeen')} <span className="font-normal">{timeAgo}</span>
          </p>
          {federated.notes && (
            <p className="mt-1 line-clamp-2 text-[13px] text-slate-500">{federated.notes}</p>
          )}
        </div>
      </div>
      <footer className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
        <div className="flex flex-wrap items-center gap-2">
          {isDtv ? (
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[13px] text-slate-600">
              {t('card.dtvSourceBadge')}
            </span>
          ) : federated.verified ? (
            <VerifiedBadge />
          ) : (
            <UnverifiedBadge />
          )}
          {!isDtv && (
            <span className="text-[13px] text-vigil-muted">
              {t('card.reportedBy')} {federated.source}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isDtv && <FlagButton />}
          {isDtv ? (
            <span
              className="inline-flex items-center gap-1 rounded-input bg-slate-600 px-3 py-1.5 text-[13px] font-medium text-white"
              aria-hidden
            >
              {t('card.dtvViewPlatform')}
              <ExternalLink className="h-3 w-3" />
            </span>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onContact?.(federated.id)
              }}
              className="rounded-input bg-vigil-blue px-3 py-1.5 text-[13px] font-medium text-white hover:bg-blue-700"
            >
              {t('card.contact')}
            </button>
          )}
        </div>
      </footer>
    </article>
  )

  if (isDtv) {
    return (
      <a
        href={federated.dtvUrl ?? DTV_PLATFORM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        {cardContent}
      </a>
    )
  }

  return (
    <Link href={`/buscar/${federated.id}`} className="block">
      {cardContent}
    </Link>
  )
}
