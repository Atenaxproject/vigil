import { MissingPersonSearch } from '@/components/missing/MissingPersonSearch'
import { getRecentMissingPersons } from '@/lib/data'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

export default async function BuscarPage() {
  const t = await getTranslations('missing')
  const recent = await getRecentMissingPersons(20)
  return (
    <div className="mx-auto max-w-2xl bg-white">
      <h1 className="sr-only">{t('title')}</h1>
      <MissingPersonSearch initialResults={recent} />
    </div>
  )
}
