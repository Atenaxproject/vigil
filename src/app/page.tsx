import { HomeMapSection } from '@/components/map/HomeMapSection'
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
    <div className="flex flex-col lg:min-h-[calc(100vh-44px-48px)] lg:[@supports(height:100dvh)]:min-h-[calc(100dvh-44px-48px)]">
      <h1 className="sr-only">{t('title')}</h1>
      <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">
        <DtvReferralNotice showCta photoSearchAvailable={photoSearchAvailable} />
        <RegionScopeTabs />
        <AftershockAlert events={events} fetchedAt={seismic.fetchedAt} ok={seismic.ok} />
        <HomeMapSection
          events={events}
          markers={markers}
          propertyAssessments={propertyAssessments}
          missingPersons={missingPersons}
        />
        <SeismicEventList events={events} totalCount={totals.ok ? totals.total : undefined} />
      </div>
    </div>
  )
}
