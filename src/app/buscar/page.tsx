import { MissingPersonSearch } from '@/components/missing/MissingPersonSearch'
import { getRecentMissingPersons } from '@/lib/data'

export const dynamic = 'force-dynamic'

export default async function BuscarPage() {
  const recent = await getRecentMissingPersons(20)
  return (
    <div className="mx-auto max-w-2xl bg-white">
      <MissingPersonSearch initialResults={recent} />
    </div>
  )
}
