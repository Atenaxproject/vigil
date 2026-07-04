import { MissingPersonSearch } from '@/components/missing/MissingPersonSearch'
import { getRecentMissingPersons } from '@/lib/data'
import { isAnthropicConfigured } from '@/lib/ai/client'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

export default async function BuscarPage() {
  const t = await getTranslations('missing')
  const recent = await getRecentMissingPersons(20)
  const aiAvailable = isAnthropicConfigured()
  return (
    <div className="mx-auto w-full max-w-5xl bg-white">
      <h1 className="sr-only">{t('title')}</h1>
      <MissingPersonSearch initialResults={recent} aiAvailable={aiAvailable} fullWidth />
    </div>
  )
}
