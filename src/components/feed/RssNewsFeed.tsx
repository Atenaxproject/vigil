import { format } from 'date-fns'
import { ExternalLink } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import type { RssNewsItem } from '@/lib/rss'

interface RssNewsFeedProps {
  items: RssNewsItem[]
}

export async function RssNewsFeed({ items }: RssNewsFeedProps) {
  const t = await getTranslations('news')

  if (items.length === 0) {
    return <p className="text-[16px] text-vigil-muted">{t('rssEmpty')}</p>
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <article
          key={`${item.source}-${item.link}`}
          className="rounded-card border border-slate-200 bg-white p-4"
        >
          <h3 className="text-[17px] font-medium text-vigil-ink">{item.title}</h3>
          <p className="mt-1 text-[13px] text-vigil-muted">
            {item.source}
            {item.pubDate && ` · ${format(new Date(item.pubDate), 'dd MMM yyyy')}`}
          </p>
          {item.contentSnippet && (
            <p className="mt-2 line-clamp-2 text-[16px] text-vigil-body">{item.contentSnippet}</p>
          )}
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-[16px] text-vigil-blue hover:underline"
          >
            {t('readMore')}
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </a>
        </article>
      ))}
    </div>
  )
}
