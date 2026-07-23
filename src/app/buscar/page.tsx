import { MissingPersonSearch } from '@/components/missing/MissingPersonSearch'
import { getRecentMissingPersons } from '@/lib/data'
import { isAnthropicConfigured } from '@/lib/ai/client'
import { getBreakerState, isPhotoSearchAllowed } from '@/lib/ai/circuit-breaker'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

export default async function BuscarPage() {
  const t = await getTranslations('missing')
  const [recent, breaker] = await Promise.all([getRecentMissingPersons(20), getBreakerState()])
  // Photo search is advertised only when it would actually work right now:
  // key configured AND circuit breaker allows it (74 C4).
  const aiAvailable = isAnthropicConfigured() && isPhotoSearchAllowed(breaker)
  return (
    <div className="mx-auto w-full max-w-5xl bg-white">
      <h1 className="sr-only">{t('title')}</h1>
      <MissingPersonSearch initialResults={recent} aiAvailable={aiAvailable} fullWidth />
    </div>
  )
}
