export interface HdxDataset {
  id: string
  title: string
  notes: string
  url: string
}

interface HdxResponse {
  result?: {
    results?: Array<{
      id: string
      title: string
      notes?: string
      name: string
    }>
  }
}

export async function getVenezuelaDatasets(): Promise<HdxDataset[]> {
  try {
    const res = await fetch(
      'https://data.humdata.org/api/3/action/package_search?q=venezuela+earthquake&rows=10',
      { next: { revalidate: 86400 } }
    )

    if (!res.ok) return []

    const data = (await res.json()) as HdxResponse
    return (data.result?.results ?? []).map((pkg) => ({
      id: pkg.id,
      title: pkg.title,
      notes: pkg.notes ?? '',
      url: `https://data.humdata.org/dataset/${pkg.name}`,
    }))
  } catch {
    return []
  }
}
