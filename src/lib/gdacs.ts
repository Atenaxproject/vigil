export interface GDACSEvent {
  title: string
  alertLevel: string
  eventType: string
  date: string
  url: string
  lat: number | null
  lng: number | null
  severity: number | null
}

interface GDACSFeature {
  geometry?: { coordinates?: [number, number] }
  properties: {
    eventname?: string
    name?: string
    alertlevel?: string
    eventtype?: string
    fromdate?: string
    url?: { report?: string }
    severitydata?: { severity?: number }
  }
}

interface GDACSResponse {
  features?: GDACSFeature[]
}

export async function getGDACSEvents(): Promise<GDACSEvent[]> {
  try {
    const res = await fetch(
      'https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH?eventtypes=EQ&country=Venezuela',
      { next: { revalidate: 600 } }
    )
    if (!res.ok) return []

    const data = (await res.json()) as GDACSResponse
    return (
      data.features?.map((f) => ({
        title: f.properties.eventname || f.properties.name || 'Earthquake in Venezuela',
        alertLevel: f.properties.alertlevel ?? 'Green',
        eventType: f.properties.eventtype ?? 'EQ',
        date: f.properties.fromdate ?? '',
        url: f.properties.url?.report ?? 'https://www.gdacs.org',
        lat: f.geometry?.coordinates?.[1] ?? null,
        lng: f.geometry?.coordinates?.[0] ?? null,
        severity: f.properties.severitydata?.severity ?? null,
      })) ?? []
    )
  } catch {
    return []
  }
}
