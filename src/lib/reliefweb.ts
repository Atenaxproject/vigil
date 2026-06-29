export interface ReliefWebReport {
  id: string
  title: string
  date: string
  url: string
  source: string
}

interface ReliefWebResponse {
  data?: Array<{
    id: string
    fields: {
      title?: string
      date?: { created?: string }
      url?: string
      source?: Array<{ name?: string }>
    }
  }>
}

export async function getVenezuelaUpdates(limit = 10): Promise<ReliefWebReport[]> {
  try {
    const res = await fetch(
      `https://api.reliefweb.int/v1/reports?appname=vigil-crisis&filter[field]=country.iso3&filter[value]=VEN&limit=${limit}&sort[]=date:desc&fields[include][]=title&fields[include][]=date&fields[include][]=url&fields[include][]=source`,
      { next: { revalidate: 3600 } }
    )

    if (!res.ok) return []

    const data = (await res.json()) as ReliefWebResponse
    return (data.data ?? []).map((item) => ({
      id: item.id,
      title: item.fields.title ?? 'Sin título',
      date: item.fields.date?.created ?? '',
      url: item.fields.url ?? '#',
      source: item.fields.source?.[0]?.name ?? 'ReliefWeb',
    }))
  } catch {
    return []
  }
}
