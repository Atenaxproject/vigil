import { getApprovedOrganizations } from '@/lib/data'
import { OrganizacionesDirectory } from '@/components/organizations/OrganizacionesDirectory'

export const dynamic = 'force-dynamic'

export default async function OrganizacionesPage() {
  const organizations = await getApprovedOrganizations()

  return <OrganizacionesDirectory organizations={organizations} />
}
