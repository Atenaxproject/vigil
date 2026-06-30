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
      <section className="flex w-full min-w-0 flex-col gap-3 p-4 lg:w-[60%] lg:min-h-0">
        <AftershockAlert events={events} />
        {/*
          Map cell must fill ONLY the space left after its siblings (AftershockAlert +
          MapAccessibleList). On desktop it uses flex-1 (not h-full): h-full = 100% of the
          section, which — combined with the sibling alert/list + padding/gaps — overflowed
          the bounded grid cell and bled the map over the footer. flex-1 keeps the section
          bounded so the footer always sits below the map in normal flow.
        */}
        <div className="h-[min(45vh,360px)] shrink-0 lg:h-auto lg:min-h-[280px] lg:flex-1">
          <CrisisMap events={events} markers={markers} />
        </div>
        <MapAccessibleList markers={markers} events={events} />
      </section>
    </div>
  )
}
