import { MissingPersonSearch } from '@/components/missing/MissingPersonSearch'
import { RecentMissingFeed } from '@/components/missing/RecentMissingFeed'
import { CrisisMap } from '@/components/map/CrisisMap'
import { AftershockAlert } from '@/components/feed/AftershockAlert'
import { getMapMarkers, getRecentMissingPersons } from '@/lib/data'
import { getVenezuelaSeismicEvents } from '@/lib/usgs'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [events, markers, recent] = await Promise.all([
    getVenezuelaSeismicEvents(),
    getMapMarkers(),
    getRecentMissingPersons(10),
  ])

  return (
    <div className="flex h-[calc(100vh-44px-120px)] flex-col lg:flex-row">
      <section className="flex w-full flex-col border-r border-slate-200 bg-white lg:w-[40%]">
        <MissingPersonSearch initialResults={recent} />
        <RecentMissingFeed initialRecords={recent} />
      </section>
      <section className="flex w-full flex-col gap-3 p-4 lg:w-[60%]">
        <AftershockAlert events={events} />
        <CrisisMap events={events} markers={markers} />
      </section>
    </div>
  )
}
