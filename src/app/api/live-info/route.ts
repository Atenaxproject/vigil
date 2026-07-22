import { NextResponse } from 'next/server'
import { CRISIS_CONFIG } from '@/config/crisis.config'
import { recordFeedHealth } from '@/lib/feed-health-server'
import { getGDACSEvents } from '@/lib/gdacs'
import { ALERT_WINDOW_DAYS } from '@/lib/usgs'

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

function rollingStartIso(windowDays: number): string {
  return new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

export async function GET() {
  const { mapBounds } = CRISIS_CONFIG
  const usgsStart = rollingStartIso(ALERT_WINDOW_DAYS)
  const fetchedAt = new Date().toISOString()

  const [usgsRes, reliefwebRes, gdacsEvents] = await Promise.allSettled([
    fetch(
      `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson` +
        `&minlatitude=${mapBounds.minLat}&maxlatitude=${mapBounds.maxLat}` +
        `&minlongitude=${mapBounds.minLng}&maxlongitude=${mapBounds.maxLng}` +
        `&orderby=time&limit=10&minmagnitude=4.0&starttime=${usgsStart}`,
      { next: { revalidate: 300, tags: ['usgs-seismic'] } }
    ),
    fetch(
      `https://api.reliefweb.int/v1/reports?appname=vigil-crisis&filter[field]=country.iso3` +
        `&filter[value]=VEN&limit=8&sort[]=date:desc` +
        `&fields[include][]=title&fields[include][]=date&fields[include][]=url&fields[include][]=source`,
      { next: { revalidate: 3600, tags: ['reliefweb'] } }
    ),
    getGDACSEvents(),
  ])

  let usgs: { features?: UsgsFeature[] } | null = null
  let reliefweb: { data?: ReliefWebReport[] } | null = null

  if (usgsRes.status === 'fulfilled' && usgsRes.value.ok) {
    usgs = await usgsRes.value.json()
    await recordFeedHealth({
      feedId: 'usgs',
      label: 'USGS seismic',
      ok: true,
      itemCount: usgs?.features?.length ?? 0,
      meta: { via: 'live-info', starttime: usgsStart, windowDays: ALERT_WINDOW_DAYS },
    })
  } else {
    await recordFeedHealth({
      feedId: 'usgs',
      label: 'USGS seismic',
      ok: false,
      error: usgsRes.status === 'rejected' ? String(usgsRes.reason) : 'HTTP error',
      meta: { via: 'live-info' },
    })
  }

  if (reliefwebRes.status === 'fulfilled' && reliefwebRes.value.ok) {
    reliefweb = await reliefwebRes.value.json()
    await recordFeedHealth({
      feedId: 'reliefweb',
      label: 'ReliefWeb reports',
      ok: true,
      itemCount: reliefweb?.data?.length ?? 0,
    })
  } else {
    await recordFeedHealth({
      feedId: 'reliefweb',
      label: 'ReliefWeb reports',
      ok: false,
      error: reliefwebRes.status === 'rejected' ? String(reliefwebRes.reason) : 'HTTP error',
    })
  }

  const gdacs = gdacsEvents.status === 'fulfilled' ? gdacsEvents.value : []
  if (gdacsEvents.status === 'fulfilled') {
    await recordFeedHealth({
      feedId: 'gdacs',
      label: 'GDACS alerts',
      ok: true,
      itemCount: gdacs.length,
    })
  } else {
    await recordFeedHealth({
      feedId: 'gdacs',
      label: 'GDACS alerts',
      ok: false,
      error: String(gdacsEvents.reason),
    })
  }

  return NextResponse.json({
    lastUpdated: fetchedAt,
    fetchedAt,
    usgsWindowDays: ALERT_WINDOW_DAYS,
    usgsStarttime: usgsStart,
    gdacsEvents: gdacs,
    recentSignificantQuakes:
      usgs?.features?.map((f) => ({
        magnitude: f.properties.mag,
        place: f.properties.place,
        time: f.properties.time,
        url: f.properties.url,
        source: 'USGS',
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
