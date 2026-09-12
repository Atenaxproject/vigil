import { HomeMapSection } from '@/components/map/HomeMapSection'
import { DtvReferralNotice } from '@/components/dtv/DtvReferralNotice'
import { isAnthropicConfigured } from '@/lib/ai/client'
import { getBreakerState, isPhotoSearchAllowed } from '@/lib/ai/circuit-breaker'
import { AftershockAlert } from '@/components/feed/AftershockAlert'
import { SeismicEventList } from '@/components/feed/SeismicEventList'
import { RegionScopeTabs } from '@/components/map/RegionScopeTabs'
import { getMapMarkers, getMissingPersonsForMap, getPublicPropertyAssessments } from '@/lib/data'
import { getLiveAftershockTotal, getMergedSeismicFetch } from '@/lib/seismic'
import { getNwsAlertsByState } from '@/lib/feeds/nws'
import { getNhcActiveStorms } from '@/lib/feeds/nhc'
import { getWaterGaugesByState } from '@/lib/feeds/usgs-water'
import { buildBasemapUrl, readCartoApiKey } from '@/lib/basemap'
import { CRISIS_CONFIG, diasporaSupportConfig } from '@/config/crisis.config'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

const hasEarthquakeArchetype = CRISIS_CONFIG.disasterArchetypes.includes('earthquake')
const hasHurricaneArchetype = CRISIS_CONFIG.disasterArchetypes.some(
  (a) => a === 'hurricane' || a === 'flood'
)

export default async function HomePage() {
  const t = await getTranslations('map')
  const [seismic, markers, propertyAssessments, missingPersons, totals, breaker, nwsAlerts, nhcStorms, waterGauges] =
    await Promise.all([
      hasEarthquakeArchetype
        ? getMergedSeismicFetch()
        : Promise.resolve({ events: [], fetchedAt: undefined, ok: true }),
      getMapMarkers(),
      getPublicPropertyAssessments(),
      getMissingPersonsForMap(),
      hasEarthquakeArchetype ? getLiveAftershockTotal() : Promise.resolve({ total: 0, m4Plus: 0, ok: false }),
      getBreakerState(),
      // NWS/USGS-water are US-only feeds — 'FL' per prompt 52's Florida spec.
      // Statewide gauge dump, not the ~15-site list the spec prefers — that
      // site list is still an open TODO-BEFORE-LAUNCH item.
      hasHurricaneArchetype ? getNwsAlertsByState('FL') : Promise.resolve([]),
      hasHurricaneArchetype ? getNhcActiveStorms() : Promise.resolve([]),
      hasHurricaneArchetype ? getWaterGaugesByState('FL') : Promise.resolve([]),
    ])
  const events = seismic.events
  const photoSearchAvailable = isAnthropicConfigured() && isPhotoSearchAllowed(breaker)

  return (
    <div className="flex flex-col lg:min-h-[calc(100vh-44px-48px)] lg:[@supports(height:100dvh)]:min-h-[calc(100dvh-44px-48px)]">
      <h1 className="sr-only">{t('title')}</h1>
      <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">
        <DtvReferralNotice showCta photoSearchAvailable={photoSearchAvailable} />
        {diasporaSupportConfig.enabled && <RegionScopeTabs />}
        {hasEarthquakeArchetype && (
          <AftershockAlert events={events} fetchedAt={seismic.fetchedAt} ok={seismic.ok} />
        )}
        <HomeMapSection
          events={events}
          markers={markers}
          propertyAssessments={propertyAssessments}
          missingPersons={missingPersons}
          tileUrl={buildBasemapUrl(readCartoApiKey())}
          nwsAlerts={nwsAlerts}
          nhcStorms={nhcStorms}
          waterGauges={waterGauges}
          evacuationZonesUrl={CRISIS_CONFIG.evacuationZonesUrl}
        />
        {hasEarthquakeArchetype && (
          <SeismicEventList events={events} totalCount={totals.ok ? totals.total : undefined} />
        )}
      </div>
    </div>
  )
}
