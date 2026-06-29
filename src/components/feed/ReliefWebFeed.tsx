import { format } from 'date-fns'
import { ExternalLink } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import type { ReliefWebReport } from '@/lib/reliefweb'

interface ReliefWebFeedProps {
  reports: ReliefWebReport[]
}

export async function ReliefWebFeed({ reports }: ReliefWebFeedProps) {
  const t = await getTranslations('news')

  if (reports.length === 0) {
    return <p className="text-[13px] text-vigil-muted">{t('disclaimer')}</p>
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <article key={report.id} className="rounded-card border border-slate-200 bg-white p-4">
          <h3 className="text-[15px] font-medium text-vigil-ink">{report.title}</h3>
          <p className="mt-1 text-[11px] text-vigil-muted">
            {t('source')} {report.source}
            {report.date && ` · ${format(new Date(report.date), 'dd MMM yyyy')}`}
          </p>
          <a
            href={report.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-[13px] text-vigil-blue hover:underline"
          >
            {t('readMore')}
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </a>
        </article>
      ))}
    </div>
  )
}
