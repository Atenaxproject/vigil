import { getTranslations } from 'next-intl/server'
import { ReliefWebFeed } from '@/components/feed/ReliefWebFeed'
import { getVenezuelaUpdates } from '@/lib/reliefweb'

export const dynamic = 'force-dynamic'

export default async function NoticiasPage() {
  const t = await getTranslations('news')
  const reports = await getVenezuelaUpdates(15)

  return (
    <div className="mx-auto max-w-3xl p-4">
      <h1 className="font-display text-2xl font-semibold text-vigil-ink">{t('title')}</h1>
      <p className="mt-1 text-[13px] text-vigil-muted">{t('subtitle')}</p>
      <div className="mt-6">
        <ReliefWebFeed reports={reports} />
      </div>
      <p className="mt-6 text-[11px] text-vigil-muted">{t('disclaimer')}</p>
    </div>
  )
}
