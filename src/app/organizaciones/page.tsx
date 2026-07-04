import { OrganizacionesDirectory } from '@/components/organizations/OrganizacionesDirectory'
import { getApprovedOrganizations } from '@/lib/data'
import type { RegionScope } from '@/types/vigil.types'

export const dynamic = 'force-dynamic'

export default async function OrganizacionesPage({
  searchParams,
}: {
  searchParams: Promise<{ region?: string }>
}) {
  const params = await searchParams
  const regionScope: RegionScope =
    params.region === 'usa_diaspora' ? 'usa_diaspora' : 'venezuela'
  const organizations = await getApprovedOrganizations(regionScope)

  return <OrganizacionesDirectory organizations={organizations} regionScope={regionScope} />
}
