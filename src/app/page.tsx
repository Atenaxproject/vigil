import { MissingPersonSearch } from '@/components/missing/MissingPersonSearch'
import { RecentMissingFeed } from '@/components/missing/RecentMissingFeed'
import { CrisisMap } from '@/components/map/CrisisMap'
import { MapAccessibleList } from '@/components/map/MapAccessibleList'
import { AftershockAlert } from '@/components/feed/AftershockAlert'
import { getMapMarkers, getRecentMissingPersons } from '@/lib/data'
import { getVenezuelaSeismicEvents } from '@/lib/usgs'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const t = await getTranslations('map')
  const [events, markers, recent] = await Promise.all([
    getVenezuelaSeismicEvents(),
    getMapMarkers(),
    getRecentMissingPersons(10),
  ])

  return (
    <div className="flex flex-col lg:h-[calc(100vh-44px-120px)] lg:flex-row">
      <h1 className="sr-only">{t('title')}</h1>
      <section className="flex w-full flex-col border-b border-slate-200 bg-white lg:w-[40%] lg:border-b-0 lg:border-r">
        <MissingPersonSearch initialResults={recent} />
        <RecentMissingFeed initialRecords={recent} />
      </section>
      <section className="flex w-full flex-col gap-3 p-4 lg:w-[60%] lg:min-h-0">
        <AftershockAlert events={events} />
        <div className="h-[min(45vh,360px)] shrink-0 lg:h-full lg:min-h-[400px]">
          <CrisisMap events={events} markers={markers} />
        </div>
        <MapAccessibleList markers={markers} events={events} />
      </section>
    </div>
  )
}
