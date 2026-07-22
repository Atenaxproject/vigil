import { CrisisMap } from '@/components/map/CrisisMap'
import { MapAccessibleList } from '@/components/map/MapAccessibleList'
import { AftershockAlert } from '@/components/feed/AftershockAlert'
import { RegionScopeTabs } from '@/components/map/RegionScopeTabs'
import { getMapMarkers, getMissingPersonsForMap, getPublicPropertyAssessments } from '@/lib/data'
import { getMergedSeismicFetch } from '@/lib/seismic'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const t = await getTranslations('map')
  const [seismic, markers, propertyAssessments, missingPersons] = await Promise.all([
    getMergedSeismicFetch(),
    getMapMarkers(),
    getPublicPropertyAssessments(),
    getMissingPersonsForMap(),
  ])
  const events = seismic.events

  return (
    <div className="flex flex-col lg:h-[calc(100vh-44px-48px)]">
      <h1 className="sr-only">{t('title')}</h1>
      <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">
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
        <MapAccessibleList markers={markers} events={events} />
      </div>
    </div>
  )
}
