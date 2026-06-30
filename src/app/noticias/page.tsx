import { getTranslations } from 'next-intl/server'
import { ReliefWebFeed } from '@/components/feed/ReliefWebFeed'
import { RssNewsFeed } from '@/components/feed/RssNewsFeed'
import { getVenezuelaUpdates } from '@/lib/reliefweb'
import { getVenezuelaNews } from '@/lib/rss'

export const dynamic = 'force-dynamic'

export default async function NoticiasPage() {
  const t = await getTranslations('news')
  const [reports, rssItems] = await Promise.all([getVenezuelaUpdates(15), getVenezuelaNews(8)])

  return (
    <div className="mx-auto max-w-3xl p-4">
      <h1 className="font-display text-[26px] font-semibold text-vigil-ink">{t('title')}</h1>
      <p className="mt-1 text-[16px] text-vigil-muted">{t('subtitle')}</p>

      <section className="mt-6">
        <h2 className="text-[20px] font-semibold text-vigil-ink">{t('officialTier')}</h2>
        <p className="mt-1 text-[13px] text-vigil-muted">{t('officialTierNote')}</p>
        <div className="mt-4">
          <ReliefWebFeed reports={reports} />
        </div>
      </section>

      <section className="mt-10 border-t border-slate-200 pt-8">
        <h2 className="text-[20px] font-semibold text-vigil-ink">{t('rssTier')}</h2>
        <p className="mt-1 text-[13px] text-status-unverified">{t('rssDisclaimer')}</p>
        <div className="mt-4">
          <RssNewsFeed items={rssItems} />
        </div>
      </section>

      <p className="mt-6 text-[13px] text-vigil-muted">{t('disclaimer')}</p>
    </div>
  )
}
