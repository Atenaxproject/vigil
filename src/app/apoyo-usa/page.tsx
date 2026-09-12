import { ApoyoUsaHub } from '@/components/diaspora/ApoyoUsaHub'
import { getApprovedOrganizations, getMapMarkers } from '@/lib/data'
import { buildBasemapUrl, readCartoApiKey } from '@/lib/basemap'

export const dynamic = 'force-dynamic'

export default async function ApoyoUsaPage() {
  const [markers, organizations] = await Promise.all([
    getMapMarkers('usa_diaspora'),
    getApprovedOrganizations('usa_diaspora'),
  ])

  return (
    <ApoyoUsaHub
      markers={markers}
      organizations={organizations}
      tileUrl={buildBasemapUrl(readCartoApiKey())}
    />
  )
}
