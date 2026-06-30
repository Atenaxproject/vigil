import { NextResponse } from 'next/server'
import { CRISIS_CONFIG } from '@/config/crisis.config'
import { getGDACSEvents } from '@/lib/gdacs'

export const revalidate = 300

interface UsgsFeature {
  properties: { mag: number | null; place: string; time: number; url: string }
}

interface ReliefWebReport {
  fields: {
    title: string
    date: { created: string }
    url: string
    source?: Array<{ name: string }>
  }
}

export async function GET() {
  const { mapBounds, crisisDate } = CRISIS_CONFIG

  const [usgsRes, reliefwebRes, gdacsEvents] = await Promise.allSettled([
    fetch(
      `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson` +
        `&minlatitude=${mapBounds.minLat}&maxlatitude=${mapBounds.maxLat}` +
        `&minlongitude=${mapBounds.minLng}&maxlongitude=${mapBounds.maxLng}` +
        `&orderby=time&limit=10&minmagnitude=4.0&starttime=${crisisDate}`,
      { next: { revalidate: 300 } }
    ),
    fetch(
      `https://api.reliefweb.int/v1/reports?appname=vigil-crisis&filter[field]=country.iso3` +
        `&filter[value]=VEN&limit=8&sort[]=date:desc` +
        `&fields[include][]=title&fields[include][]=date&fields[include][]=url&fields[include][]=source`,
      { next: { revalidate: 300 } }
    ),
    getGDACSEvents(),
  ])

  let usgs: { features?: UsgsFeature[] } | null = null
  let reliefweb: { data?: ReliefWebReport[] } | null = null

  if (usgsRes.status === 'fulfilled' && usgsRes.value.ok) {
    usgs = await usgsRes.value.json()
  }
  if (reliefwebRes.status === 'fulfilled' && reliefwebRes.value.ok) {
    reliefweb = await reliefwebRes.value.json()
  }

  const gdacs =
    gdacsEvents.status === 'fulfilled' ? gdacsEvents.value : []

  return NextResponse.json({
    lastUpdated: new Date().toISOString(),
    gdacsEvents: gdacs,
    recentSignificantQuakes:
      usgs?.features?.map((f) => ({
        magnitude: f.properties.mag,
        place: f.properties.place,
        time: f.properties.time,
        url: f.properties.url,
      })) ?? [],
    officialReports:
      reliefweb?.data?.map((r) => ({
        title: r.fields.title,
        date: r.fields.date.created,
        url: r.fields.url,
        source: r.fields.source?.[0]?.name ?? 'ReliefWeb',
      })) ?? [],
  })
}
