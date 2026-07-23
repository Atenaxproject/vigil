import { CrisisMap } from '@/components/map/CrisisMap'
import { MapAccessibleList } from '@/components/map/MapAccessibleList'
import { DtvReferralNotice } from '@/components/dtv/DtvReferralNotice'
import { isAnthropicConfigured } from '@/lib/ai/client'
import { getBreakerState, isPhotoSearchAllowed } from '@/lib/ai/circuit-breaker'
import { AftershockAlert } from '@/components/feed/AftershockAlert'
import { SeismicEventList } from '@/components/feed/SeismicEventList'
import { RegionScopeTabs } from '@/components/map/RegionScopeTabs'
import { getMapMarkers, getMissingPersonsForMap, getPublicPropertyAssessments } from '@/lib/data'
import { getLiveAftershockTotal, getMergedSeismicFetch } from '@/lib/seismic'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const t = await getTranslations('map')
  const [seismic, markers, propertyAssessments, missingPersons, totals, breaker] = await Promise.all([
    getMergedSeismicFetch(),
    getMapMarkers(),
    getPublicPropertyAssessments(),
    getMissingPersonsForMap(),
    getLiveAftershockTotal(),
    getBreakerState(),
  ])
  const events = seismic.events
  const photoSearchAvailable = isAnthropicConfigured() && isPhotoSearchAllowed(breaker)

  return (
    <div className="flex flex-col lg:h-[calc(100vh-44px-48px)]">
      <h1 className="sr-only">{t('title')}</h1>
      <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">
        <DtvReferralNotice showCta photoSearchAvailable={photoSearchAvailable} />
        <RegionScopeTabs />
        <AftershockAlert events={events} fetchedAt={seismic.fetchedAt} ok={seismic.ok} />
        <div className="min-h-[min(50vh,400px)] flex-1">
          <CrisisMap
            events={events}
            markers={markers}
            propertyAssessments={propertyAssessments}
            missingPersons={missingPersons}
          />
        </div>
        <SeismicEventList events={events} totalCount={totals.ok ? totals.total : undefined} />
        <MapAccessibleList markers={markers} events={events} />
      </div>
    </div>
  )
}
